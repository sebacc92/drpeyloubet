import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { getDb, treatments, treatmentBeforeAfter } from "~/db";
import { eq, asc } from "drizzle-orm";
import { LuArrowLeft, LuCalendarDays, LuChevronRight, LuSparkles, LuActivity, LuSyringe } from "@qwikest/icons/lucide";

// ─── Types ───────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  estetica: "Cirugía Estética",
  reparadora: "Cirugía Reparadora",
  no_quirurgica: "No Quirúrgico",
};

// ─── Loader ──────────────────────────────────────────────
export const useTreatmentDetail = routeLoader$(async (event) => {
  const slug = event.params.slug;

  if (!slug || typeof slug !== "string") {
    throw event.redirect(302, "/tratamientos/");
  }

  const db = getDb(event.env);

  const [treatment] = await db
    .select()
    .from(treatments)
    .where(eq(treatments.slug, slug))
    .limit(1);

  if (!treatment) {
    throw event.redirect(302, "/tratamientos/");
  }

  const beforeAfterImages = await db
    .select()
    .from(treatmentBeforeAfter)
    .where(eq(treatmentBeforeAfter.treatmentId, treatment.id))
    .orderBy(asc(treatmentBeforeAfter.displayOrder));

  return {
    ...treatment,
    beforeAfterImages,
  };
});

// ─── Category Icon ───────────────────────────────────────
const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "estetica":
      return <LuSparkles class="w-5 h-5" />;
    case "reparadora":
      return <LuActivity class="w-5 h-5" />;
    case "no_quirurgica":
      return <LuSyringe class="w-5 h-5" />;
    default:
      return <LuSparkles class="w-5 h-5" />;
  }
};

// ─── Page Component ──────────────────────────────────────
export default component$(() => {
  const data = useTreatmentDetail();
  const treatment = data.value;
  const categoryLabel = CATEGORY_LABELS[treatment.category] || treatment.category;

  return (
    <div class="bg-stone-50 min-h-screen">
      {/* ─── Hero ─── */}
      <section class="relative overflow-hidden bg-[#00173A]">
        {treatment.mainImageUrl ? (
          <div class="absolute inset-0 z-0">
            <img
              src={treatment.mainImageUrl}
              alt={treatment.name}
              width={1600}
              height={900}
              class="w-full h-full object-cover"
              loading="eager"
              decoding="sync"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#00173A] via-[#00173A]/70 to-[#00173A]/40"></div>
          </div>
        ) : (
          <div class="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950"></div>
        )}

        <div class="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">
          {/* Breadcrumb */}
          <nav class="flex items-center gap-2 text-sm text-white/60 mb-8" aria-label="Breadcrumb">
            <Link href="/" class="hover:text-white transition-colors">Inicio</Link>
            <LuChevronRight class="w-3.5 h-3.5" />
            <Link href="/tratamientos" class="hover:text-white transition-colors">Tratamientos</Link>
            <LuChevronRight class="w-3.5 h-3.5" />
            <span class="text-white/90 font-medium">{treatment.name}</span>
          </nav>

          {/* Category badge */}
          <div class="inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full mb-6 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold uppercase tracking-wider">
            <CategoryIcon category={treatment.category} />
            {categoryLabel}
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-4 drop-shadow-md">
            {treatment.name}
          </h1>

          {treatment.shortDescription && (
            <p class="text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed">
              {treatment.shortDescription}
            </p>
          )}
        </div>
      </section>

      {/* ─── Content ─── */}
      <div class="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Full description */}
        {treatment.fullDescription && (
          <section class="mb-20">
            <h2 class="text-2xl md:text-3xl font-serif text-slate-900 mb-8 relative inline-block">
              Sobre el Procedimiento
              <span class="absolute -bottom-3 left-0 w-12 h-1 bg-amber-700/30"></span>
            </h2>
            <div class="prose prose-lg prose-slate max-w-none">
              {treatment.fullDescription.split("\n").map((paragraph, i) => (
                <p key={i} class="text-slate-600 leading-relaxed text-lg mb-4 font-light">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Before & After Gallery */}
        <section class="mb-20">
          <h2 class="text-2xl md:text-3xl font-serif text-slate-900 mb-8 relative inline-block">
            Antes y Después
            <span class="absolute -bottom-3 left-0 w-12 h-1 bg-amber-700/30"></span>
          </h2>

          {treatment.beforeAfterImages.length > 0 ? (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              {treatment.beforeAfterImages.map((pair) => (
                <div key={pair.id} class="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                  <div class="flex aspect-[2/1]">
                    <div class="w-1/2 relative border-r border-stone-200">
                      <img
                        src={pair.beforeImageUrl}
                        alt={`Antes - ${treatment.name}`}
                        width={400}
                        height={400}
                        loading="lazy"
                        decoding="async"
                        class="w-full h-full object-cover"
                      />
                      <div class="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                        Antes
                      </div>
                    </div>
                    <div class="w-1/2 relative">
                      <img
                        src={pair.afterImageUrl}
                        alt={`Después - ${treatment.name}`}
                        width={400}
                        height={400}
                        loading="lazy"
                        decoding="async"
                        class="w-full h-full object-cover"
                      />
                      <div class="absolute top-3 right-3 bg-stone-50/90 text-slate-900 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Después
                      </div>
                    </div>
                  </div>
                  {pair.caption && (
                    <div class="p-4 border-t border-stone-100">
                      <p class="text-sm text-slate-500 italic">"{pair.caption}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div class="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <p class="text-slate-400 text-lg italic">Próximamente</p>
              <p class="text-slate-300 text-sm mt-2">
                Estamos preparando resultados visuales de este tratamiento.
              </p>
            </div>
          )}
        </section>

        {/* CTA */}
        <section class="bg-[#00173A] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div class="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div class="relative z-10">
            <h3 class="text-2xl md:text-3xl font-serif text-white mb-4">
              ¿Interesado en {treatment.name}?
            </h3>
            <p class="text-white/70 mb-8 max-w-lg mx-auto font-light">
              Agendá una consulta con nuestros especialistas para evaluar tu caso de forma personalizada.
            </p>
            <a
              href="https://wa.me/5492235569988"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-3 bg-[#F9F4E9] text-[#00173A] px-8 py-4 rounded-xl font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_8px_30px_rgba(249,244,233,0.3)] hover:scale-105"
            >
              <LuCalendarDays class="w-5 h-5" />
              Solicitar Turno
            </a>
          </div>
        </section>

        {/* Back button */}
        <div class="mt-12 text-center">
          <Link
            href="/tratamientos"
            class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <LuArrowLeft class="w-4 h-4" />
            Volver a Tratamientos
          </Link>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const treatment = resolveValue(useTreatmentDetail);
  return {
    title: `${treatment.name} | Dr. Lafranconi & Dr. Pagani - Mar del Plata`,
    meta: [
      {
        name: "description",
        content: treatment.shortDescription || `Información sobre ${treatment.name} - Cirugía Plástica en Mar del Plata.`,
      },
    ],
  };
};
