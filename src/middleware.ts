// Redirect middleware logic has been moved to Server Component Layouts
// to avoid Edge runtime compatibility issues with MongoDB Adapter
import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  // Empty matcher so it effectively does nothing
  matcher: [],
};
