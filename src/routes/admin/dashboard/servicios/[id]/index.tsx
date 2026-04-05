import { component$ } from "@builder.io/qwik";
import { routeLoader$, Form, routeAction$, Link } from "@builder.io/qwik-city";
import { getDbClient } from "~/db";
import { LuArrowLeft } from "@qwikest/icons/lucide";

export const useAdminServiceDetail = routeLoader$(async (requestEvent) => {
  const db = getDbClient(requestEvent.env);
  const id = requestEvent.params.id;

  const result = await db.execute({
    sql: "SELECT * FROM services WHERE id = ?",
    args: [id]
  });

  return result.rows[0];
});

export const useUpdateService = routeAction$(
  async (data, requestEvent) => {
    const db = getDbClient(requestEvent.env);
    const id = requestEvent.params.id;

    await db.execute({
      sql: "UPDATE services SET title = ?, description = ?, category = ?, content_html = ? WHERE id = ?",
      args: [data.title, data.description, data.category, data.content_html, id]
    });

    return { success: true };
  }
);

export default component$(() => {
  const service = useAdminServiceDetail();
  const updateAction = useUpdateService();

  return (
    <div class="max-w-3xl mx-auto py-6">
       <Link href="/admin/dashboard" class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-6">
        <LuArrowLeft class="mr-2 h-4 w-4" />
        Volver al listado
      </Link>

      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Editar Servicio: {service.value?.title as string}
          </h3>
          <Form action={updateAction} class="space-y-6">
            
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">Título</label>
              <input type="text" name="title" id="title" value={service.value?.title as string} class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
            </div>

            <div>
              <label for="category" class="block text-sm font-medium text-gray-700">Categoría</label>
              <select name="category" id="category" class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                <option value="Quirúrgicos" selected={service.value?.category === 'Quirúrgicos'}>Quirúrgicos</option>
                <option value="Reparadoras" selected={service.value?.category === 'Reparadoras'}>Reparadoras</option>
                <option value="No Quirúrgicos" selected={service.value?.category === 'No Quirúrgicos'}>No Quirúrgicos</option>
              </select>
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Descripción Corta</label>
              <textarea name="description" id="description" rows={3} class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">{service.value?.description as string}</textarea>
            </div>

            <div>
              <label for="content_html" class="block text-sm font-medium text-gray-700">Contenido HTML (Detalle)</label>
              <textarea name="content_html" id="content_html" rows={6} class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm border-dashed font-mono bg-slate-50">{service.value?.content_html as string}</textarea>
            </div>

            <div class="flex justify-end pt-4 border-t border-gray-200">
               <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50" disabled={updateAction.isRunning}>
                 {updateAction.isRunning ? "Guardando..." : "Guardar Cambios"}
               </button>
            </div>
          </Form>
          {updateAction.value?.success && (
            <div class="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
              Servicio actualizado correctamente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
