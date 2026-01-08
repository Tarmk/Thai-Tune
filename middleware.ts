import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Simple pass-through middleware
  return NextResponse.next()
}
