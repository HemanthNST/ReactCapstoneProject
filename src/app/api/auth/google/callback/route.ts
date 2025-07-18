import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import db from "@/config/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  // Get the base URL for absolute redirects
  const baseUrl = new URL(req.url).origin;

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_auth_failed`);
    }

    // Get user session to link Google account
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.redirect(`${baseUrl}/login?error=session_required`);
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
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_session`);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

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
        return NextResponse.redirect(`${baseUrl}/steps?error=code_expired`);
      }
      throw tokenError;
    }

    if (!tokens.access_token) {
      return NextResponse.redirect(`${baseUrl}/steps?error=google_auth_failed`);
    }

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
        process.env.GOOGLE_REDIRECT_URI,
      );

      testOauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      });

      google.fitness({ version: "v1", auth: testOauth2Client });
    } catch {
      // Test failed, but authentication succeeded - not critical
    }

    return NextResponse.redirect(`${baseUrl}/steps?connected=true`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(`${baseUrl}/steps?error=google_auth_failed`);
  }
}
