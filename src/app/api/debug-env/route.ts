import { NextResponse } from "next/server";

// Temporary debug endpoint — remove before production
export function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "(not set — will use Vercel backend fallback)",
    NODE_ENV: process.env.NODE_ENV,
  });
}
