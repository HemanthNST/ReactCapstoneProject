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

    // Get step data for the last 7 days
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 7);

    const dataSource =
      "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps";

    const response = await fitness.users.dataset.aggregate({
      userId: "me",
      requestBody: {
        aggregateBy: [
          {
            dataTypeName: "com.google.step_count.delta",
            dataSourceId: dataSource,
          },
        ],
        bucketByTime: { durationMillis: "86400000" }, // 1 day buckets as string
        startTimeMillis: startTime.getTime().toString(),
        endTimeMillis: endTime.getTime().toString(),
      },
    });

    // Extract data from response
    const apiResponseData = response as unknown as {
      data: { bucket?: unknown[] };
    };

    // Process the step data
    interface Bucket {
      startTimeMillis: string;
      dataset?: Array<{
        point?: Array<{
          value?: Array<{ intVal?: number }>;
        }>;
      }>;
    }

    const stepData =
      (apiResponseData.data?.bucket as Bucket[])?.map(bucket => {
        const date = new Date(parseInt(bucket.startTimeMillis));
        const steps = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;

        return {
          date: date.toISOString().split("T")[0],
          steps: parseInt(steps.toString()),
        };
      }) || [];

    // Calculate total steps
    const totalSteps = stepData.reduce(
      (sum: number, day: { steps: number }) => sum + day.steps,
      0
    );

    return NextResponse.json({
      totalSteps,
      dailySteps: stepData,
      connected: true,
    });
  } catch (error) {
    console.error("Google Fit API error:", error);

    // Handle token refresh if needed
    if (error instanceof Error && error.message.includes("invalid_grant")) {
      return NextResponse.json(
        { error: "Google token expired, please reconnect" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch step data" },
      { status: 500 }
    );
  }
}
