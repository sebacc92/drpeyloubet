import { component$ } from '@builder.io/qwik';
import { LuMapPin, LuInstagram, LuMail } from '@qwikest/icons/lucide';

export const Footer = component$(() => {
  return (
    <footer class="bg-slate-900 py-12 text-slate-300">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* Consultorio Calle 10 */}
          <div class="rounded-2xl bg-slate-800/50 border border-slate-700 overflow-hidden">
            <div class="p-6">
              <h3 class="mb-2 text-lg font-semibold text-white flex items-center gap-2">
                <LuMapPin class="h-5 w-5 text-blue-400" /> Consultorio Calle 10
              </h3>
              <p class="text-sm">Calle 10 N° 1234 e/ 57 y 58, La Plata, Buenos Aires.</p>
            </div>
            <div class="aspect-video w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.4!2d-57.9518493!3d-34.9204836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a2e6256dd1ce45%3A0x5c1baf14b69a1c!2sC.+10+1121%2C+B1906+ELW%2C+Provincia+de+Buenos+Aires!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style="border:0;"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Consultorio Calle 10"
                class="h-full w-full"
              />
            </div>
          </div>

          {/* Sanatorio IPENSA */}
          <div class="rounded-2xl bg-slate-800/50 border border-slate-700 overflow-hidden">
            <div class="p-6">
              <h3 class="mb-2 text-lg font-semibold text-white flex items-center gap-2">
                <LuMapPin class="h-5 w-5 text-blue-400" /> Sanatorio IPENSA
              </h3>
              <p class="text-sm">Calle 59 N° 432 e/ 3 y 4, La Plata, Buenos Aires.</p>
            </div>
            <div class="aspect-video w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.0!2d-57.9391498!3d-34.9170916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a2e622a0dc9311%3A0xcdd4ca6846427280!2sC.+59+432%2C+B1900BSR+La+Plata%2C+Provincia+de+Buenos+Aires!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style="border:0;"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Sanatorio IPENSA"
                class="h-full w-full"
              />
            </div>
          </div>
          
        </div>
        
        {/* ─── Logo + Social + Contact + Copyright ─── */}
        <div class="mt-8 border-t border-slate-800 pt-8 flex flex-col items-center gap-5">
          <img
            src="/logo.png"
            alt="Dr. Rodriguez Peyloubet"
            width={180}
            height={36}
            class="h-9 w-auto brightness-0 invert opacity-80"
          />
          <div class="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/drpeyloubet/"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-center gap-2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 ring-1 ring-slate-700 transition-all hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-500 hover:text-white hover:ring-transparent hover:shadow-lg hover:shadow-pink-500/25"
            >
              <LuInstagram class="h-5 w-5" />
              <span>@drpeyloubet</span>
            </a>
            <a
              href="mailto:drpeyloubet@gmail.com"
              class="group inline-flex items-center gap-2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 ring-1 ring-slate-700 transition-all hover:bg-blue-600 hover:text-white hover:ring-transparent hover:shadow-lg hover:shadow-blue-500/25"
            >
              <LuMail class="h-5 w-5" />
              <span>drpeyloubet@gmail.com</span>
            </a>
          </div>
          <p class="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Dr. Diego Rodriguez Peyloubet. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
});
