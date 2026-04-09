import { NextRequest, NextResponse } from "next/server";
import { submissionSchema } from "@/lib/validations";
import { ZodError } from "zod";

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref");

export async function POST(request: NextRequest) {
  // Only accept JSON
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 415 }
    );
  }

  // Parse body safely
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate with Zod
  let data;
  try {
    data = submissionSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      const fieldErrors = err.issues.reduce<Record<string, string>>(
        (acc, e) => {
          const field = e.path.join(".");
          acc[field] = e.message;
          return acc;
        },
        {}
      );
      return NextResponse.json(
        { error: "Validation failed", fields: fieldErrors },
        { status: 422 }
      );
    }
    throw err;
  }

  // Persist to Supabase if configured
  if (SUPABASE_CONFIGURED) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { error } = await supabase.from("submissions").insert([
        {
          name: data.name,
          address: data.address,
          city: data.city,
          website: data.website ?? null,
          phone: data.phone || null,
          notes: data.notes || null,
          email: data.email ?? null,
          status: "pending",
        },
      ]);
      if (error) throw error;
    } catch (err) {
      console.error("[POST /api/submit] Supabase insert failed:", err);
      return NextResponse.json(
        { error: "Database error. Please try again later." },
        { status: 503 }
      );
    }
  } else {
    // Dev mode — just log it
    console.log("[POST /api/submit] No Supabase configured. Submission:", data);
  }

  return NextResponse.json(
    { success: true, message: "Submission received. Thank you!" },
    { status: 201 }
  );
}
