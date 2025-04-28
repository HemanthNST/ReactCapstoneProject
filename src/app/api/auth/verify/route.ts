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
  const refreshToken = req.cookies.get("session")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.NEXT_PUBLIC_SESSION_SECRET as string
    ) as TokenPayload;

    const name = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.uuid, payload.uuid));

    if (name.length === 0) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      response.cookies.delete("session");
      return response;
    }

    const response = NextResponse.json(
      {
        message: "Authorized",
        userId: payload.uuid,
        name: name[0]?.name,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "session",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(`Token verification failed: ${error}`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
