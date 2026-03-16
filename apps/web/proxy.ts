import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login");
  const isProtectedApp =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/stores") ||
    pathname.startsWith("/pos-connections") ||
    pathname.startsWith("/menus") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/recipes") ||
    pathname.startsWith("/consumption") ||
    pathname.startsWith("/recipe-calibration");

  if (!user && isProtectedApp) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/stores/:path*",
    "/pos-connections/:path*",
    "/menus/:path*",
    "/inventory/:path*",
    "/recipes/:path*",
    "/consumption/:path*",
    "/recipe-calibration/:path*",
  ],
};