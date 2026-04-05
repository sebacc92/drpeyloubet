import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { LuCalendar } from '@qwikest/icons/lucide';

export const Navbar = component$(() => {
  return (
    <header class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2">
          <Link href="/" class="flex items-center gap-2">
            <span class="text-xl font-semibold text-slate-900">Dr. Rodriguez Peyloubet</span>
            <span class="hidden text-sm text-slate-500 sm:inline-block">| Cirugía Plástica</span>
          </Link>
        </div>
        
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link href="/" class="hover:text-blue-600 transition-colors">Inicio</Link>
          <Link href="/servicios" class="hover:text-blue-600 transition-colors">Servicios</Link>
        </nav>

        <div class="flex items-center">
          <a
            href="https://wa.link/yourlink"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm"
          >
            <LuCalendar class="h-4 w-4" />
            <span>Turnos</span>
          </a>
        </div>
      </div>
    </header>
  );
});
