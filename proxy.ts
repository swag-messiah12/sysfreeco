import { NextRequest, NextResponse } from "next/server";

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
// Works per-process. For production (serverless/multi-instance) swap this
// for Upstash Redis: https://github.com/upstash/ratelimit
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/submit": { max: 5, windowMs: 60 * 60 * 1000 },     // 5/hour
  "/api/restaurants": { max: 120, windowMs: 60 * 1000 },   // 120/min
};

function isRateLimited(ip: string, path: string): boolean {
  const limit = RATE_LIMITS[path];
  if (!limit) return false;

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + limit.windowMs });
    return false;
  }

  if (entry.count >= limit.max) return true;

  entry.count++;
  return false;
}

// Prune old entries every 1000 requests to prevent unbounded memory growth
let pruneCounter = 0;
function maybePrune() {
  if (++pruneCounter % 1000 !== 0) return;
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}

// ─── Proxy (Next.js 16 replacement for middleware) ────────────────────────────
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate-limit API routes
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    maybePrune();

    if (isRateLimited(ip, pathname)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "3600",
            "X-RateLimit-Limit": String(RATE_LIMITS[pathname]?.max ?? 0),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  const response = NextResponse.next();

  // Add security headers here too (belt-and-suspenders alongside next.config)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
