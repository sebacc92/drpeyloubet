import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { getDbClient } from "~/db";
import { LuPlus, LuPencil } from "@qwikest/icons/lucide";

export const useAdminServices = routeLoader$(async (requestEvent) => {
  const db = getDbClient(requestEvent.env);
  const result = await db.execute("SELECT id, slug, title, category FROM services ORDER BY category, title");
  return result.rows;
});

export default component$(() => {
  const services = useAdminServices();

  return (
    <div class="bg-white shadow sm:rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center bg-slate-50 border-b border-slate-200">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Listado de Servicios
        </h3>
        <button class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          <LuPlus class="h-4 w-4 mr-1" />
          Nuevo Servicio
        </button>
      </div>
      <div class="border-t border-gray-200">
         <ul class="divide-y divide-gray-200">
           {services.value.map((service) => (
             <li key={service.id as number} class="hover:bg-slate-50 transition-colors">
               <div class="px-4 py-4 sm:px-6 flex items-center justify-between">
                 <div>
                   <p class="text-sm font-medium text-blue-600 truncate">{service.title as string}</p>
                   <p class="mt-1 flex items-center text-sm text-gray-500">
                     <span class="truncate">{service.category as string}</span>
                     <span class="mx-2">&bull;</span>
                     <span class="truncate text-slate-400">/{service.slug as string}</span>
                   </p>
                 </div>
                 <div class="ml-4 flex-shrink-0">
                   <Link
                     href={`/admin/dashboard/servicios/${service.id}`}
                     class="font-medium text-blue-600 hover:text-blue-500 flex items-center bg-blue-50 px-3 py-2 rounded-md transition-colors"
                   >
                     <LuPencil class="h-4 w-4 mr-1" />
                     Editar
                   </Link>
                 </div>
               </div>
             </li>
           ))}
         </ul>
         {services.value.length === 0 && (
           <div class="p-8 text-center text-slate-500">
             No hay servicios cargados.
           </div>
         )}
      </div>
    </div>
  );
});
