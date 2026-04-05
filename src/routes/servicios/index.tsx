import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { getDb, services, serviceCategories } from "~/db";
import { LuArrowRight } from "@qwikest/icons/lucide";

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
    items: rows.filter((r) => r.category === cat.name),
  }));

  return grouped;
});

export default component$(() => {
  const servicesData = useServices();
  const categories = servicesData.value;

  return (
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Nuestros Servicios
        </h1>
        <p class="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Conocé en detalle todo lo que podemos hacer por tu bienestar y estética.
        </p>
      </div>

      <div class="space-y-24">
        {categories.map(({ name, items }) => (
          <section key={name} id={name.toLowerCase().replace(/\s/g, "-")}>
            <h2 class="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">
              {name}
            </h2>

            {items.length === 0 ? (
              <p class="text-slate-500 italic">No hay servicios cargados en esta categoría.</p>
            ) : (
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/servicios/${service.slug}`}
                    class="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div class="p-6">
                      <h3 class="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                      <p class="text-slate-600 line-clamp-3">{service.description}</p>
                      <div class="mt-6 flex items-center font-medium text-blue-600 transition-colors group-hover:text-blue-700">
                        <span>Ver más detalles</span>
                        <LuArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
  );
});
