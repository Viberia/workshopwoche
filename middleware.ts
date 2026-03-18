// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Kein Caching von geschützten Seiten
  res.headers.set("Cache-Control", "no-store");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

if (session && path.startsWith("/login")) {
  // Rolle laden
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  const role = profile?.role;

  if (role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (role === "teacher") {
    return NextResponse.redirect(new URL("/teacher", req.url));
  }

  if (role === "student") {
    return NextResponse.redirect(new URL("/student", req.url));
  }

  // Fallback
  return NextResponse.redirect(new URL("/dashboard", req.url));
}


  // 2️⃣ Geschützte Bereiche -> Login wenn nicht eingeloggt
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/teacher");

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3️⃣ Rolle auslesen (wenn eingeloggt)
  let role: string | null = null;
  if (session) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!error && profile) role = profile.role;
  }

  // 4️⃣ Zugriffskontrolle für Admin-Bereich
  if (path.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 5️⃣ Zugriffskontrolle für Lehrer-Bereich
  if (path.startsWith("/teacher")) {
    if (role !== "teacher" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 6️⃣ Zugriffskontrolle für Student-Bereich
if (path.startsWith("/student")) {
  if (role !== "student" && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}


  // 6️⃣ Standard: Zugriff erlaubt
  return res;
}

// 7️⃣ Middleware aktivieren auf definierten Routen
export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
  ],
};
