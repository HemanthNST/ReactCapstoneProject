import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import db from "@/config/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const payload = jwt.verify(
        sessionCookie.value,
        process.env.NEXT_PUBLIC_SESSION_SECRET!,
      ) as { uuid: string };
      userId = payload.uuid;
    } catch (error) {
      console.error("Session verification failed:", error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        { status: 400 },
      );
    }
    const userData = user[0];
    if (!userData.googleAccessToken) {
      return NextResponse.json(
        { error: "Google access token not found" },
        { status: 400 },
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    oauth2Client.setCredentials({
      access_token: userData.googleAccessToken,
      refresh_token: userData.googleRefreshToken,
      expiry_date: userData.googleTokenExpiry?.getTime(),
    });

    const fitness = google.fitness({ version: "v1", auth: oauth2Client });

    // Use UTC to avoid timezone inconsistencies
    const now = new Date();
    const startTime = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 7,
      0, 0, 0, 0
    ));
    const endTime = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));

    try {
      const response = await fitness.users.dataset.aggregate({
        userId: "me",
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: "com.google.step_count.delta",
            },
          ],
          bucketByTime: {
            durationMillis: "86400000",
          },
          startTimeMillis: startTime.getTime().toString(),
          endTimeMillis: endTime.getTime().toString(),
        },
      });

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

      const today = new Date().toISOString().split("T")[0];
      const todayData = stepData.find((data) => data.date === today);
      const todaySteps = todayData?.steps || 0;
      const totalSteps = stepData.reduce((sum, day) => sum + day.steps, 0);

      return NextResponse.json({
        todaySteps,
        totalSteps,
        dailySteps: stepData,
        connected: true,
        dailyStepsGoal: 10000,
      });
    } catch (apiError: unknown) {
      console.error("Google Fit API error:", apiError);

      const error = apiError as Error & {
        response?: { status?: number };
        message?: string;
      };

      if (
        error.message?.includes("invalid_grant") ||
        error.message?.includes("unauthorized") ||
        error.response?.status === 401
      ) {
        return NextResponse.json(
          { error: "Google Fit token expired, please reconnect" },
          { status: 401 },
        );
      }

      return NextResponse.json({
        todaySteps: 0,
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
      { status: 500 },
    );
  }
}
