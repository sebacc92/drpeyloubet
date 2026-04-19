import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  Link,
  server$,
  useNavigate,
} from "@builder.io/qwik-city";
import { eq, sql } from "drizzle-orm";
import { getDb, services, beforeAfterCases, categories } from "~/db";
import { LuArrowLeft, LuUpload, LuTrash2, LuLoader2, LuStar, LuImage } from "@qwikest/icons/lucide";

// ─── Loaders ──────────────────────────────────────────────────
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

  const cases = await db
    .select()
    .from(beforeAfterCases)
    .where(eq(beforeAfterCases.serviceId, id))
    .orderBy(sql`${beforeAfterCases.id} DESC`);

  const categoriesDb = await db
    .select()
    .from(categories)
    .orderBy(categories.name);

  return { service, cases, categories: categoriesDb };
});

// ─── Actions ──────────────────────────────────────────────────
export const useUpdateService = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const id = Number(event.params.id);

  await db
    .update(services)
    .set({
      title: data.title as string,
      slug: data.slug as string,
      categoryId: Number(data.categoryId),
      description: data.description as string,
      longText: data.longText as string,
      imageUrl: data.imageUrl as string,
      videoUrl: data.videoUrl as string,
      ctaText: (data.ctaText as string) || "Agendar Turno",
    })
    .where(eq(services.id, id));

  return { success: true };
});

export const useDeleteCase = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  await db.delete(beforeAfterCases).where(eq(beforeAfterCases.id, Number(data.caseId)));
  return { success: true };
});

export const useToggleFeatured = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const isFeatured = data.isFeatured === "true";
  await db.update(beforeAfterCases).set({ isFeatured }).where(eq(beforeAfterCases.id, Number(data.caseId)));
  return { success: true };
});

export const saveCaseToDb = server$(async function (
  serviceId: number,
  description: string,
  imageBeforeUrl: string,
  imageAfterUrl: string
) {
  const db = getDb(this.env);
  await db.insert(beforeAfterCases).values({
    serviceId,
    description,
    imageBeforeUrl,
    imageAfterUrl,
  });
  return { success: true };
});

