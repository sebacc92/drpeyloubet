import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  Link,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb, siteSettings } from "~/db";
import { LuArrowLeft, LuSave, LuType, LuQuote } from "@qwikest/icons/lucide";

// ─── Loader ──────────────────────────────────────────────
export const useSiteSettings = routeLoader$(async (event) => {
  const db = getDb(event.env);
  const rows = await db.select().from(siteSettings);

  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  return {
    hero_title: settings.hero_title ?? "",
    hero_description: settings.hero_description ?? "",
    hero_cta_text: settings.hero_cta_text ?? "",
    hero_quote: settings.hero_quote ?? "",
  };
});

// ─── Action: save settings ───────────────────────────────
export const useSaveSettings = routeAction$(async (data, event) => {
  const db = getDb(event.env);

  const keys = ["hero_title", "hero_description", "hero_cta_text", "hero_quote"];

  for (const key of keys) {
    const value = ((data[key] as string) ?? "").trim();

    // Upsert: try update, if 0 rows affected then insert
    const res = await db
      .update(siteSettings)
      .set({ value })
      .where(eq(siteSettings.key, key));

    if (res.rowsAffected === 0) {
      await db.insert(siteSettings).values({ key, value });
    }
  }

  return { success: true };
});

// ─── Component ───────────────────────────────────────────
export default component$(() => {
  const settings = useSiteSettings();
  const saveAction = useSaveSettings();

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <Link
          href="/admin/"
          class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <LuArrowLeft class="h-4 w-4" />
          Volver
        </Link>
        <h1 class="text-2xl font-bold text-slate-900">Contenido del Home</h1>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Form action={saveAction} class="space-y-6">

          {/* Hero Title */}
          <div>
            <label for="hero_title" class="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <LuType class="h-4 w-4 text-slate-400" />
              Título del Hero
            </label>
            <input
              type="text"
              name="hero_title"
              id="hero_title"
              value={settings.value.hero_title}
              class="block w-full rounded-lg border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="Cirugía Plástica y Reparadora..."
            />
            <p class="mt-1 text-xs text-slate-400">Título principal que se ve en la sección hero del inicio.</p>
          </div>

          {/* Hero Description */}
          <div>
            <label for="hero_description" class="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <LuType class="h-4 w-4 text-slate-400" />
              Descripción del Hero
            </label>
            <textarea
              name="hero_description"
              id="hero_description"
              rows={3}
              class="block w-full rounded-lg border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="Tratamientos estéticos y reconstructivos..."
            >
              {settings.value.hero_description}
            </textarea>
          </div>

          {/* CTA Text */}
          <div>
            <label for="hero_cta_text" class="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <LuType class="h-4 w-4 text-slate-400" />
              Texto del Botón (CTA)
            </label>
            <input
              type="text"
              name="hero_cta_text"
              id="hero_cta_text"
              value={settings.value.hero_cta_text}
              class="block w-full rounded-lg border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="Reservar Turno por WhatsApp"
            />
          </div>

          {/* Quote */}
          <div>
            <label for="hero_quote" class="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <LuQuote class="h-4 w-4 text-slate-400" />
              Frase Destacada
            </label>
            <textarea
              name="hero_quote"
              id="hero_quote"
              rows={2}
              class="block w-full rounded-lg border border-slate-300 px-4 py-3 text-sm italic shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="Partiendo de la máxima expresión..."
            >
              {settings.value.hero_quote}
            </textarea>
            <p class="mt-1 text-xs text-slate-400">Se muestra como cita debajo del hero.</p>
          </div>

          {/* Submit */}
          <div class="flex items-center justify-between border-t border-slate-100 pt-4">
            {saveAction.value?.success && (
              <span class="text-sm text-emerald-600 font-medium">✓ Guardado correctamente</span>
            )}
            {!saveAction.value?.success && <span />}
            <button
              type="submit"
              disabled={saveAction.isRunning}
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <LuSave class="h-4 w-4" />
              {saveAction.isRunning ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
