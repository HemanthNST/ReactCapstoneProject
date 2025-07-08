import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/config/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("profilePicture") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Get token from cookies
    const refreshToken = request.cookies.get("session")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    const payload = jwt.verify(
      refreshToken,
      process.env.NEXT_PUBLIC_SESSION_SECRET as string
    ) as { uuid: string };

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Update user profile picture in database
    await db
      .update(users)
      .set({ profilePicture: base64 })
      .where(eq(users.uuid, payload.uuid));

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: base64,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