// ─── Component ───────────────────────────────────────────
export default component$(() => {
  const data = useServiceData();
  const updateAction = useUpdateService();
  const deleteCaseAction = useDeleteCase();
  const toggleFeaturedAction = useToggleFeatured();
  const nav = useNavigate();

  const { service, cases: initialCases, categories } = data.value;

  const uploading = useSignal(false);
  const uploadError = useSignal("");
  const caseList = useSignal(initialCases);

  useVisibleTask$(({ track }) => {
    track(() => data.value.cases);
    caseList.value = data.value.cases;
  });

  // Upload Refs
  const descRef = useSignal<HTMLInputElement>();
  const inputBeforeRef = useSignal<HTMLInputElement>();
  const inputAfterRef = useSignal<HTMLInputElement>();

  const handleCreateCase = $(async () => {
    const fileBefore = inputBeforeRef.value?.files?.[0];
    const fileAfter = inputAfterRef.value?.files?.[0];
    const desc = descRef.value?.value || "";

    if (!fileBefore || !fileAfter) {
      uploadError.value = "Debes seleccionar las imágenes de ANTES y DESPUÉS.";
      return;
    }

    uploading.value = true;
    uploadError.value = "";

    try {
      const { upload } = await import("@vercel/blob/client");

      const blobBefore = await upload(`before-${Date.now()}-${fileBefore.name}`, fileBefore, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      const blobAfter = await upload(`after-${Date.now()}-${fileAfter.name}`, fileAfter, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      await saveCaseToDb(service.id, desc, blobBefore.url, blobAfter.url);
      
      // Reload route to fetch updated cases
      await nav();
      
      if (inputBeforeRef.value) inputBeforeRef.value.value = "";
      if (inputAfterRef.value) inputAfterRef.value.value = "";
      if (descRef.value) descRef.value.value = "";
    } catch (err) {
      uploadError.value = err instanceof Error ? err.message : "Error al subir imágenes";
    } finally {
      uploading.value = false;
    }
  });

  return (
    <div class="space-y-8 max-w-5xl mx-auto">
      {/* ─── Back link ─── */}
      <Link
        href="/admin/"
        class="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <LuArrowLeft class="h-4 w-4" />
        Volver a Servicios
      </Link>

      {/* ─── Service Form ─── */}
      <div class="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-200">
        <h2 class="mb-6 text-xl font-serif font-bold text-slate-900">
          Editar Servicio: {service.title}
        </h2>

        <Form action={updateAction} class="space-y-6">
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <label for="title" class="block text-sm font-medium text-slate-700">Título</label>
              <input
                type="text"
                name="title"
                id="title"
                value={service.title}
                class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
              />
            </div>
            
            <div>
              <label for="slug" class="block text-sm font-medium text-slate-700">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                id="slug"
                value={service.slug}
                class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
              />
            </div>

            <div>
              <label for="categoryId" class="block text-sm font-medium text-slate-700">Categoría</label>
              <select
                name="categoryId"
                id="categoryId"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
              >
                <option value="">Selecciona una categoría...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} selected={service.categoryId === cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label for="ctaText" class="block text-sm font-medium text-slate-700">Texto Botón (CTA)</label>
              <input
                type="text"
                name="ctaText"
                id="ctaText"
                value={service.ctaText ?? "Agendar Turno"}
                class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-slate-700">Descripción Corta (Listado)</label>
            <textarea
              name="description"
              id="description"
              rows={2}
              class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
            >{service.description ?? ""}</textarea>
          </div>

          <div>
            <label for="longText" class="block text-sm font-medium text-slate-700">Contenido Detallado HTML</label>
            <textarea
              name="longText"
              id="longText"
              rows={6}
              class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
            >{service.longText ?? ""}</textarea>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <label for="imageUrl" class="block text-sm font-medium text-slate-700">URL Imagen Cabecera</label>
              <input
                type="text"
                name="imageUrl"
                id="imageUrl"
                value={service.imageUrl ?? ""}
                placeholder="https://..."
                class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
              />
            </div>
            <div>
              <label for="videoUrl" class="block text-sm font-medium text-slate-700">URL Video Hero (Opcional)</label>
              <input
                type="text"
                name="videoUrl"
                id="videoUrl"
                value={service.videoUrl ?? ""}
                placeholder="https://..."
                class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex justify-end border-t border-slate-100 pt-6">
            <button
              type="submit"
              disabled={updateAction.isRunning}
              class="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {updateAction.isRunning ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </Form>

        {updateAction.value?.success && (
          <div class="mt-4 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-800">
            ✓ Servicio actualizado correctamente.
          </div>
        )}
      </div>

      {/* ─── Before & After Cases ─── */}
      <div class="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-200">
        <div class="mb-8">
          <h2 class="text-xl font-serif font-bold text-slate-900">Casos de Éxito (Antes y Después)</h2>
          <p class="text-slate-500 text-sm mt-1">Sube la comparativa visual de pacientes para este servicio.</p>
        </div>

        {/* ── New Case Form ── */}
        <div class="bg-stone-50 rounded-xl p-5 border border-stone-200 mb-8">
          <h3 class="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Añadir Nuevo Caso</h3>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
            <div class="lg:col-span-2">
              <label class="block text-xs font-medium text-slate-500 mb-1">Descripción del paciente/caso</label>
              <input 
                ref={descRef}
                type="text" 
                placeholder="Ej. Paciente 34 años, recuperación natural..." 
                class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Imagen ANTES</label>
              <input 
                ref={inputBeforeRef}
                type="file" 
                accept="image/*"
                class="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Imagen DESPUÉS</label>
              <input 
                ref={inputAfterRef}
                type="file" 
                accept="image/*"
                class="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>
          </div>
          
          {uploadError.value && (
            <p class="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-md">{uploadError.value}</p>
          )}

          <div class="mt-5 flex justify-end">
            <button
              onClick$={handleCreateCase}
              disabled={uploading.value}
              class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {uploading.value ? <LuLoader2 class="h-4 w-4 animate-spin" /> : <LuUpload class="h-4 w-4" />}
              {uploading.value ? "Subiendo imágenes..." : "Crear Caso"}
            </button>
          </div>
        </div>

        {/* ── Cases Grid ── */}
        {caseList.value.length === 0 ? (
          <div class="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
            <LuImage class="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p>No hay casos de éxito registrados.</p>
          </div>
        ) : (
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {caseList.value.map((c) => (
              <div key={c.id} class="group rounded-xl border border-slate-200 overflow-hidden bg-white hover:shadow-md transition-shadow">
                {/* Images side by side */}
                <div class="grid grid-cols-2 h-44 bg-slate-100">
                  <div class="relative border-r border-slate-200/50">
                    <img src={c.imageBeforeUrl} class="w-full h-full object-cover" loading="lazy" />
                    <span class="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">Antes</span>
                  </div>
                  <div class="relative">
                    <img src={c.imageAfterUrl} class="w-full h-full object-cover" loading="lazy" />
                    <span class="absolute top-2 right-2 bg-white/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">Después</span>
                  </div>
                </div>
                
                {/* Info & Actions */}
                <div class="p-4 flex flex-col gap-3">
                  <p class="text-sm text-slate-700 line-clamp-2 min-h-10">
                    {c.description || "Sin descripción adicional."}
                  </p>
                  
                  <div class="flex items-center justify-between mt-auto">
                    <Form action={toggleFeaturedAction}>
                      <input type="hidden" name="caseId" value={c.id} />
                      <input type="hidden" name="isFeatured" value={c.isFeatured ? "false" : "true"} />
                      <button 
                        type="submit" 
                        class={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-md transition-colors ${c.isFeatured ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        <LuStar class={`h-3.5 w-3.5 ${c.isFeatured ? 'fill-yellow-400' : ''}`} />
                        {c.isFeatured ? "Destacado" : "Destacar"}
                      </button>
                    </Form>

                    <Form action={deleteCaseAction}>
                      <input type="hidden" name="caseId" value={c.id} />
                      <button
                        type="submit"
                        class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar caso"
                      >
                        <LuTrash2 class="h-4 w-4" />
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
