import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { getDbClient } from "~/db";
import { LuArrowLeft } from "@qwikest/icons/lucide";

export const useServiceDetail = routeLoader$(async (requestEvent) => {
  const db = getDbClient(requestEvent.env);
  const slug = requestEvent.params.slug;

  const result = await db.execute({
    sql: "SELECT * FROM services WHERE slug = ?",
    args: [slug]
  });

  if (result.rows.length === 0) {
    throw requestEvent.error(404, "Servicio no encontrado");
  }

  const service = result.rows[0];

  const imagesResult = await db.execute({
    sql: "SELECT image_url, alt_text FROM service_images WHERE service_id = ?",
    args: [service.id]
  });

  return {
    service,
    images: imagesResult.rows
  };
});

export default component$(() => {
  const data = useServiceDetail();
  const { service, images } = data.value;

  return (
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/servicios" class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-8 transition-colors">
        <LuArrowLeft class="mr-2 h-4 w-4" />
        Volver a servicios
      </Link>

      <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div class="px-6 py-10 sm:px-10">
          <div class="flex items-center gap-3 mb-4">
            <span class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {service.category as string}
            </span>
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
            {service.title as string}
          </h1>
          
          <div class="prose prose-slate max-w-none mb-10" dangerouslySetInnerHTML={service.content_html as string} />

          {images.length > 0 && (
            <div class="mt-12">
              <h2 class="text-2xl font-bold text-slate-900 mb-6">Galería de Casos</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img, ix) => (
                  <div key={ix} class="rounded-xl overflow-hidden bg-slate-100 aspect-[4/3] relative">
                    <img
                      src={img.image_url as string}
                      alt={(img.alt_text as string) || (service.title as string)}
                      class="object-cover w-full h-full"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div class="bg-slate-50 px-6 py-8 sm:px-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">¿Tenés dudas sobre este procedimiento?</h3>
            <p class="text-sm text-slate-600">Contactanos por WhatsApp para recibir atención personalizada.</p>
          </div>
          <a
            href="https://wa.link/yourlink"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 whitespace-nowrap"
          >
            Consultar al Dr. Peyloubet
          </a>
        </div>
      </div>
    </div>
  );
});
