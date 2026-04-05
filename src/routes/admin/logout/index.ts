import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async (event) => {
  event.cookie.delete("auth_session", { path: "/" });
  throw event.redirect(302, "/admin/login/");
};
