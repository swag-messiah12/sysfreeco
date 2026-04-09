/**
 * Data access layer.
 * If NEXT_PUBLIC_SUPABASE_URL is set, reads from Supabase.
 * Otherwise falls back to the static JSON file (perfect for local dev without a DB).
 */

import { Restaurant } from "./types";
import { sortByScore } from "./restaurant-utils";

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref");

export async function getRestaurants(): Promise<Restaurant[]> {
  if (SUPABASE_CONFIGURED) {
    try {
      const { createClient } = await import("./supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("indie_score", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Restaurant[];
    } catch (err) {
      console.error("[data] Supabase fetch failed, falling back to JSON:", err);
    }
  }

  // Static fallback — works with zero config
  const json = await import("../data/restaurants.json");
  return sortByScore(json.default as Restaurant[]);
}
