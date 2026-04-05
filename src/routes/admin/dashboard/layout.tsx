import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";

export const useCheckAdminSession = routeLoader$((requestEvent) => {
  const session = requestEvent.cookie.get("admin_session");
  
  if (!session || session.value !== "true") {
    throw requestEvent.redirect(302, "/admin/login");
  }

  // Si está autenticado, retornamos data útil
  return {
    isAuthenticated: true
  };
});

export default component$(() => {
  // Solo se renderiza si el loader aprueba la sesión
  useCheckAdminSession();

  return (
    <div>
      <nav class="bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <Link href="/admin/dashboard" class="font-bold text-blue-600">
                  Dashboard
                </Link>
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-slate-500 mr-4 hidden sm:inline-block">Conectado como Administrador</span>
              <a href="/" target="_blank" class="text-sm text-blue-600 hover:text-blue-800">Ver sitio público</a>
            </div>
          </div>
        </div>
      </nav>
      
      <div class="py-10">
        <header>
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold leading-tight text-gray-900">
              Administración de Contenidos
            </h1>
          </div>
        </header>
        <main>
          <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
             <Slot />
          </div>
        </main>
      </div>
    </div>
  );
});
