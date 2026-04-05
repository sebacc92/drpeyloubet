import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { getDb, services } from "~/db";
import { LuPencil, LuPlus, LuImage } from "@qwikest/icons/lucide";

export const useAdminServices = routeLoader$(async (requestEvent) => {
  const db = getDb(requestEvent.env);
  const rows = await db.select().from(services).orderBy(services.category, services.title);
  return rows;
});

export default component$(() => {
  const serviceList = useAdminServices();

  return (
    <>
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
                <td class="px-6 py-4 font-medium text-slate-900">{s.title}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                    {s.category}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-400 font-mono text-xs">/{s.slug}</td>
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
    </>
  );
});
