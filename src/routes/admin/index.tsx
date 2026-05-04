import { routeLoader$ } from "@builder.io/qwik-city";

export const useAdminRedirect = routeLoader$(({ redirect }) => {
  throw redirect(302, "/admin/tratamientos/");
});

export default function AdminIndex() {
  return null;
}
