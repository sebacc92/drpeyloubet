import { component$ } from "@builder.io/qwik";
import { routeLoader$, routeAction$, Form, Link } from "@builder.io/qwik-city";
import { getDb, services, categories } from "~/db";
import { LuArrowLeft } from "@qwikest/icons/lucide";

export const useCategories = routeLoader$(async (event) => {
  const db = getDb(event.env);
  return await db.select().from(categories).orderBy(categories.name);
});

export const useCreateService = routeAction$(async (data, event) => {
  const db = getDb(event.env);

  try {
    const res = await db.insert(services).values({
      title: data.title as string,
      slug: data.slug as string,
      categoryId: Number(data.categoryId),
      description: (data.description as string) || "",
      longText: "",
      ctaText: "Agendar Turno",
    }).returning({ insertedId: services.id });

    // Redirect to edit page once created
    if (res && res[0]) {
      throw event.redirect(302, `/admin/servicios/${res[0].insertedId}`);
    }
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "No se pudo crear el servicio. Revisa que el slug sea único." };
  }
});

export default component$(() => {
  const cats = useCategories();
  const createAction = useCreateService();

  return (
    <div class="space-y-8 max-w-3xl mx-auto">
      <Link
        href="/admin/"
        class="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <LuArrowLeft class="h-4 w-4" />
        Volver a Servicios
      </Link>

      <div class="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-200">
        <h2 class="mb-6 text-xl font-serif font-bold text-slate-900">
          Añadir Nuevo Servicio
        </h2>

        <Form action={createAction} class="space-y-6">
          {createAction.value?.error && (
            <div class="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {createAction.value.error}
            </div>
          )}

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <label for="title" class="block text-sm font-medium text-slate-700">Título</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
              />
            </div>

            <div>
              <label for="slug" class="block text-sm font-medium text-slate-700">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                id="slug"
                required
                placeholder="ej: lifting-facial"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label for="categoryId" class="block text-sm font-medium text-slate-700">Categoría</label>
            <select
              name="categoryId"
              id="categoryId"
              required
              class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
            >
              <option value="">Selecciona una categoría...</option>
              {cats.value.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-slate-700">Descripción Corta</label>
            <textarea
              name="description"
              id="description"
              rows={2}
              class="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex justify-end border-t border-slate-100 pt-6">
            <button
              type="submit"
              disabled={createAction.isRunning}
              class="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {createAction.isRunning ? "Creando..." : "Crear Servicio"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
