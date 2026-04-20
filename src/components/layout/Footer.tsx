import { component$ } from '@builder.io/qwik';
import { LuMapPin, LuPhone, LuMail, LuMessageCircle } from '@qwikest/icons/lucide';

export const Footer = component$(() => {
  return (
    <footer class="bg-slate-900 text-slate-300">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── Main Content ─── */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">

          {/* ─── Contact & Info ─── */}
          <div class="py-12 space-y-6">
            <h3 class="text-lg font-serif text-white">Contacto</h3>
            <div class="space-y-4 text-sm">
              <a
                href="https://wa.me/5492235569988"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 hover:text-white transition-colors group"
              >
                <LuMessageCircle class="h-4 w-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span>WhatsApp: <span class="font-medium text-white">223 556-9988</span></span>
              </a>

              <div class="flex items-center gap-3">
                <LuPhone class="h-4 w-4 text-blue-400 shrink-0" />
                <span>Clínica Colón: <span class="font-medium text-white">(0223) 499-2606 / 07</span></span>
              </div>

              <a
                href="mailto:cirugiaplasticaclinicacolon@gmail.com"
                class="flex items-center gap-3 hover:text-white transition-colors group"
              >
                <LuMail class="h-4 w-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span class="break-all">cirugiaplasticaclinicacolon@gmail.com</span>
              </a>

              <div class="flex items-start gap-3">
                <LuMapPin class="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Bolívar 3585, 1º Piso — Mar del Plata, Buenos Aires</span>
              </div>
            </div>
          </div>

          {/* ─── Map ─── */}
          <div class="w-full overflow-hidden flex flex-col min-h-[300px] lg:min-h-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3143.606277708573!2d-57.561914!3d-38.009712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9584d94c9b9cb1f1%3A0xc3b849208a32d1f9!2sBol%C3%ADvar%203585%2C%20B7600%20Mar%20del%20Plata%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar"
              width="100%"
              height="100%"
              style="border:0;"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Consultorio Bolívar 3585"
              class="h-full w-full min-h-[300px]"
            />
          </div>

        </div>

        {/* ─── Copyright ─── */}
        <div class="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Dr. Daniel Lafranconi y Dr. Sergio Pagani. Todos los derechos reservados.
          </p>
          <p class="text-xs text-slate-500">
            Desarrollado por <a href="https://cleverisma.com" target="_blank" rel="noopener noreferrer" class="font-semibold text-rose-300 hover:text-rose-200 transition-colors">Cleverisma</a>
          </p>
        </div>
      </div>
    </footer>
  );
});
