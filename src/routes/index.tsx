import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { LuArrowRight, LuStethoscope, LuHeartHandshake, LuSparkles } from "@qwikest/icons/lucide";

export default component$(() => {
  return (
    <>
      <section class="relative bg-slate-900 border-b-8 border-blue-600">
        <div class="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000"
            alt="Quirófano moderno"
            width={2000}
            height={1000}
            class="h-full w-full object-cover opacity-30"
            loading="eager"
            decoding="sync"
          />
        </div>

        <div class="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 lg:py-48 text-center text-white">
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-md">
            Cirugía Plástica y Reparadora en La Plata | Dr. Diego Rodriguez Peyloubet
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-lg text-slate-200">
            Tratamientos estéticos y reconstructivos de excelencia. Tu bienestar en manos de un profesional.
          </p>
          <div class="mt-10 flex justify-center gap-4">
             <a
              href="https://wa.link/yourlink"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700"
            >
              Reservar Turno por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section class="bg-blue-50 py-16">
        <div class="mx-auto max-w-4xl text-center px-4">
          <p class="text-2xl font-light italic text-slate-800 lg:text-3xl">
             "Partiendo de la máxima expresión logramos los mejores resultados"
          </p>
        </div>
      </section>

      <section class="py-24 bg-white" id="servicios">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Nuestros Servicios
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Especializados en devolverte la confianza mediante técnicas seguras y modernas.
            </p>
          </div>

          <div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            
            <Link href="/servicios#quirurgicos" class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <LuStethoscope class="h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">Quirúrgicos</h3>
              <p class="mt-4 text-slate-600">
                Intervenciones estéticas faciales y corporales aplicando técnicas quirúrgicas de vanguardia.
              </p>
              <div class="mt-6 flex items-center font-medium text-blue-600">
                <span>Ver servicios</span>
                <LuArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link href="/servicios#reparadoras" class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <LuHeartHandshake class="h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">Reparadoras</h3>
              <p class="mt-4 text-slate-600">
                Cirugía reconstructiva con el objetivo de restaurar la función y el aspecto físico normal.
              </p>
              <div class="mt-6 flex items-center font-medium text-blue-600">
                <span>Ver servicios</span>
                <LuArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link href="/servicios#no-quirurgicos" class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <LuSparkles class="h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">No Quirúrgicos</h3>
              <p class="mt-4 text-slate-600">
                Tratamientos mínimamente invasivos para el rejuvenecimiento facial y corporal (Botox, rellenos).
              </p>
              <div class="mt-6 flex items-center font-medium text-blue-600">
                <span>Ver servicios</span>
                <LuArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

          </div>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Cirujano Plástico en La Plata | Dr. Rodriguez Peyloubet",
  meta: [
    {
      name: "description",
      content: "Especialista en cirugía plástica, estética y reparadora en La Plata. Reservá tu turno con el Dr. Diego Rodriguez Peyloubet.",
    },
  ],
  scripts: [
    {
      props: {
        type: "application/ld+json",
        dangerouslySetInnerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Physician",
          "name": "Dr. Diego Rodriguez Peyloubet",
          "image": "https://yourwebsite.com/logo.png",
          "url": "https://yourwebsite.com",
          "telephone": "+5492210000000",
          "address": [
            {
              "@type": "PostalAddress",
              "streetAddress": "Calle 10 N 1234",
              "addressLocality": "La Plata",
              "addressRegion": "Buenos Aires",
              "addressCountry": "AR"
            },
            {
               "@type": "PostalAddress",
               "streetAddress": "Calle 59 N 432",
               "addressLocality": "La Plata",
               "addressRegion": "Buenos Aires",
               "addressCountry": "AR"
            }
          ]
        })
      }
    }
  ],
};
