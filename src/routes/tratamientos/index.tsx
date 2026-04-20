import { component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { getDb, treatments } from "~/db";
import { asc } from "drizzle-orm";
import { LuArrowRight, LuSparkles, LuActivity, LuSyringe } from "@qwikest/icons/lucide";

// ─── Types ───────────────────────────────────────────────
type CategoryKey = "todos" | "estetica" | "reparadora" | "no_quirurgica";

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  todos: "Todos",
  estetica: "Cirugía Estética",
  reparadora: "Cirugía Reparadora",
  no_quirurgica: "No Quirúrgico",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  estetica: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700" },
  reparadora: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  no_quirurgica: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
};

// ─── Loader ──────────────────────────────────────────────
export const useTreatments = routeLoader$(async (event) => {
  const db = getDb(event.env);

  const allTreatments = await db
    .select({
      id: treatments.id,
      slug: treatments.slug,
      name: treatments.name,
      category: treatments.category,
      shortDescription: treatments.shortDescription,
      mainImageUrl: treatments.mainImageUrl,
      isFeatured: treatments.isFeatured,
      displayOrder: treatments.displayOrder,
    })
    .from(treatments)
    .orderBy(asc(treatments.displayOrder));

  return allTreatments;
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
  const data = useTreatments();
  const activeFilter = useSignal<CategoryKey>("todos");

  const allTreatments = data.value;

  const filteredTreatments =
    activeFilter.value === "todos"
      ? allTreatments
      : allTreatments.filter((t) => t.category === activeFilter.value);

  // Sort: featured first
  const sorted = [...filteredTreatments].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });

  // Count per category
  const counts: Record<CategoryKey, number> = {
    todos: allTreatments.length,
    estetica: allTreatments.filter((t) => t.category === "estetica").length,
    reparadora: allTreatments.filter((t) => t.category === "reparadora").length,
    no_quirurgica: allTreatments.filter((t) => t.category === "no_quirurgica").length,
  };

  return (
    <div class="bg-stone-50 min-h-screen">
      <div class="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12">
        {/* ─── Header ─── */}
        <div class="text-center mb-16">
          <span class="text-xs font-bold tracking-widest text-blue-950/60 uppercase mb-3 block">
            Servicios
          </span>
          <h1 class="text-4xl font-serif tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">
            Tratamientos
          </h1>
          <p class="mt-4 text-lg text-slate-500 max-w-2xl mx-auto font-light">
            Soluciones integrales de cirugía estética, reconstructiva y tratamientos no invasivos,
            diseñados para lograr la máxima armonía y naturalidad.
          </p>
        </div>

        {/* ─── Category Filter Tabs ─── */}
        <div class="sticky top-20 z-20 -mx-6 px-6 py-4 mb-16 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
          <div class="flex flex-wrap items-center justify-center gap-3">
            {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick$={() => {
                  activeFilter.value = key;
                }}
                class={[
                  "rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 border cursor-pointer",
                  activeFilter.value === key
                    ? "bg-slate-900 text-stone-50 border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-stone-200 hover:bg-stone-100",
                ]}
              >
                {CATEGORY_LABELS[key]}
                <span
                  class={[
                    "ml-2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                    activeFilter.value === key
                      ? "bg-stone-50/20 text-stone-50"
                      : "bg-slate-100 text-slate-500",
                  ]}
                >
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Treatments Grid ─── */}
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((treatment) => {
            const catColor = CATEGORY_COLORS[treatment.category] || CATEGORY_COLORS.estetica;

            return (
              <Link
                key={treatment.slug}
                href={`/tratamientos/${treatment.slug}`}
                class={[
                  "group flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:border-slate-200 relative",
                  treatment.isFeatured ? "ring-2 ring-amber-200/60" : "",
                ]}
              >
                {/* Featured indicator */}
                {treatment.isFeatured && (
                  <div class="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    <LuSparkles class="w-3 h-3" />
                    Destacado
                  </div>
                )}

                {/* Category badge */}
                <div
                  class={[
                    "absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm",
                    catColor.bg,
                    catColor.text,
                  ]}
                >
                  <CategoryIcon category={treatment.category} />
                  {CATEGORY_LABELS[treatment.category as CategoryKey]?.replace("Cirugía ", "") || treatment.category}
                </div>

                {/* Image or placeholder */}
                {treatment.mainImageUrl ? (
                  <div class="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={treatment.mainImageUrl}
                      alt={treatment.name}
                      loading="lazy"
                      decoding="async"
                      width={500}
                      height={400}
                      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div class="aspect-[4/3] bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 flex items-center justify-center">
                    <div class="text-white/20">
                      <CategoryIcon category={treatment.category} />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div class="flex flex-1 flex-col p-8">
                  <h3 class="text-xl font-serif text-slate-900 mb-3 group-hover:text-amber-700 transition-colors duration-300">
                    {treatment.name}
                  </h3>

                  {treatment.shortDescription && (
                    <p class="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                      {treatment.shortDescription}
                    </p>
                  )}

                  <div class="flex-1" />

                  <div class="mt-6 flex items-center font-bold tracking-wide text-slate-900 text-sm group-hover:text-amber-700 transition-colors duration-300">
                    <span>Ver Detalles</span>
                    <LuArrowRight class="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {sorted.length === 0 && (
          <div class="text-center py-24">
            <p class="text-slate-400 text-lg italic">
              No hay tratamientos en esta categoría por el momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Tratamientos | Dr. Lafranconi & Dr. Pagani - Cirugía Plástica en Mar del Plata",
  meta: [
    {
      name: "description",
      content:
        "Conocé todos los tratamientos de cirugía estética, reparadora y no quirúrgica que ofrecen el Dr. Lafranconi y el Dr. Pagani en Mar del Plata.",
    },
  ],
};
