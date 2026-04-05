import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  Link,
  server$,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb, services, serviceImages } from "~/db";
import { LuArrowLeft, LuUpload, LuTrash2, LuLoader2 } from "@qwikest/icons/lucide";

// ─── Loader: fetch service + images ──────────────────────
export const useServiceData = routeLoader$(async (event) => {
  const db = getDb(event.env);
  const id = Number(event.params.id);

  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);

  if (!service) {
    throw event.error(404, "Servicio no encontrado");
  }

  const images = await db
    .select()
    .from(serviceImages)
    .where(eq(serviceImages.serviceId, id));

  return { service, images };
});

// ─── Action: update service fields ───────────────────────
export const useUpdateService = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const id = Number(event.params.id);

  await db
    .update(services)
    .set({
      title: data.title as string,
      description: data.description as string,
      category: data.category as string,
      contentHtml: data.content_html as string,
    })
    .where(eq(services.id, id));

  return { success: true };
});

// ─── Action: delete an image ─────────────────────────────
export const useDeleteImage = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const imageId = Number(data.imageId);

  await db.delete(serviceImages).where(eq(serviceImages.id, imageId));

  return { success: true };
});

// ─── Server function: save uploaded image URL to DB ──────
export const saveImageToDb = server$(async function (
  serviceId: number,
  imageUrl: string,
  altText: string
) {
  const db = getDb(this.env);

  await db.insert(serviceImages).values({
    serviceId,
    imageUrl,
    altText,
  });

  return { success: true };
});

// ─── Component ───────────────────────────────────────────
export default component$(() => {
  const data = useServiceData();
  const updateAction = useUpdateService();
  const deleteImageAction = useDeleteImage();
  const { service, images: initialImages } = data.value;

  const uploading = useSignal(false);
  const uploadError = useSignal("");
  const galleryImages = useSignal(initialImages);

  // Keep gallery in sync with loader (e.g. after delete)
  useVisibleTask$(({ track }) => {
    track(() => data.value.images);
    galleryImages.value = data.value.images;
  });

  const handleUpload = $(async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading.value = true;
    uploadError.value = "";

    try {
      const { upload } = await import("@vercel/blob/client");

      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      // Save to DB via server$
      await saveImageToDb(service.id, blob.url, service.title);

      // Optimistic update
      galleryImages.value = [
        ...galleryImages.value,
        {
          id: Date.now(), // temp ID
          serviceId: service.id,
          imageUrl: blob.url,
          altText: service.title,
        },
      ];

      // Clear file input
      input.value = "";
    } catch (err) {
      uploadError.value =
        err instanceof Error ? err.message : "Error al subir la imagen";
    } finally {
      uploading.value = false;
    }
  });

  return (
    <div class="space-y-8">
      {/* ─── Back link ─── */}
      <Link
        href="/admin/"
        class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        <LuArrowLeft class="h-4 w-4" />
        Volver al listado
      </Link>

      {/* ─── Service Form ─── */}
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 class="mb-6 text-xl font-bold text-slate-900">
          Editar: {service.title}
        </h2>

        <Form action={updateAction} class="space-y-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="title" class="block text-sm font-medium text-slate-700">
                Título
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={service.title}
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label for="category" class="block text-sm font-medium text-slate-700">
                Categoría
              </label>
              <select
                name="category"
                id="category"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                {["Quirúrgicos", "Reparadoras", "No Quirúrgicos"].map((cat) => (
                  <option key={cat} value={cat} selected={service.category === cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-slate-700">
              Descripción Corta
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              {service.description}
            </textarea>
          </div>

          <div>
            <label for="content_html" class="block text-sm font-medium text-slate-700">
              Contenido HTML
            </label>
            <textarea
              name="content_html"
              id="content_html"
              rows={8}
              class="mt-1 block w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              {service.contentHtml}
            </textarea>
          </div>

          <div class="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={updateAction.isRunning}
              class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {updateAction.isRunning ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </Form>

        {updateAction.value?.success && (
          <div class="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            ✓ Servicio actualizado correctamente.
          </div>
        )}
      </div>

      {/* ─── Image Gallery ─── */}
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900">Galería de Imágenes</h2>
          <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors">
            {uploading.value ? (
              <>
                <LuLoader2 class="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <LuUpload class="h-4 w-4" />
                Subir Imagen
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              class="hidden"
              onChange$={handleUpload}
              disabled={uploading.value}
            />
          </label>
        </div>

        {uploadError.value && (
          <div class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {uploadError.value}
          </div>
        )}

        {galleryImages.value.length === 0 ? (
          <div class="rounded-lg border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
            <LuUpload class="mx-auto mb-3 h-10 w-10" />
            <p>No hay imágenes cargadas para este servicio.</p>
            <p class="mt-1 text-xs">Formatos: JPG, PNG, WebP, AVIF (máx. 10MB)</p>
          </div>
        ) : (
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {galleryImages.value.map((img) => (
              <div
                key={img.id}
                class="group relative overflow-hidden rounded-lg bg-slate-100 aspect-square"
              >
                <img
                  src={img.imageUrl}
                  alt={img.altText || ""}
                  class="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div class="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2">
                  <Form action={deleteImageAction}>
                    <input type="hidden" name="imageId" value={img.id} />
                    <button
                      type="submit"
                      class="rounded-md bg-red-600 p-1.5 text-white hover:bg-red-700 transition-colors"
                      title="Eliminar imagen"
                    >
                      <LuTrash2 class="h-4 w-4" />
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
