import { $, component$, useSignal, useComputed$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  Link,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb, services, categories } from "~/db";
import {
  LuPencil,
  LuPlus,
  LuTrash2,
  LuCheck,
  LuX,
  LuTag,
  LuFilter,
} from "@qwikest/icons/lucide";

// ─── Loaders ─────────────────────────────────────────────
export const useAdminServices = routeLoader$(async (requestEvent) => {
  const db = getDb(requestEvent.env);
  const rows = await db
    .select({
      id: services.id,
      title: services.title,
      slug: services.slug,
      categoryId: services.categoryId,
      categoryName: categories.name,
    })
    .from(services)
    .leftJoin(categories, eq(services.categoryId, categories.id))
    .orderBy(categories.name, services.title);
  return rows;
});

export const useCategories = routeLoader$(async (requestEvent) => {
  const db = getDb(requestEvent.env);
  const rows = await db
    .select()
    .from(categories)
    .orderBy(categories.name);
  return rows;
});

// ─── Actions ─────────────────────────────────────────────
export const useAddCategory = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const name = (data.name as string).trim();
  const description = ((data.description as string) ?? "").trim();
  if (!name) return { error: "El nombre es obligatorio" };

  // create slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  try {
    await db.insert(categories).values({
      name,
      slug,
      description,
    });
    return { success: true };
  } catch {
    return { error: "Ya existe una categoría con ese nombre o slug" };
  }
});

export const useDeleteCategory = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const id = Number(data.categoryId);

  const usedServices = await db
    .select()
    .from(services)
    .where(eq(services.categoryId, id));

  if (usedServices.length > 0) {
    return {
      error: `No se puede eliminar: ${usedServices.length} servicio(s) usan esta categoría`,
    };
  }

  await db
    .delete(categories)
    .where(eq(categories.id, id));
  return { success: true };
});

// ─── Action: update category name & description ─────────
export const useUpdateCategory = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const id = Number(data.categoryId);
  const name = (data.name as string).trim();
  const description = ((data.description as string) ?? "").trim();

  if (!name) return { error: "El nombre es obligatorio" };

  try {
    await db
      .update(categories)
      .set({ name, description })
      .where(eq(categories.id, id));

    return { success: true };
  } catch {
    return { error: "No se pudo actualizar la categoría" };
  }
});

