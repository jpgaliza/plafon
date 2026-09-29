import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Skip auth when Supabase is not configured (dev without credentials)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard
  // to debug issues with users being randomly logged out.

  // IMPORTANT: Avoid removing getClaims() — without it, users may be
  // randomly logged out when using server-side rendering.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  const isStaticAsset =
    /\.(?:svg|png|jpg|jpeg|gif|webp|glb|gltf|bin|woff2?|ico|css|js)$/i.test(
      request.nextUrl.pathname
    );
  if (isStaticAsset) {
    return supabaseResponse;
  }

  // Intercept OTP expired or access denied errors from Supabase redirects and route cleanly to login
  const urlError = request.nextUrl.searchParams.get("error");
  const urlErrorCode = request.nextUrl.searchParams.get("error_code");
  if (urlError || urlErrorCode) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?error=expired";
    return NextResponse.redirect(url);
  }

  // Public routes that don't require authentication
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/auth",
    "/forgot-password",
    "/reset-password",
  ];
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(`${path}/`)
  );

  // If user is already authenticated and visits login/register/forgot-password, send to dashboard
  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register" ||
      request.nextUrl.pathname === "/forgot-password")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // /reset-password requires an active recovery session (created by /auth/callback)
  if (!user && request.nextUrl.pathname === "/reset-password") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?error=expired";
    return NextResponse.redirect(url);
  }

  if (!user && !isPublicPath) {
    // No user — redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
