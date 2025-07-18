import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/config/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

// Please write get function using that below function as a reference
export async function GET(request: NextRequest) {
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

  // Use the select query
  const user = await db
    .select()
    .from(users)
    .where(eq(users.uuid, payload.uuid))
    .then(data => data[0]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(
    { dailyStepsGoal: user.dailyStepsGoal },
    { status: 200 }
  );
}

export async function PUT(request: NextRequest) {
  const { goal } = await request.json();
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
    .set({ dailyStepsGoal: goal })
    .where(eq(users.uuid, payload.uuid));

  return NextResponse.json({
    success: true,
    message: "Name updated successfully",
  });
}
