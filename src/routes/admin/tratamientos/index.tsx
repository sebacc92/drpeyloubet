import { $, component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { getDb, treatments, treatmentBeforeAfter } from "~/db";
import { eq, asc } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import {
  LuImage,
  LuUpload,
  LuTrash2,
  LuCheck,
  LuX,
  LuLoader2,
  LuPlus,
  LuSparkles,
  LuActivity,
  LuSyringe,
} from "@qwikest/icons/lucide";

// ─── Types ───────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  estetica: "Cirugía Estética",
  reparadora: "Cirugía Reparadora",
  no_quirurgica: "No Quirúrgico",
};

// ─── Loader ──────────────────────────────────────────────
export const useAdminTreatments = routeLoader$(async (event) => {
  const db = getDb(event.env);

  const allTreatments = await db
    .select()
    .from(treatments)
    .orderBy(asc(treatments.displayOrder));

  // Fetch before/after for each treatment
  const treatmentsWithImages = await Promise.all(
    allTreatments.map(async (t) => {
      const images = await db
        .select()
        .from(treatmentBeforeAfter)
        .where(eq(treatmentBeforeAfter.treatmentId, t.id))
        .orderBy(asc(treatmentBeforeAfter.displayOrder));
      return { ...t, beforeAfterImages: images };
    })
  );

  return treatmentsWithImages;
});

// ─── Server Functions ────────────────────────────────────
const uploadMainImage = server$(async function (slug: string, base64Data: string, fileName: string, mimeType: string) {
  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Invalid slug");
  }

  const blobToken = this.env.get("BLOB_READ_WRITE_TOKEN");
  if (!blobToken) throw new Error("BLOB_READ_WRITE_TOKEN not configured");

  const db = getDb(this.env);
  const [treatment] = await db
    .select({ id: treatments.id })
    .from(treatments)
    .where(eq(treatments.slug, slug))
    .limit(1);

  if (!treatment) throw new Error("Treatment not found");

  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, "base64");
  const ext = fileName.split(".").pop() || "webp";

  const blob = await put(`treatments/${slug}/main.${ext}`, buffer, {
    access: "public",
    token: blobToken,
    contentType: mimeType,
    addRandomSuffix: false,
  });

  await db
    .update(treatments)
    .set({ mainImageUrl: blob.url })
    .where(eq(treatments.slug, slug));

  return blob.url;
});

const uploadBeforeAfter = server$(async function (
  slug: string,
  beforeBase64: string,
  beforeName: string,
  beforeMime: string,
  afterBase64: string,
  afterName: string,
  afterMime: string,
  caption: string
) {
  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Invalid slug");
  }

  const blobToken = this.env.get("BLOB_READ_WRITE_TOKEN");
  if (!blobToken) throw new Error("BLOB_READ_WRITE_TOKEN not configured");

  const db = getDb(this.env);
  const [treatment] = await db
    .select({ id: treatments.id })
    .from(treatments)
    .where(eq(treatments.slug, slug))
    .limit(1);

  if (!treatment) throw new Error("Treatment not found");

  const timestamp = Date.now();
  const beforeExt = beforeName.split(".").pop() || "webp";
  const afterExt = afterName.split(".").pop() || "webp";

  const beforeBuffer = Buffer.from(beforeBase64, "base64");
  const afterBuffer = Buffer.from(afterBase64, "base64");

  const [beforeBlob, afterBlob] = await Promise.all([
    put(`treatments/${slug}/before-after/${timestamp}-before.${beforeExt}`, beforeBuffer, {
      access: "public",
      token: blobToken,
      contentType: beforeMime,
    }),
    put(`treatments/${slug}/before-after/${timestamp}-after.${afterExt}`, afterBuffer, {
      access: "public",
      token: blobToken,
      contentType: afterMime,
    }),
  ]);

  const existing = await db
    .select({ displayOrder: treatmentBeforeAfter.displayOrder })
    .from(treatmentBeforeAfter)
    .where(eq(treatmentBeforeAfter.treatmentId, treatment.id));

  const maxOrder = existing.reduce((max, row) => Math.max(max, row.displayOrder ?? 0), 0);

  await db.insert(treatmentBeforeAfter).values({
    treatmentId: treatment.id,
    beforeImageUrl: beforeBlob.url,
    afterImageUrl: afterBlob.url,
    caption: caption || null,
    displayOrder: maxOrder + 1,
  });

  return { beforeUrl: beforeBlob.url, afterUrl: afterBlob.url };
});

const deleteBeforeAfter = server$(async function (recordId: number) {
  if (typeof recordId !== "number" || recordId <= 0) {
    throw new Error("Invalid ID");
  }

  const blobToken = this.env.get("BLOB_READ_WRITE_TOKEN");
  if (!blobToken) throw new Error("BLOB_READ_WRITE_TOKEN not configured");

  const db = getDb(this.env);
  const [record] = await db
    .select()
    .from(treatmentBeforeAfter)
    .where(eq(treatmentBeforeAfter.id, recordId))
    .limit(1);

  if (!record) throw new Error("Record not found");

  try {
    await Promise.all([
      del(record.beforeImageUrl, { token: blobToken }),
      del(record.afterImageUrl, { token: blobToken }),
    ]);
  } catch {
    // Images may already be deleted, continue
  }

  await db
    .delete(treatmentBeforeAfter)
    .where(eq(treatmentBeforeAfter.id, recordId));

  return { success: true };
});

