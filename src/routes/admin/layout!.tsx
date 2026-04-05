import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuLayoutDashboard, LuLogOut, LuExternalLink } from "@qwikest/icons/lucide";

export default component$(() => {
  return (
    <div class="min-h-screen bg-slate-100 font-sans">
      {/* ─── Admin Navbar ─── */}
      <nav class="bg-slate-900 text-white shadow-lg">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex h-14 items-center justify-between">
            <Link
              href="/admin/"
              class="flex items-center gap-2 font-semibold text-white hover:text-blue-300 transition-colors"
            >
              <LuLayoutDashboard class="h-5 w-5" />
              Panel Admin
            </Link>

            <div class="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <LuExternalLink class="h-4 w-4" />
                Ver sitio
              </a>
              <a
                href="/admin/logout"
                class="flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <LuLogOut class="h-4 w-4" />
                Cerrar Sesión
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Slot />
      </main>
    </div>
  );
});
