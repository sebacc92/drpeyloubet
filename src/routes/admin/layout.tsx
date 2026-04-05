import { component$, Slot } from "@builder.io/qwik";

/**
 * Admin layout — NO hereda del layout público (Navbar/Footer).
 * En Qwik City, para romper la herencia se usa `layout!.tsx`, pero
 * el usuario prefirió mantener `layout.tsx` sin `!`.
 * Por eso, este layout renderiza su propio header/footer de admin
 * y el layout público se encargará de envolver todo igualmente.
 */
export default component$(() => {
  return (
    <Slot />
  );
});
