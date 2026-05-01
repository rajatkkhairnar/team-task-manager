import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's info.
 * Used by the client to check auth state and get user data.
 */
export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
