import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb, services, serviceImages } from "~/db";
import { LuArrowLeft } from "@qwikest/icons/lucide";

export const useServiceDetail = routeLoader$(async (event) => {
  const db = getDb(event.env);
  const slug = event.params.slug;

  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.slug, slug))
    .limit(1);

  if (!service) {
    throw event.error(404, "Servicio no encontrado");
  }

  const images = await db
    .select()
    .from(serviceImages)
    .where(eq(serviceImages.serviceId, service.id));

  return { service, images };
});

export default component$(() => {
  const data = useServiceDetail();
  const { service, images } = data.value;

  return (
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/servicios"
        class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-8 transition-colors"
      >
        <LuArrowLeft class="mr-2 h-4 w-4" />
        Volver a servicios
      </Link>

      <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div class="px-6 py-10 sm:px-10">
          <span class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-4">
            {service.category}
          </span>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
            {service.title}
          </h1>

          {service.contentHtml && (
            <div
              class="prose prose-slate max-w-none mb-10"
              dangerouslySetInnerHTML={service.contentHtml}
            />
          )}

          {images.length > 0 && (
            <div class="mt-12">
              <h2 class="text-2xl font-bold text-slate-900 mb-6">Galería</h2>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {images.map((img) => (
                  <div
                    key={img.id}
                    class="overflow-hidden rounded-xl bg-slate-100 aspect-[4/3]"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || service.title}
                      class="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div class="flex flex-col gap-4 border-t border-slate-100 bg-slate-50 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">
              ¿Tenés dudas sobre este procedimiento?
            </h3>
            <p class="text-sm text-slate-600">
              Contactanos por WhatsApp para recibir atención personalizada.
            </p>
          </div>
          <a
            href="https://wa.link/yourlink"
            target="_blank"
            rel="noopener noreferrer"
            class="whitespace-nowrap rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Consultar al Dr. Peyloubet
          </a>
        </div>
      </div>
    </div>
  );
});
