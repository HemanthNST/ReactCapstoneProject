import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/config/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
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

    // Update user name in database
    await db
      .update(users)
      .set({ name: name.trim() })
      .where(eq(users.uuid, payload.uuid));

    return NextResponse.json({
      success: true,
      message: "Name updated successfully",
    });
  } catch (error) {
    console.error("Error updating user name:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
