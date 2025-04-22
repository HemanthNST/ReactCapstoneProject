import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/config/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

type TokenPayload = {
  uuid: string;
  iat?: number;
  exp?: number;
};

export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get("SessionToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ valid: false });
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.NEXT_PUBLIC_SESSION_SECRET as string,
    ) as TokenPayload;

    const name = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.uuid, payload.uuid));

    if (name.length === 0) {
      const response = NextResponse.json({ valid: false });
      response.cookies.delete("SessionToken");
      return response;
    }

    const response = NextResponse.json({
      valid: true,
      userId: payload.uuid,
      name: name[0]?.name,
    });

    response.cookies.set({
      name: "SessionToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json({ valid: false });
  }
}
