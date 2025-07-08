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

    console.log("Fetching step data from Google Fit API...");

    // Get step data for the last 7 days
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 7);

    try {
      // Try to get step data from Google Fit
      const response = await fitness.users.dataset.aggregate({
        userId: "me",
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: "com.google.step_count.delta",
            },
          ],
          bucketByTime: {
            durationMillis: "86400000", // 1 day
          },
          startTimeMillis: startTime.getTime().toString(),
          endTimeMillis: endTime.getTime().toString(),
        },
      });

      console.log("Google Fit API response received");

      // Process the response
      const buckets = response.data.bucket || [];
      const stepData = buckets.map((bucket: unknown) => {
        const bucketData = bucket as {
          startTimeMillis: string;
          dataset?: Array<{
            point?: Array<{
              value?: Array<{ intVal?: number }>;
            }>;
          }>;
        };
        const date = new Date(parseInt(bucketData.startTimeMillis));
        const steps =
          bucketData.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;

        return {
          date: date.toISOString().split("T")[0],
          steps: steps,
        };
      });

      const totalSteps = stepData.reduce((sum, day) => sum + day.steps, 0);

      // Return response with hardcoded goal for streaks
      return NextResponse.json({
        totalSteps,
        dailySteps: stepData,
        connected: true,
        dailyStepsGoal: 10000, // Hardcoded goal for streaks
      });
    } catch (apiError: unknown) {
      console.error("Google Fit API error:", apiError);

      const error = apiError as Error & {
        response?: { status?: number };
        message?: string;
      };

      // Check if it's a token issue
      if (
        error.message?.includes("invalid_grant") ||
        error.message?.includes("unauthorized") ||
        error.response?.status === 401
      ) {
        return NextResponse.json(
          { error: "Google Fit token expired, please reconnect" },
          { status: 401 }
        );
      }

      // For other errors, return a message about no data
      return NextResponse.json({
        totalSteps: 0,
        dailySteps: [],
        connected: true,
        message: "No step data found in Google Fit",
        dailyStepsGoal: 10000,
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Failed to fetch step data" },
      { status: 500 }
    );
  }
}
