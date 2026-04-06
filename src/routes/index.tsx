import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { LuArrowRight, LuStethoscope, LuHeartHandshake, LuSparkles, LuCheck } from "@qwikest/icons/lucide";
import { getDb, services, serviceCategories, siteSettings } from "~/db";

// ─── Loader: fetch categories + services for home ────────
export const useHomeServices = routeLoader$(async (event) => {
  const db = getDb(event.env);

  const cats = await db
    .select()
    .from(serviceCategories)
    .orderBy(serviceCategories.sortOrder);

  const allServices = await db
    .select()
    .from(services)
    .orderBy(services.title);

  return cats.map((cat) => ({
    name: cat.name,
    description: cat.description ?? "",
    slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
    services: allServices
      .filter((s) => s.category === cat.name)
      .map((s) => s.title),
  }));
});

// ─── Loader: fetch hero settings ───────────────────────
export const useHeroSettings = routeLoader$(async (event) => {
  const db = getDb(event.env);
  const rows = await db.select().from(siteSettings);
  const s: Record<string, string> = {};
  for (const r of rows) s[r.key] = r.value;

  return {
    title: s.hero_title || "Cirugía Plástica y Reparadora en La Plata | Dr. Diego Rodriguez Peyloubet",
    description: s.hero_description || "Tratamientos estéticos y reconstructivos de excelencia. Tu bienestar en manos de un profesional.",
    ctaText: s.hero_cta_text || "Reservar Turno por WhatsApp",
    quote: s.hero_quote || "Partiendo de la máxima expresión logramos los mejores resultados",
  };
});

// ─── Icons per category index ────────────────────────────
const categoryIcons = [LuStethoscope, LuHeartHandshake, LuSparkles];
const categoryColors = [
  { bg: "bg-blue-100", text: "text-blue-600", hoverBg: "group-hover:bg-blue-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600", hoverBg: "group-hover:bg-emerald-600" },
  { bg: "bg-purple-100", text: "text-purple-600", hoverBg: "group-hover:bg-purple-600" },
];

export default component$(() => {
  const homeServices = useHomeServices();
  const hero = useHeroSettings();

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
            {hero.value.title}
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-lg text-slate-200">
            {hero.value.description}
          </p>
          <div class="mt-10 flex justify-center gap-4">
             <a
              href="https://wa.me/5492216013259"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700"
            >
              {hero.value.ctaText}
            </a>
          </div>
        </div>
      </section>

      <section class="bg-blue-50 py-16">
        <div class="mx-auto max-w-4xl text-center px-4">
          <p class="text-2xl font-light italic text-slate-800 lg:text-3xl">
             "{hero.value.quote}"
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
            {homeServices.value.map((cat, i) => {
              const Icon = categoryIcons[i % categoryIcons.length];
              const colors = categoryColors[i % categoryColors.length];

              return (
                <Link
                  key={cat.name}
                  href={`/servicios#${cat.slug}`}
                  class="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:ring-blue-300/50"
                >
                  {/* Top gradient line */}
                  <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Icon */}
                  <div class={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.text} ${colors.hoverBg} group-hover:text-white transition-colors duration-300`}>
                    <Icon class="h-6 w-6" />
                  </div>

                  {/* Title */}
                  <h3 class="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {cat.name}
                  </h3>

                  {/* Description */}
                  {cat.description && (
                    <p class="mt-3 text-sm text-slate-500 leading-relaxed">
                      {cat.description}
                    </p>
                  )}

                  {/* Services list */}
                  {cat.services.length > 0 && (
                    <ul class="mt-5 space-y-2 border-t border-slate-100 pt-5">
                      {cat.services.map((name) => (
                        <li key={name} class="flex items-center gap-2 text-sm text-slate-600">
                          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                            <LuCheck class="h-3 w-3" />
                          </span>
                          {name}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Spacer */}
                  <div class="flex-1" />

                  {/* CTA */}
                  <div class="mt-6 flex items-center font-medium text-blue-600 text-sm group-hover:text-blue-700 transition-colors">
                    <span>Ver servicios</span>
                    <LuArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
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
          "telephone": "+5492216013259",
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
