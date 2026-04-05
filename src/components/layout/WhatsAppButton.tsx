import { component$ } from '@builder.io/qwik';
import { LuMessageCircle } from '@qwikest/icons/lucide';

export const WhatsAppButton = component$(() => {
  return (
    <a
      href="https://wa.link/yourlink"
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
      aria-label="Contactar por WhatsApp"
    >
      <LuMessageCircle class="h-7 w-7" />
    </a>
  );
});
