import { NextResponse } from "next/server";
import {
  getUserPreferenceCookiesFromProfile,
  PREFERENCE_COOKIE_OPTIONS,
} from "@/lib/preferences";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/login?verified=true";

  // Check if Supabase sent error params (e.g. otp_expired, access_denied)
  const errorParam = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  if (errorParam || errorCode) {
    return NextResponse.redirect(`${origin}/login?error=expired`);
  }

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      if (data.user) {
        const prefs = await getUserPreferenceCookiesFromProfile(
          supabase,
          data.user.id
        );
        if (prefs) {
          response.cookies.set(
            "NEXT_LOCALE",
            prefs.locale,
            PREFERENCE_COOKIE_OPTIONS
          );
          response.cookies.set(
            "NEXT_CURRENCY",
            prefs.currency,
            PREFERENCE_COOKIE_OPTIONS
          );
          response.cookies.set(
            "NEXT_THEME",
            prefs.theme,
            PREFERENCE_COOKIE_OPTIONS
          );
        }
      }
      return response;
    }
    return NextResponse.redirect(`${origin}/login?error=expired`);
  }

  // Redirect to login if missing code
  return NextResponse.redirect(`${origin}/login?error=expired`);
}
