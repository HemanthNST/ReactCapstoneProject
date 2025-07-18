import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import db from "@/config/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const payload = jwt.verify(
        sessionCookie.value,
        process.env.NEXT_PUBLIC_SESSION_SECRET!
      ) as { uuid: string };
      userId = payload.uuid;
    } catch (error) {
      console.error("Session verification failed:", error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Google tokens
    const user = await db
      .select({
        googleAccessToken: users.googleAccessToken,
        googleRefreshToken: users.googleRefreshToken,
        googleTokenExpiry: users.googleTokenExpiry,
        isGoogleFitConnected: users.isGoogleFitConnected,
      })
      .from(users)
      .where(eq(users.uuid, userId));

    if (!user.length || user[0].isGoogleFitConnected !== "true") {
      return NextResponse.json(
        { error: "Google Fit not connected" },
        { status: 400 }
      );
    }

    const userData = user[0];
    if (!userData.googleAccessToken) {
      return NextResponse.json(
        { error: "Google access token not found" },
        { status: 400 }
      );
    }

    // Set up Google OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: userData.googleAccessToken,
      refresh_token: userData.googleRefreshToken,
      expiry_date: userData.googleTokenExpiry?.getTime(),
    });

    // Create Google Fit API client
    const fitness = google.fitness({ version: "v1", auth: oauth2Client });

    try {
      // Get all available data sources
      const dataSourcesResponse = await fitness.users.dataSources.list({
        userId: "me",
      });

      const dataSources = dataSourcesResponse.data.dataSource || [];

      // Filter and categorize data sources
      const stepDataSources = dataSources.filter(
        source => source.dataType?.name === "com.google.step_count.delta"
      );

      const debugInfo = {
        totalDataSources: dataSources.length,
        stepDataSources: stepDataSources.length,
        stepSources: stepDataSources.map(source => ({
          dataStreamId: source.dataStreamId,
          dataTypeName: source.dataType?.name,
          device: source.device?.type,
          application: source.application?.name,
        })),
        allDataTypes: [
          ...new Set(dataSources.map(source => source.dataType?.name)),
        ],
        sampleDataSources: dataSources.slice(0, 5).map(source => ({
          dataStreamId: source.dataStreamId,
          dataTypeName: source.dataType?.name,
          device: source.device?.type,
        })),
      };

      return NextResponse.json({
        success: true,
        debugInfo,
      });
    } catch (apiError: unknown) {
      console.error("❌ Google Fit Debug API call failed:", apiError);
      const errorMessage =
        apiError instanceof Error ? apiError.message : "Unknown error";

      return NextResponse.json({
        success: false,
        error: errorMessage,
        debugInfo: {
          tokenExpiry: userData.googleTokenExpiry?.toISOString(),
          hasAccessToken: !!userData.googleAccessToken,
          hasRefreshToken: !!userData.googleRefreshToken,
        },
      });
    }
  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to debug Google Fit data" },
      { status: 500 }
    );
  }
}
