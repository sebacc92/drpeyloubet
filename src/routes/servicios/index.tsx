import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { getDb, services, categories } from "~/db";
import { LuArrowRight } from "@qwikest/icons/lucide";

export const useServices = routeLoader$(async (event) => {
  const db = getDb(event.env);

  const cats = await db
    .select()
    .from(categories)
    .orderBy(categories.name);

  const rows = await db
    .select()
    .from(services)
    .orderBy(services.title);

  const grouped = cats.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description ?? "",
    items: rows.filter((r) => r.categoryId === cat.id),
  }));

  return grouped;
});

export default component$(() => {
  const servicesData = useServices();
  const cats = servicesData.value;
  const activeFilter = useSignal<number | null>(null);

  const filteredCategories =
    activeFilter.value === null
      ? cats
      : cats.filter((c) => c.id === activeFilter.value);

  return (
    <div class="bg-stone-50 min-h-screen">
      <div class="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h1 class="text-4xl font-serif tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">
            Nuestros Servicios
          </h1>
          <p class="mt-4 text-lg text-slate-500 max-w-2xl mx-auto font-light">
            Soluciones integrales de cirugía estética, reconstructiva y tratamientos no invasivos, diseñados para lograr la máxima armonía y naturalidad.
          </p>
        </div>

        {/* ═══ Category Filter Bar ═══ */}
        <div class="sticky top-0 z-20 -mx-6 px-6 py-4 mb-16 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
          <div class="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick$={() => { activeFilter.value = null; }}
              class={[
                "rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 border",
                activeFilter.value === null
                  ? "bg-slate-900 text-stone-50 border-slate-900 shadow-md"
                  : "bg-white text-slate-600 border-stone-200 hover:bg-stone-100",
              ]}
            >
              Todos
            </button>

            {cats.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick$={() => { activeFilter.value = cat.id; }}
                class={[
                  "rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 border",
                  activeFilter.value === cat.id
                    ? "bg-slate-900 text-stone-50 border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-stone-200 hover:bg-stone-100",
                ]}
              >
                {cat.name}
                <span
                  class={[
                    "ml-2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                    activeFilter.value === cat.id
                      ? "bg-stone-50/20 text-stone-50"
                      : "bg-slate-100 text-slate-500",
                  ]}
                >
                  {cat.items.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Services Grid ═══ */}
        <div class="space-y-32">
          {filteredCategories.map(({ id, name, description, items }) => (
            <section key={id} id={`cat-${id}`}>
              <div class="mb-12">
                <h2 class="text-3xl font-serif text-slate-900 mb-4 inline-block relative">
                  {name}
                  <span class="absolute -bottom-2 left-0 w-12 h-1 bg-amber-700/30"></span>
                </h2>
                {description && (
                  <p class="text-slate-500 max-w-3xl mt-4 leading-relaxed">{description}</p>
                )}
              </div>

              {items.length === 0 ? (
                <p class="text-slate-400 italic">Próximamente estaremos agregando opciones a esta categoría.</p>
              ) : (
                <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/servicios/${service.slug}`}
                      class="group flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-slate-200 block"
                    >
                      {/* Image header if available */}
                      {service.imageUrl ? (
                        <div class="aspect-[4/3] overflow-hidden bg-slate-100">
                          <img 
                            src={service.imageUrl} 
                            alt={service.title} 
                            loading="lazy" 
                            decoding="async" 
                            width={500}
                            height={400}
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                        </div>
                      ) : (
                        <div class="h-2 w-full bg-gradient-to-r from-slate-800 to-slate-900"></div>
                      )}

                      <div class="flex flex-1 flex-col p-8">
                        <h3 class="text-2xl font-serif text-slate-900 mb-3 group-hover:text-amber-700 transition-colors duration-300">
                          {service.title}
                        </h3>

                        <p class="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                          {service.description}
                        </p>

                        <div class="flex-1" />

                        <div class="mt-6 flex items-center font-bold tracking-wide text-slate-900 text-sm group-hover:text-amber-700 transition-colors duration-300">
                          <span>Ver Detalles</span>
                          <LuArrowRight class="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
});
