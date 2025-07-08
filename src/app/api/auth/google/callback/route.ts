import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import db from "@/config/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  console.log("Google OAuth callback initiated");

  // Get the base URL for absolute redirects
  const baseUrl = new URL(req.url).origin;

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    console.log("Authorization code received:", code ? "Yes" : "No");

    if (!code) {
      console.log("No authorization code found");
      return NextResponse.redirect(`${baseUrl}/login?error=google_auth_failed`);
    }

    // Get user session to link Google account
    const sessionCookie = req.cookies.get("session");
    console.log("Session cookie found:", sessionCookie ? "Yes" : "No");
    if (!sessionCookie) {
      console.log("No session cookie found");
      return NextResponse.redirect(`${baseUrl}/login?error=session_required`);
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
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_session`);
    }

    console.log("Setting up OAuth client");
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    console.log("Exchanging code for tokens");
    // Exchange code for tokens
    let tokens;
    try {
      const tokenResponse = await oauth2Client.getToken(code);
      tokens = tokenResponse.tokens;
    } catch (tokenError: unknown) {
      console.error("Token exchange failed:", tokenError);
      if (
        tokenError instanceof Error &&
        tokenError.message &&
        tokenError.message.includes("invalid_grant")
      ) {
        console.log(
          "Invalid grant error - authorization code may have been used already or expired"
        );
        return NextResponse.redirect(`${baseUrl}/dashboard?error=code_expired`);
      }
      throw tokenError;
    }

    if (!tokens.access_token) {
      console.log("No access token received");
      return NextResponse.redirect(
        `${baseUrl}/dashboard?error=google_auth_failed`
      );
    }

    console.log("Access token received, updating user in database");
    // Update user with Google tokens
    await db
      .update(users)
      .set({
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || null,
        googleTokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        isGoogleFitConnected: "true",
      })
      .where(eq(users.uuid, userId));

    // Test data source access immediately after connection
    try {
      // Set up a new OAuth client with the fresh tokens for testing
      const testOauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      testOauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      });

      const fitness = google.fitness({ version: "v1", auth: testOauth2Client });
      console.log("🔍 Testing data source access after OAuth...");

      const dataSourcesResponse = await fitness.users.dataSources.list({
        userId: "me",
      });

      const dataSources = dataSourcesResponse.data.dataSource || [];
      console.log("📊 Data sources available:", dataSources.length);

      const stepDataSources = dataSources.filter(
        source => source.dataType?.name === "com.google.step_count.delta"
      );
      console.log("👟 Step data sources:", stepDataSources.length);

      if (stepDataSources.length > 0) {
        console.log("👟 Available step data sources:");
        stepDataSources.forEach((source, index) => {
          console.log(`  ${index + 1}: ${source.dataStreamId}`);
        });
      } else {
        console.log("⚠️ No step data sources found immediately after OAuth");
      }
    } catch (testError) {
      console.log("⚠️ Could not test data sources after OAuth:", testError);
    }

    console.log("User updated successfully, redirecting to dashboard");
    return NextResponse.redirect(`${baseUrl}/dashboard?connected=true`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=google_auth_failed`
    );
  }
}
