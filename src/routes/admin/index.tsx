import { $, component$, useSignal } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  Link,
  server$,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb, services, serviceCategories } from "~/db";
import {
  LuPencil,
  LuPlus,
  LuImage,
  LuTrash2,
  LuCheck,
  LuX,
  LuGripVertical,
  LuTag,
} from "@qwikest/icons/lucide";

// ─── Loaders ─────────────────────────────────────────────
export const useAdminServices = routeLoader$(async (requestEvent) => {
  const db = getDb(requestEvent.env);
  const rows = await db
    .select()
    .from(services)
    .orderBy(services.category, services.title);
  return rows;
});

export const useCategories = routeLoader$(async (requestEvent) => {
  const db = getDb(requestEvent.env);
  const rows = await db
    .select()
    .from(serviceCategories)
    .orderBy(serviceCategories.sortOrder, serviceCategories.name);
  return rows;
});

// ─── Actions ─────────────────────────────────────────────
export const useAddCategory = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const name = (data.name as string).trim();
  if (!name) return { error: "El nombre es obligatorio" };

  try {
    // Get max sort_order
    const existing = await db
      .select()
      .from(serviceCategories)
      .orderBy(serviceCategories.sortOrder);
    const maxOrder =
      existing.length > 0
        ? Math.max(...existing.map((c) => c.sortOrder))
        : 0;

    await db.insert(serviceCategories).values({
      name,
      sortOrder: maxOrder + 1,
    });
    return { success: true };
  } catch {
    return { error: "Ya existe una categoría con ese nombre" };
  }
});

export const useDeleteCategory = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const id = Number(data.categoryId);

  // Check if any services use this category
  const cat = await db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.id, id))
    .limit(1);
  if (cat.length === 0) return { error: "Categoría no encontrada" };

  const usedServices = await db
    .select()
    .from(services)
    .where(eq(services.category, cat[0].name));

  if (usedServices.length > 0) {
    return {
      error: `No se puede eliminar: ${usedServices.length} servicio(s) usan esta categoría`,
    };
  }

  await db
    .delete(serviceCategories)
    .where(eq(serviceCategories.id, id));
  return { success: true };
});

// ─── Server functions for inline editing ─────────────────
export const updateCategoryName = server$(async function (
  id: number,
  newName: string
) {
  if (typeof id !== "number" || typeof newName !== "string") {
    throw new Error("Parámetros inválidos");
  }
  const name = newName.trim();
  if (!name) throw new Error("El nombre es obligatorio");

  const db = getDb(this.env);

  // Get old name to update related services
  const [oldCat] = await db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.id, id))
    .limit(1);

  if (!oldCat) throw new Error("Categoría no encontrada");

  // Update the category name
  await db
    .update(serviceCategories)
    .set({ name })
    .where(eq(serviceCategories.id, id));

  // Update all services referencing the old category name
  if (oldCat.name !== name) {
    await db
      .update(services)
      .set({ category: name })
      .where(eq(services.category, oldCat.name));
  }

  return { success: true };
});

