// This file is deprecated - we now use a hardcoded goal of 10,000 steps for streaks
// No user-configurable goal setting is needed
//
// The streak feature uses a hardcoded goal and is implemented in:
// - /api/fitness/steps-simple/route.ts (streak calculation)
// - /steps/page.tsx (streak display)

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Goal setting is deprecated. Streaks use a hardcoded goal of 10,000 steps.",
      dailyStepsGoal: 10000,
    },
    { status: 410 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      error:
        "Goal setting is deprecated. Streaks use a hardcoded goal of 10,000 steps.",
    },
    { status: 410 }
  );
}
