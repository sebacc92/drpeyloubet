import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { getDb, services, serviceCategories } from "~/db";
import { LuArrowRight, LuCheck } from "@qwikest/icons/lucide";

export const useServices = routeLoader$(async (event) => {
  const db = getDb(event.env);

  // Fetch categories in defined order
  const cats = await db
    .select()
    .from(serviceCategories)
    .orderBy(serviceCategories.sortOrder, serviceCategories.name);

  // Fetch all services
  const rows = await db
    .select()
    .from(services)
    .orderBy(services.title);

  // Group services by category, preserving category order
  const grouped = cats.map((cat) => ({
    name: cat.name,
    description: cat.description ?? "",
    items: rows.filter((r) => r.category === cat.name),
  }));

  return grouped;
});

export default component$(() => {
  const servicesData = useServices();
  const categories = servicesData.value;
  const activeFilter = useSignal<string | null>(null);

  const filteredCategories =
    activeFilter.value === null
      ? categories
      : categories.filter((c) => c.name === activeFilter.value);

  return (
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Nuestros Servicios
        </h1>
        <p class="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Conocé en detalle todo lo que podemos hacer por tu bienestar y estética.
        </p>
      </div>

      {/* ═══ Category Filter Bar ═══ */}
      <div class="sticky top-0 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 mb-12 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick$={() => {
              activeFilter.value = null;
            }}
            class={[
              "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
              activeFilter.value === null
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800",
            ]}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick$={() => {
                activeFilter.value = cat.name;
              }}
              class={[
                "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
                activeFilter.value === cat.name
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800",
              ]}
            >
              {cat.name}
              <span
                class={[
                  "ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                  activeFilter.value === cat.name
                    ? "bg-white/25 text-white"
                    : "bg-slate-200/80 text-slate-500",
                ]}
              >
                {cat.items.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Services Grid ═══ */}
      <div class="space-y-24">
        {filteredCategories.map(({ name, description, items }) => (
          <section key={name} id={name.toLowerCase().replace(/\s/g, "-")}>
            <h2 class="text-2xl font-bold text-slate-900 mb-2 border-b border-slate-200 pb-4">
              {name}
            </h2>
            {description && (
              <p class="text-slate-500 mb-8 -mt-2">{description}</p>
            )}
            {!description && <div class="mb-8" />}

            {items.length === 0 ? (
              <p class="text-slate-500 italic">No hay servicios cargados en esta categoría.</p>
            ) : (
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((service) => {
                  const highlights = (service.highlights ?? "")
                    .split("\n")
                    .map((h) => h.trim())
                    .filter(Boolean);

                  return (
                    <Link
                      key={service.slug}
                      href={`/servicios/${service.slug}`}
                      class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-blue-200"
                    >
                      {/* Card header accent */}
                      <div class="h-1 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div class="flex flex-1 flex-col p-6">
                        {/* Title */}
                        <h3 class="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                          {service.title}
                        </h3>

                        {/* Description */}
                        <p class="text-sm text-slate-500 line-clamp-2 mb-4">
                          {service.description}
                        </p>

                        {/* Highlights list */}
                        {highlights.length > 0 && (
                          <ul class="mb-5 space-y-1.5 border-t border-slate-100 pt-4">
                            {highlights.map((item) => (
                              <li
                                key={item}
                                class="flex items-start gap-2 text-sm text-slate-600"
                              >
                                <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                  <LuCheck class="h-2.5 w-2.5" />
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Spacer to push CTA to bottom */}
                        <div class="flex-1" />

                        {/* CTA */}
                        <div class="flex items-center font-medium text-blue-600 text-sm transition-colors group-hover:text-blue-700">
                          <span>Ver más detalles</span>
                          <LuArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
});
