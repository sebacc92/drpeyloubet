import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import {
  LuLayoutDashboard,
  LuLogOut,
  LuExternalLink,
  LuFileText,
  LuActivity,
  LuSettings,
  LuMessageCircle
} from "@qwikest/icons/lucide";

export default component$(() => {
  const loc = useLocation();

  const isNavActive = (path: string) => loc.url.pathname === path || (path !== "/admin/" && loc.url.pathname.startsWith(path));

  return (
    <div class="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* ─── Sidebar ─── */}
      <aside class="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col h-full shadow-xl z-10">
        <div class="h-16 flex items-center px-6 border-b border-slate-800">
          <Link
            href="/admin/"
            class="flex items-center gap-2 font-bold text-white text-lg tracking-wide hover:text-blue-400 transition-colors"
          >
            <LuLayoutDashboard class="h-5 w-5" />
            Panel Admin
          </Link>
        </div>

        <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {/* Contenido Section */}
          <div>
            <div class="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contenido
            </div>
            <div class="space-y-1">
              <Link
                href="/admin/contenido/"
                class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isNavActive("/admin/contenido/")
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <LuFileText class="h-4 w-4" />
                Home
              </Link>
              <Link
                href="/admin/tratamientos/"
                class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isNavActive("/admin/tratamientos/")
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <LuActivity class="h-4 w-4" />
                Tratamientos
              </Link>
            </div>
          </div>

          {/* Chatbot Section */}
          <div>
            <div class="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Asistente IA
            </div>
            <div class="space-y-1">
              <Link
                href="/admin/chatbot/config/"
                class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isNavActive("/admin/chatbot/config/")
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <LuSettings class="h-4 w-4" />
                Configuración
              </Link>
              <Link
                href="/admin/chatbot/conversaciones/"
                class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isNavActive("/admin/chatbot/conversaciones/")
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <LuMessageCircle class="h-4 w-4" />
                Conversaciones
              </Link>
            </div>
          </div>
        </nav>

        <div class="p-4 border-t border-slate-800 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LuExternalLink class="h-4 w-4" />
            Ver sitio
          </a>
          <a
            href="/admin/logout"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-900/30 hover:text-rose-200 transition-colors"
          >
            <LuLogOut class="h-4 w-4" />
            Cerrar Sesión
          </a>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main class="flex-1 overflow-y-auto relative custom-scrollbar">
        <div class="p-6 md:p-8 max-w-7xl mx-auto min-h-full">
          <Slot />
        </div>
      </main>
    </div>
  );
});
