import type { RequestHandler } from "@builder.io/qwik-city";

const STATIC_ASSET_RE = /\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?|ttf|eot|map)$/;

export const onRequest: RequestHandler = async (event) => {
  const path = event.url.pathname;

  // Only apply auth checks to /admin routes
  if (!path.startsWith("/admin")) {
    return;
  }

  // Allow static assets through
  if (STATIC_ASSET_RE.test(path)) {
    return;
  }

  const session = event.cookie.get("auth_session");
  const isLoginPage = path === "/admin/login" || path === "/admin/login/";

  // If user is on login page and already authenticated → redirect to admin dashboard
  if (isLoginPage && session?.value === "true") {
    throw event.redirect(302, "/admin/");
  }

  // If user is NOT on login page and NOT authenticated → redirect to login
  if (!isLoginPage && (!session || session.value !== "true")) {
    throw event.redirect(302, "/admin/login/");
  }
};
