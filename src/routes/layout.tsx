import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { Navbar } from "~/components/layout/Navbar";
import { Footer } from "~/components/layout/Footer";
import { WhatsAppButton } from "~/components/layout/WhatsAppButton";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export default component$(() => {
  return (
    <div class="flex min-h-screen flex-col font-sans text-slate-900 bg-slate-50">
      <Navbar />
      <main class="flex-grow">
        <Slot />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
});
