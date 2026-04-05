import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb, users } from "~/db";
import { verifyPassword } from "~/lib/auth";

export const useLoginAction = routeAction$(
  async (data, requestEvent) => {
    const db = getDb(requestEvent.env);
    const { username, password } = data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return requestEvent.fail(401, { message: "Credenciales inválidas" });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return requestEvent.fail(401, { message: "Credenciales inválidas" });
    }

    // Update last_login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    // Create session cookie
    requestEvent.cookie.set("auth_session", "true", {
      httpOnly: true,
      path: "/",
      maxAge: [60 * 60 * 24, "seconds"],
    });

    throw requestEvent.redirect(302, "/admin/");
  },
  zod$({
    username: z.string().min(1, "El usuario es obligatorio"),
    password: z.string().min(1, "La contraseña es obligatoria"),
  })
);

export default component$(() => {
  const loginAction = useLoginAction();

  return (
    <div class="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-slate-900">Panel Administrador</h1>
          <p class="mt-1 text-sm text-slate-500">Dr. Rodriguez Peyloubet</p>
        </div>

        <Form action={loginAction} class="space-y-5">
          <div>
            <label for="username" class="block text-sm font-medium text-slate-700">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {loginAction.value?.failed && (
            <div class="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {loginAction.value.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loginAction.isRunning}
            class="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loginAction.isRunning ? "Ingresando..." : "Ingresar"}
          </button>
        </Form>
      </div>
    </div>
  );
});