// ─── Component ───────────────────────────────────────────
export default component$(() => {
  const serviceList = useAdminServices();
  const categoryList = useCategories();
  const addCategoryAction = useAddCategory();
  const deleteCategoryAction = useDeleteCategory();

  const editingCategoryId = useSignal<number | null>(null);
  const editingCategoryName = useSignal("");
  const savingCategory = useSignal(false);
  const editError = useSignal("");

  const startEditing = $((id: number, name: string) => {
    editingCategoryId.value = id;
    editingCategoryName.value = name;
    editError.value = "";
  });

  const cancelEditing = $(() => {
    editingCategoryId.value = null;
    editingCategoryName.value = "";
    editError.value = "";
  });

  const saveCategory = $(async () => {
    if (!editingCategoryId.value) return;
    savingCategory.value = true;
    editError.value = "";
    try {
      await updateCategoryName(
        editingCategoryId.value,
        editingCategoryName.value
      );
      // Force page reload to reflect updated data
      window.location.reload();
    } catch (err) {
      editError.value =
        err instanceof Error ? err.message : "Error al guardar";
    } finally {
      savingCategory.value = false;
    }
  });

  return (
    <>
      <div class="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* ═══ Left: Services Table ═══ */}
        <div>
          <div class="mb-6 flex items-center justify-between">
            <h1 class="text-2xl font-bold text-slate-900">Servicios</h1>
            <button class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
              <LuPlus class="h-4 w-4" />
              Nuevo Servicio
            </button>
          </div>

          <div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-6 py-3">Título</th>
                  <th class="px-6 py-3">Categoría</th>
                  <th class="px-6 py-3">Slug</th>
                  <th class="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {serviceList.value.map((s) => (
                  <tr key={s.id} class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 font-medium text-slate-900">
                      {s.title}
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {s.category}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-slate-400 font-mono text-xs">
                      /{s.slug}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <Link
                        href={`/admin/servicios/${s.id}`}
                        class="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <LuPencil class="h-3.5 w-3.5" />
                        Editar
                      </Link>
                      <Link
                        href={`/admin/servicios/${s.id}`}
                        class="ml-2 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <LuImage class="h-3.5 w-3.5" />
                        Fotos
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {serviceList.value.length === 0 && (
              <div class="p-12 text-center text-slate-400">
                No hay servicios cargados todavía.
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

          <div class="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            {/* Category list */}
            <ul class="divide-y divide-slate-100">
              {categoryList.value.map((cat) => (
                <li
                  key={cat.id}
                  class="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <LuGripVertical class="h-4 w-4 shrink-0 text-slate-300" />

                  {editingCategoryId.value === cat.id ? (
                    // ── Editing mode ──
                    <div class="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={editingCategoryName.value}
                        onInput$={(e) => {
                          editingCategoryName.value = (
                            e.target as HTMLInputElement
                          ).value;
                        }}
                        onKeyDown$={(e) => {
                          if (e.key === "Enter") saveCategory();
                          if (e.key === "Escape") cancelEditing();
                        }}
                        class="flex-1 rounded-md border border-blue-300 px-2.5 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick$={saveCategory}
                        disabled={savingCategory.value}
                        class="rounded-md bg-blue-600 p-1.5 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                        title="Guardar"
                      >
                        <LuCheck class="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick$={cancelEditing}
                        class="rounded-md bg-slate-200 p-1.5 text-slate-600 hover:bg-slate-300 transition-colors"
                        title="Cancelar"
                      >
                        <LuX class="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    // ── Display mode ──
                    <>
                      <span class="flex-1 text-sm font-medium text-slate-800">
                        {cat.name}
                      </span>
                      <span class="text-xs text-slate-400 tabular-nums">
                        #{cat.sortOrder}
                      </span>
                      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick$={() => startEditing(cat.id, cat.name)}
                          class="rounded-md p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
                            class="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Eliminar categoría"
                          >
                            <LuTrash2 class="h-3.5 w-3.5" />
                          </button>
                        </Form>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {categoryList.value.length === 0 && (
              <div class="p-8 text-center text-slate-400 text-sm">
                No hay categorías definidas.
              </div>
            )}

            {/* Error messages */}
            {editError.value && (
              <div class="mx-4 mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {editError.value}
              </div>
            )}

            {deleteCategoryAction.value?.error && (
              <div class="mx-4 mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {deleteCategoryAction.value.error}
              </div>
            )}

            {/* Add category form */}
            <div class="border-t border-slate-100 p-4">
              <Form
                action={addCategoryAction}
                class="flex items-center gap-2"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Nueva categoría..."
                  class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={addCategoryAction.isRunning}
                  class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <LuPlus class="h-4 w-4" />
                  Agregar
                </button>
              </Form>

              {addCategoryAction.value?.error && (
                <p class="mt-2 text-xs text-red-600">
                  {addCategoryAction.value.error}
                </p>
              )}
              {addCategoryAction.value?.success && (
                <p class="mt-2 text-xs text-emerald-600">
                  ✓ Categoría agregada correctamente.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
