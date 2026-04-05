import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { getDbClient } from "~/db";
import { verifyPassword } from "~/lib/auth";

export const useLoginAction = routeAction$(
  async (data, requestEvent) => {
    const db = getDbClient(requestEvent.env);
    const { username, password } = data;

    const res = await db.execute({
      sql: "SELECT * FROM users WHERE username = ?",
      args: [username]
    });

    if (res.rows.length === 0) {
      return requestEvent.fail(401, {
        message: "Credenciales inválidas"
      });
    }

    const user = res.rows[0];
    const isMatched = await verifyPassword(password, user.password_hash as string);

    if (!isMatched) {
      return requestEvent.fail(401, {
        message: "Credenciales inválidas"
      });
    }

    // Update last_login
    await db.execute({
      sql: "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      args: [user.id]
    });

    // Create session cookie
    requestEvent.cookie.set("admin_session", "true", {
      httpOnly: true,
      path: "/",
      maxAge: [60 * 60 * 24, "seconds"] // 1 day
    });

    throw requestEvent.redirect(302, "/admin/dashboard");
  },
  zod$({
    username: z.string().min(1, "El usuario es obligatorio"),
    password: z.string().min(1, "La contraseña es obligatoria"),
  })
);

export default component$(() => {
  const loginAction = useLoginAction();

  return (
    <div class="flex min-h-[80vh] items-center justify-center p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200">
        <h1 class="text-2xl font-bold text-slate-900 mb-6 text-center">Acceso Administrador</h1>
        
        <Form action={loginAction} class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-slate-700">Usuario</label>
            <div class="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                required
                class="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            {loginAction.value?.fieldErrors?.username && (
              <p class="mt-2 text-sm text-red-600">{loginAction.value.fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700">Contraseña</label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                class="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            {loginAction.value?.fieldErrors?.password && (
              <p class="mt-2 text-sm text-red-600">{loginAction.value.fieldErrors.password}</p>
            )}
          </div>

          {loginAction.value?.failed && (
             <div class="rounded-md bg-red-50 p-4">
               <p class="text-sm text-red-800">{loginAction.value.message}</p>
             </div>
          )}

          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              disabled={loginAction.isRunning}
            >
              {loginAction.isRunning ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
