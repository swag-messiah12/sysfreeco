import { NextResponse } from "next/server";
import { getRestaurants } from "@/lib/data";

// Cache for 60 seconds — avoids hammering Supabase on every request
export const revalidate = 60;

export async function GET() {
  try {
    const restaurants = await getRestaurants();
    return NextResponse.json(restaurants, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error("[GET /api/restaurants]", err);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}
