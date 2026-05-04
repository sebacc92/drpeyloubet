import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import { Navbar } from "~/components/layout/Navbar";
import { Footer } from "~/components/layout/Footer";
import { WhatsAppButton } from "~/components/layout/WhatsAppButton";
import { Chatbot } from "~/components/chatbot/chatbot";
import { getDb, siteSettings } from "~/db";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export const useSiteSettingsLoader = routeLoader$(async (event) => {
  const db = getDb(event.env);
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
});

export default component$(() => {
  const settings = useSiteSettingsLoader();
  
  return (
    <div class="flex min-h-screen flex-col font-sans text-slate-900 bg-slate-50">
      <Navbar />
      <main class="flex-grow">
        <Slot />
      </main>
      <Footer />
      <WhatsAppButton />
      <Chatbot avatarUrl={settings.value.aiAvatarUrl} />
    </div>
  );
});
