import { component$, useSignal, $ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { LuCalendar, LuMenu, LuX } from '@qwikest/icons/lucide';

export const Navbar = component$(() => {
  const mobileOpen = useSignal(false);

  const toggleMenu = $(() => {
    mobileOpen.value = !mobileOpen.value;
  });

  const closeMenu = $(() => {
    mobileOpen.value = false;
  });

  return (
    <header class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" class="flex items-center">
          <span class="text-xl font-serif font-bold text-slate-800">
            Dr. Lafranconi & Dr. Pagani
          </span>
        </Link>

        {/* Desktop nav */}
        <nav class="hidden md:flex items-center gap-8 text-base font-medium text-slate-700">
          <Link href="/" class="relative py-1 hover:text-blue-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full">Inicio</Link>
          <Link href="/#equipo" class="relative py-1 hover:text-blue-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full">Nosotros</Link>
          <Link href="/tratamientos" class="relative py-1 hover:text-blue-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full">Tratamientos</Link>
          <a
            href="https://turnoscolon.com.ar/?sid=12&pid=49&sid=12"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-base font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 shadow-sm"
          >
            <LuCalendar class="h-5 w-5" />
            <span>Turnos</span>
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          class="md:hidden flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition-colors"
          onClick$={toggleMenu}
          aria-label="Abrir menú"
        >
          {mobileOpen.value ? (
            <LuX class="h-7 w-7" />
          ) : (
            <LuMenu class="h-7 w-7" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div
        class={[
          "md:hidden fixed inset-0 top-20 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen.value ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ]}
        onClick$={closeMenu}
      />

      {/* Mobile menu panel */}
      <div
        class={[
          "md:hidden fixed top-20 right-0 z-50 h-[calc(100vh-5rem)] w-72 bg-white shadow-2xl transition-transform duration-300 ease-out",
          mobileOpen.value ? "translate-x-0" : "translate-x-full",
        ]}
      >
        <nav class="flex flex-col p-6 gap-2">
          <Link
            href="/"
            onClick$={closeMenu}
            class="rounded-xl px-4 py-3 text-lg font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Inicio
          </Link>
          <Link
            href="/#equipo"
            onClick$={closeMenu}
            class="rounded-xl px-4 py-3 text-lg font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Nosotros
          </Link>
          <Link
            href="/tratamientos"
            onClick$={closeMenu}
            class="rounded-xl px-4 py-3 text-lg font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Tratamientos
          </Link>

          <div class="my-4 border-t border-slate-100" />

          <a
            href="https://turnoscolon.com.ar/?sid=12&pid=49&sid=12"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-lg font-semibold text-white transition-all hover:bg-blue-700 shadow-sm"
          >
            <LuCalendar class="h-5 w-5" />
            Turnos
          </a>
        </nav>
      </div>
    </header>
  );
});
