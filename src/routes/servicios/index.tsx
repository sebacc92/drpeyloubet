import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { getDbClient } from "~/db";
import { LuArrowRight } from "@qwikest/icons/lucide";

export const useServices = routeLoader$(async (requestEvent) => {
  const db = getDbClient(requestEvent.env);
  const { rows } = await db.execute("SELECT id, slug, title, description, category FROM services");
  
  // Group by category
  const categories: Record<string, any[]> = {
    "Quirúrgicos": [],
    "Reparadoras": [],
    "No Quirúrgicos": []
  };

  rows.forEach((row) => {
    if (categories[row.category as string]) {
      categories[row.category as string].push(row);
    }
  });

  return categories;
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
        {Object.entries(categories).map(([category, services]) => (
          (services.length > 0 || category !== '') && (
            <section key={category} id={category.toLowerCase().replace(" ", "-")}>
              <h2 class="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">
                {category}
              </h2>
              
              {services.length === 0 ? (
                <p class="text-slate-500 italic">No hay servicios cargados en esta categoría.</p>
              ) : (
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <Link
                      key={service.slug as string}
                      href={`/servicios/${service.slug}`}
                      class="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div class="p-6">
                        <h3 class="text-xl font-bold text-slate-900 mb-2">{service.title as string}</h3>
                        <p class="text-slate-600 line-clamp-3">
                          {service.description as string}
                        </p>
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
          )
        ))}
      </div>
    </div>
  );
});