// ─── Helper: file to base64 ─────────────────────────────
const fileToBase64 = $(async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:mime;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
});

// ─── Component ───────────────────────────────────────────
export default component$(() => {
  const data = useAdminTreatments();
  const expandedId = useSignal<number | null>(null);
  const uploading = useSignal<string | null>(null); // slug being uploaded to
  const uploadingBA = useSignal<string | null>(null); // slug for before/after upload
  const deletingId = useSignal<number | null>(null);
  const toast = useSignal<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = $((type: "success" | "error", msg: string) => {
    toast.value = { type, msg };
    setTimeout(() => {
      toast.value = null;
    }, 3000);
  });

  return (
    <>
      {/* Toast */}
      {toast.value && (
        <div class="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div
            class={[
              "px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-white",
              toast.value.type === "success" ? "bg-emerald-600" : "bg-red-600",
            ]}
          >
            {toast.value.type === "success" ? (
              <LuCheck class="w-4 h-4" />
            ) : (
              <LuX class="w-4 h-4" />
            )}
            <span class="text-sm font-semibold">{toast.value.msg}</span>
          </div>
        </div>
      )}

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Gestión de Tratamientos</h1>
        <p class="text-sm text-slate-500 mt-1">
          Administrá las imágenes principales y fotos de antes/después de cada tratamiento.
        </p>
      </div>

      <div class="space-y-4">
        {data.value.map((treatment) => {
          const isExpanded = expandedId.value === treatment.id;
          const catLabel = CATEGORY_LABELS[treatment.category] || treatment.category;

          return (
            <div
              key={treatment.id}
              class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden"
            >
              {/* Header */}
              <button
                type="button"
                onClick$={() => {
                  expandedId.value = isExpanded ? null : treatment.id;
                }}
                class="w-full flex items-center gap-4 p-5 text-left hover:bg-stone-50 transition-colors cursor-pointer"
              >
                {/* Thumbnail */}
                <div class="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                  {treatment.mainImageUrl ? (
                    <img
                      src={treatment.mainImageUrl}
                      alt={treatment.name}
                      width={56}
                      height={56}
                      class="w-full h-full object-cover"
                    />
                  ) : (
                    <div class="text-slate-300">
                      {treatment.category === "estetica" && <LuSparkles class="w-5 h-5" />}
                      {treatment.category === "reparadora" && <LuActivity class="w-5 h-5" />}
                      {treatment.category === "no_quirurgica" && <LuSyringe class="w-5 h-5" />}
                    </div>
                  )}
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-slate-900 truncate">{treatment.name}</h3>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-xs text-slate-400">{catLabel}</span>
                    <span class="text-xs text-slate-300">•</span>
                    <span class="text-xs text-slate-400">
                      {treatment.beforeAfterImages.length} caso(s) antes/después
                    </span>
                    {treatment.isFeatured && (
                      <>
                        <span class="text-xs text-slate-300">•</span>
                        <span class="text-xs text-amber-600 font-semibold">Destacado</span>
                      </>
                    )}
                  </div>
                </div>

                <svg
                  class={[
                    "w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0",
                    isExpanded ? "rotate-180" : "",
                  ]}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width={2}
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div class="border-t border-slate-100 p-6 space-y-8">
                  {/* ─── Main Image ─── */}
                  <div>
                    <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <LuImage class="w-4 h-4" />
                      Imagen Principal
                    </h4>
                    <div class="flex items-start gap-6">
                      <div class="w-40 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                        {treatment.mainImageUrl ? (
                          <img
                            src={treatment.mainImageUrl}
                            alt={treatment.name}
                            width={160}
                            height={112}
                            class="w-full h-full object-cover"
                          />
                        ) : (
                          <span class="text-xs text-slate-300 text-center px-4">Sin imagen</span>
                        )}
                      </div>
                      <div>
                        <label class="inline-flex items-center gap-2 cursor-pointer rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
                          {uploading.value === treatment.slug ? (
                            <LuLoader2 class="w-4 h-4 animate-spin" />
                          ) : (
                            <LuUpload class="w-4 h-4" />
                          )}
                          {treatment.mainImageUrl ? "Reemplazar" : "Subir Imagen"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            class="hidden"
                            onChange$={async (e) => {
                              const input = e.target as HTMLInputElement;
                              const file = input.files?.[0];
                              if (!file) return;
                              if (file.size > 10 * 1024 * 1024) {
                                showToast("error", "Archivo demasiado grande (máx 10MB)");
                                return;
                              }
                              uploading.value = treatment.slug;
                              try {
                                const base64 = await fileToBase64(file);
                                await uploadMainImage(treatment.slug, base64, file.name, file.type);
                                showToast("success", `Imagen actualizada para ${treatment.name}`);
                                // Reload page to see changes
                                window.location.reload();
                              } catch (err) {
                                showToast("error", `Error: ${err instanceof Error ? err.message : "Upload failed"}`);
                              } finally {
                                uploading.value = null;
                              }
                            }}
                          />
                        </label>
                        <p class="text-xs text-slate-400 mt-2">JPG, PNG, WebP o AVIF. Máx 10MB.</p>
                      </div>
                    </div>
                  </div>

                  {/* ─── Before & After ─── */}
                  <div>
                    <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <LuImage class="w-4 h-4" />
                      Casos Antes / Después ({treatment.beforeAfterImages.length})
                    </h4>

                    {/* Existing pairs */}
                    {treatment.beforeAfterImages.length > 0 && (
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {treatment.beforeAfterImages.map((pair) => (
                          <div
                            key={pair.id}
                            class="bg-stone-50 rounded-xl overflow-hidden border border-stone-200"
                          >
                            <div class="flex aspect-[2/1]">
                              <div class="w-1/2 relative border-r border-stone-200">
                                <img
                                  src={pair.beforeImageUrl}
                                  alt="Antes"
                                  width={200}
                                  height={200}
                                  class="w-full h-full object-cover"
                                />
                                <div class="absolute top-2 left-2 bg-slate-900/70 px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase">
                                  Antes
                                </div>
                              </div>
                              <div class="w-1/2 relative">
                                <img
                                  src={pair.afterImageUrl}
                                  alt="Después"
                                  width={200}
                                  height={200}
                                  class="w-full h-full object-cover"
                                />
                                <div class="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded text-[9px] font-bold text-slate-900 uppercase">
                                  Después
                                </div>
                              </div>
                            </div>
                            <div class="p-3 flex items-center justify-between">
                              <p class="text-xs text-slate-500 italic truncate flex-1">
                                {pair.caption || "Sin descripción"}
                              </p>
                              <button
                                type="button"
                                disabled={deletingId.value === pair.id}
                                onClick$={async () => {
                                  if (!confirm("¿Eliminar este caso de antes/después?")) return;
                                  deletingId.value = pair.id;
                                  try {
                                    await deleteBeforeAfter(pair.id);
                                    showToast("success", "Caso eliminado");
                                    window.location.reload();
                                  } catch (err) {
                                    showToast("error", `Error: ${err instanceof Error ? err.message : "Delete failed"}`);
                                  } finally {
                                    deletingId.value = null;
                                  }
                                }}
                                class="ml-2 p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                              >
                                {deletingId.value === pair.id ? (
                                  <LuLoader2 class="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <LuTrash2 class="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload new pair form */}
                    <div class="bg-stone-50 rounded-xl border border-dashed border-stone-300 p-5">
                      <p class="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <LuPlus class="w-4 h-4" />
                        Agregar nuevo caso
                      </p>
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label class="block text-xs font-medium text-slate-500 mb-1">Foto "Antes"</label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            id={`before-${treatment.slug}`}
                            class="w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-slate-500 mb-1">Foto "Después"</label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            id={`after-${treatment.slug}`}
                            class="w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-slate-500 mb-1">Descripción (opcional)</label>
                          <input
                            type="text"
                            id={`caption-${treatment.slug}`}
                            placeholder="Ej: Paciente femenina, 35 años"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={uploadingBA.value === treatment.slug}
                        onClick$={async () => {
                          const beforeInput = document.getElementById(`before-${treatment.slug}`) as HTMLInputElement;
                          const afterInput = document.getElementById(`after-${treatment.slug}`) as HTMLInputElement;
                          const captionInput = document.getElementById(`caption-${treatment.slug}`) as HTMLInputElement;

                          const beforeFile = beforeInput?.files?.[0];
                          const afterFile = afterInput?.files?.[0];

                          if (!beforeFile || !afterFile) {
                            showToast("error", "Seleccioná ambas fotos (antes y después)");
                            return;
                          }

                          if (beforeFile.size > 10 * 1024 * 1024 || afterFile.size > 10 * 1024 * 1024) {
                            showToast("error", "Archivo demasiado grande (máx 10MB)");
                            return;
                          }

                          uploadingBA.value = treatment.slug;
                          try {
                            const [beforeB64, afterB64] = await Promise.all([
                              fileToBase64(beforeFile),
                              fileToBase64(afterFile),
                            ]);

                            await uploadBeforeAfter(
                              treatment.slug,
                              beforeB64,
                              beforeFile.name,
                              beforeFile.type,
                              afterB64,
                              afterFile.name,
                              afterFile.type,
                              captionInput?.value || ""
                            );

                            showToast("success", "Caso antes/después agregado");
                            window.location.reload();
                          } catch (err) {
                            showToast("error", `Error: ${err instanceof Error ? err.message : "Upload failed"}`);
                          } finally {
                            uploadingBA.value = null;
                          }
                        }}
                        class="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        {uploadingBA.value === treatment.slug ? (
                          <LuLoader2 class="w-4 h-4 animate-spin" />
                        ) : (
                          <LuUpload class="w-4 h-4" />
                        )}
                        Subir Caso
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
});
