import { component$ } from '@builder.io/qwik';
import { LuMapPin, LuPhone } from '@qwikest/icons/lucide';

export const Footer = component$(() => {
  return (
    <footer class="bg-slate-900 py-12 text-slate-300">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          <div class="rounded-2xl bg-slate-800/50 p-6 border border-slate-700">
            <h3 class="mb-4 text-lg font-semibold text-white flex items-center gap-2">
              <LuMapPin class="h-5 w-5 text-blue-400" /> Consultorio Calle 10
            </h3>
            <p class="text-sm">Calle 10 N° 1234 e/ 57 y 58, La Plata, Buenos Aires.</p>
            <a href="tel:+5492210000000" class="mt-4 flex items-center gap-2 text-sm hover:text-white transition-colors">
               <LuPhone class="h-4 w-4" /> +54 9 221 000-0000
            </a>
          </div>

          <div class="rounded-2xl bg-slate-800/50 p-6 border border-slate-700">
            <h3 class="mb-4 text-lg font-semibold text-white flex items-center gap-2">
              <LuMapPin class="h-5 w-5 text-blue-400" /> Sanatorio IPENSA
            </h3>
            <p class="text-sm">Calle 59 N° 432 e/ 3 y 4, La Plata, Buenos Aires.</p>
            <a href="tel:+5492210000001" class="mt-4 flex items-center gap-2 text-sm hover:text-white transition-colors">
               <LuPhone class="h-4 w-4" /> +54 9 221 000-0001
            </a>
          </div>
          
        </div>
        
        <div class="mt-8 border-t border-slate-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Dr. Diego Rodriguez Peyloubet. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
});
