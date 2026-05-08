import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, manifest.json, logo.svg (asset files)
     * - any file extension (.png, .jpg, .ico, .svg, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|logo\\.svg|.*\\..*).*)",
  ],
};