// ─── Component ───────────────────────────────────────────
export default component$(() => {
  const serviceList = useAdminServices();
  const categoryList = useCategories();
  const addCategoryAction = useAddCategory();
  const deleteCategoryAction = useDeleteCategory();
  const updateCategoryAction = useUpdateCategory();

  const filterCategory = useSignal<number | null>(null);

  const filteredServices = useComputed$(() => {
    if (filterCategory.value === null) return serviceList.value;
    return serviceList.value.filter((s) => s.categoryId === filterCategory.value);
  });

  const editingCategoryId = useSignal<number | null>(null);
  const editingCategoryName = useSignal("");
  const editingCategoryDesc = useSignal("");

  const startEditing = $((id: number, name: string, description: string) => {
    editingCategoryId.value = id;
    editingCategoryName.value = name;
    editingCategoryDesc.value = description;
  });

  const cancelEditing = $(() => {
    editingCategoryId.value = null;
    editingCategoryName.value = "";
    editingCategoryDesc.value = "";
  });

  const lastActionVal = updateCategoryAction.value;
  if (lastActionVal?.success && editingCategoryId.value !== null) {
    editingCategoryId.value = null;
    editingCategoryName.value = "";
    editingCategoryDesc.value = "";
  }

  return (
    <>
      {/* Toast Notificación para acciones */}
      {(addCategoryAction.value?.success || updateCategoryAction.value?.success) && (
        <div class="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div class="bg-slate-900 text-stone-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
              <LuCheck class="w-4 h-4" />
            </span>
            <span class="text-sm font-semibold tracking-wide">Guardado correctamente</span>
          </div>
        </div>
      )}

      <div class="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* ═══ Left: Services Table ═══ */}
        <div>
          <div class="mb-6 flex items-center justify-between">
            <h1 class="text-2xl font-bold text-slate-900">Servicios</h1>
            <Link
              href="/admin/servicios/nuevo"
              class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <LuPlus class="h-4 w-4" />
              Nuevo Servicio
            </Link>
          </div>

          {/* ═══ Category Filter Chips ═══ */}
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <LuFilter class="h-4 w-4 text-slate-400" />
            <button
              type="button"
              onClick$={() => { filterCategory.value = null; }}
              class={[
                "rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 border",
                filterCategory.value === null
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700",
              ]}
            >
              Todos
            </button>
            {categoryList.value.map((cat) => {
              const count = serviceList.value.filter((s) => s.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick$={() => { filterCategory.value = cat.id; }}
                  class={[
                    "rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 border",
                    filterCategory.value === cat.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700",
                  ]}
                >
                  {cat.name}
                  <span
                    class={[
                      "ml-1 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-4",
                      filterCategory.value === cat.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-400",
                    ]}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <table class="w-full text-left text-sm">
              <thead class="bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-6 py-3">Título</th>
                  <th class="px-6 py-3">Categoría</th>
                  <th class="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {filteredServices.value.map((s) => (
                  <tr key={s.id} class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 font-medium text-slate-900">
                      {s.title}
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                        {s.categoryName ?? "-"}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/servicios/${s.id}`}
                          class="inline-flex items-center gap-1 rounded-md bg-stone-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-stone-200 transition-colors"
                        >
                          <LuPencil class="h-3.5 w-3.5" />
                          Editar & Casos
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredServices.value.length === 0 && (
              <div class="p-12 text-center text-slate-400">
                {filterCategory.value
                  ? "No hay servicios en esta categoría."
                  : "No hay servicios cargados todavía."}
              </div>
            )}
          </div>
        </div>

        {/* ═══ Right: Categories Panel ═══ */}
        <div>
          <div class="mb-6 flex items-center gap-2">
            <LuTag class="h-5 w-5 text-slate-400" />
            <h2 class="text-lg font-bold text-slate-900">Categorías</h2>
          </div>

          <div class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <ul class="divide-y divide-slate-100">
              {categoryList.value.map((cat) => (
                <li
                  key={cat.id}
                  class="group px-4 py-3 transition-colors hover:bg-stone-50"
                >
                  {editingCategoryId.value === cat.id ? (
                    <Form
                      action={updateCategoryAction}
                      class="space-y-2"
                    >
                      <input type="hidden" name="categoryId" value={cat.id} />
                      <div class="flex items-center gap-2">
                        <input
                          type="text"
                          name="name"
                          value={editingCategoryName.value}
                          onInput$={(e) => {
                            editingCategoryName.value = (
                              e.target as HTMLInputElement
                            ).value;
                          }}
                          onKeyDown$={(e) => {
                            if (e.key === "Escape") cancelEditing();
                          }}
                          class="flex-1 rounded-lg border border-slate-300 px-2.5 py-1 text-sm font-medium shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
                          placeholder="Nombre de la categoría"
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={updateCategoryAction.isRunning}
                          class="rounded-lg bg-slate-900 p-1.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                          title="Guardar"
                        >
                          <LuCheck class="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick$={cancelEditing}
                          class="rounded-lg bg-slate-200 p-1.5 text-slate-600 hover:bg-slate-300 transition-colors"
                          title="Cancelar"
                        >
                          <LuX class="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div>
                        <textarea
                          name="description"
                          value={editingCategoryDesc.value}
                          onInput$={(e) => {
                            editingCategoryDesc.value = (
                              e.target as HTMLTextAreaElement
                            ).value;
                          }}
                          rows={2}
                          class="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none resize-none"
                          placeholder="Descripción breve (opcional)"
                        />
                      </div>
                    </Form>
                  ) : (
                    <div class="flex items-start gap-3">
                      <div class="flex-1 min-w-0">
                        <span class="text-sm font-medium text-slate-800">
                          {cat.name}
                        </span>
                        {cat.description && (
                          <p class="mt-0.5 text-xs text-slate-400 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick$={() => startEditing(cat.id, cat.name, cat.description ?? "")}
                          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          title="Editar categoría"
                        >
                          <LuPencil class="h-3.5 w-3.5" />
                        </button>
                        <Form action={deleteCategoryAction}>
                          <input
                            type="hidden"
                            name="categoryId"
                            value={cat.id}
                          />
                          <button
                            type="submit"
                            class="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Eliminar categoría"
                          >
                            <LuTrash2 class="h-3.5 w-3.5" />
                          </button>
                        </Form>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {categoryList.value.length === 0 && (
              <div class="p-8 text-center text-slate-400 text-sm">
                No hay categorías definidas.
              </div>
            )}

            {updateCategoryAction.value?.error && (
              <div class="mx-4 mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {updateCategoryAction.value.error}
              </div>
            )}

            {deleteCategoryAction.value?.error && (
              <div class="mx-4 mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {deleteCategoryAction.value.error}
              </div>
            )}

            <div class="border-t border-slate-100 p-4">
              <Form
                action={addCategoryAction}
                class="space-y-2"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nueva categoría..."
                    class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={addCategoryAction.isRunning}
                    class="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <LuPlus class="h-4 w-4" />
                    Agregar
                  </button>
                </div>
                <textarea
                  name="description"
                  placeholder="Descripción breve (opcional)"
                  rows={2}
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none resize-none"
                />
              </Form>

              {addCategoryAction.value?.error && (
                <p class="mt-2 text-xs text-red-600">
                  {addCategoryAction.value.error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
