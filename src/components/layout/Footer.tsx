import { component$ } from '@builder.io/qwik';
import { LuMapPin, LuPhone, LuMail, LuClock, LuMessageCircle } from '@qwikest/icons/lucide';

export const Footer = component$(() => {
  return (
    <footer class="bg-slate-900 py-12 text-slate-300">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 mb-12">
          
          {/* ─── Contact Info ─── */}
          <div class="space-y-8">
            <div>
              <h3 class="text-xl font-serif text-white mb-6">Información de Contacto</h3>
              <div class="space-y-4">
                <div class="flex gap-3">
                  <LuMessageCircle class="h-5 w-5 text-blue-400 shrink-0 mt-1" />
                  <div>
                    <p class="font-medium text-white">Consultas y Turnos vía WhatsApp:</p>
                    <a href="https://wa.me/5492235569988" target="_blank" rel="noopener noreferrer" class="text-slate-300 hover:text-white transition-colors">223 556-9988</a>
                  </div>
                </div>

                <div class="flex gap-3">
                  <LuPhone class="h-5 w-5 text-blue-400 shrink-0 mt-1" />
                  <div>
                    <p class="font-medium text-white">Información sobre Turnos (08:00 a 16:00 hs):</p>
                    <p class="text-slate-300">(0223) 499-2606 / 07</p>
                  </div>
                </div>

                <div class="flex gap-3">
                  <LuMail class="h-5 w-5 text-blue-400 shrink-0 mt-1" />
                  <div class="space-y-1">
                    <p class="font-medium text-white">Correos Electrónicos:</p>
                    <a href="mailto:cirugiaplasticaclinicacolon@gmail.com" class="block text-slate-300 hover:text-white transition-colors break-all">cirugiaplasticaclinicacolon@gmail.com</a>
                    <a href="mailto:sergio.pagani@clinicacolon.com.ar" class="block text-slate-300 hover:text-white transition-colors break-all">sergio.pagani@clinicacolon.com.ar</a>
                    <a href="mailto:daniel.lafranconi@clinicacolon.com.ar" class="block text-slate-300 hover:text-white transition-colors break-all">daniel.lafranconi@clinicacolon.com.ar</a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-xl font-serif text-white mb-6">Atención Administrativa</h3>
              <div class="flex gap-3">
                <LuClock class="h-5 w-5 text-blue-400 shrink-0 mt-1" />
                <div class="space-y-2">
                  <p class="font-medium text-white">Horario de secretaria:</p>
                  <p class="text-slate-300">Lunes a Jueves de 13:00 a 19:00 hs.</p>
                  <p class="text-slate-300">Viernes de 10:00 a 16:00 hs.</p>
                  <p class="text-amber-400 text-sm mt-2 font-medium">*Consultas solo con turnos programados.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* ─── Map ─── */}
          <div class="w-full rounded-2xl bg-slate-800/50 border border-slate-700 overflow-hidden flex flex-col h-full min-h-[400px]">
            <div class="p-6 shrink-0">
              <h3 class="mb-2 text-lg font-semibold text-white flex items-center gap-2">
                <LuMapPin class="h-5 w-5 text-blue-400" /> Clínica Colón
              </h3>
              <p class="text-sm">Bolívar 3585, 1º Piso, Mar del Plata, Buenos Aires.</p>
            </div>
            <div class="w-full flex-grow relative min-h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3143.606277708573!2d-57.561914!3d-38.009712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9584d94c9b9cb1f1%3A0xc3b849208a32d1f9!2sBol%C3%ADvar%203585%2C%20B7600%20Mar%20del%20Plata%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style="border:0; position:absolute; top:0; left:0;"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Consultorio Bolívar 3585"
                class="h-full w-full"
              />
            </div>
          </div>
          
        </div>
        
        {/* ─── Copyright ─── */}
        <div class="mt-8 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Dr. Daniel Lafranconi y Sergio Pagani. Todos los derechos reservados.
          </p>
          <p class="text-sm text-slate-500">
            Desarrollado por <a href="https://cleverisma.com" target="_blank" rel="noopener noreferrer" class="font-semibold text-rose-300 hover:text-rose-200 transition-colors">cleverisma</a>
          </p>
        </div>
      </div>
    </footer>
  );
});
