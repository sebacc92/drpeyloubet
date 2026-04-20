import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, routeAction$, Link } from "@builder.io/qwik-city";
import { LuArrowRight, LuStar, LuCheck, LuArrowRightCircle, LuArrowLeftCircle, LuSparkles, LuActivity, LuChevronDown, LuCalendarDays, LuVideo } from "@qwikest/icons/lucide";
import { getDb, services, categories, siteSettings, beforeAfterCases, appointments } from "~/db";
import { eq } from "drizzle-orm";
import { Chatbot } from "~/components/chatbot/chatbot";

// ─── Actions ──────────────────────────────────────────────
export const useBookingAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);

  const patientName = (data.name as string)?.trim();
  const phone = (data.phone as string)?.trim();
  const email = (data.email as string)?.trim() || null;
  const serviceId = Number(data.serviceId);
  const type = data.type as "presencial" | "virtual";

  if (!patientName || !phone || isNaN(serviceId)) {
    return { success: false, error: "Por favor, completa los campos requeridos." };
  }

  try {
    await db.insert(appointments).values({
      patientName,
      phone,
      email,
      serviceId,
      type,
      status: "pending"
    });

    const [srv] = await db.select({ title: services.title }).from(services).where(eq(services.id, serviceId));
    const serviceName = srv?.title || "Consulta General";

    const whatsappNumber = "5492230000000"; // TODO: Mover a settings o env
    const message = `Hola, soy ${patientName}.\nSolicité un turno *${type}* para *${serviceName}* desde la web.`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    throw event.redirect(302, url);
  } catch (err) {
    if (err instanceof Response) throw err; // Qwik redirect
    return { success: false, error: "Hubo un error al procesar tu solicitud." };
  }
});

// ─── Loaders ──────────────────────────────────────────────
export const useHomeData = routeLoader$(async (event) => {
  const db = getDb(event.env);

  const cats = await db.select().from(categories).orderBy(categories.name);
  const allServices = await db.select().from(services).orderBy(services.title);

  const featuredCases = await db
    .select({
      id: beforeAfterCases.id,
      description: beforeAfterCases.description,
      imageBeforeUrl: beforeAfterCases.imageBeforeUrl,
      imageAfterUrl: beforeAfterCases.imageAfterUrl,
      serviceTitle: services.title,
    })
    .from(beforeAfterCases)
    .innerJoin(services, eq(beforeAfterCases.serviceId, services.id))
    .where(eq(beforeAfterCases.isFeatured, true))
    .limit(6);

  const rows = await db.select().from(siteSettings);
  const s: Record<string, string> = {};
  for (const r of rows) s[r.key] = r.value;

  return {
    categories: cats.map((cat) => ({
      ...cat,
      services: allServices.filter(srv => srv.categoryId === cat.id)
    })),
    flatServices: allServices.map(s => ({ id: s.id, title: s.title })),
    featuredCases,
    hero: {
      title: s.hero_title || "Cirugía Plástica, Estética y Reparadora en Mar del Plata",
      description: s.hero_description || "Realza tu bienestar y confianza con la máxima seguridad y experiencia médica.",
      ctaText: s.hero_cta_text || "Agendar Consulta",
      quote: s.hero_quote || "La belleza es la manifestación exterior del equilibrio interior.",
    }
  };
});

// ─── Componentes ──────────────────────────────────────────
export default component$(() => {
  const data = useHomeData();
  const hero = data.value.hero;
  const scrollY = useSignal(0);

  useVisibleTask$(() => {
    const handleScroll = () => {
      scrollY.value = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  });

  return (
    <div class="bg-stone-50 min-h-screen">
      <Chatbot />

      {/* ─── Hero Section ─── */}
      <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#00173A]">
        <div class="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=2000"
            alt="Quirófano moderno y limpio"
            width={2000}
            height={1200}
            class="h-full w-full object-cover scale-110"
            loading="eager"
            decoding="sync"
            style={{
              transform: `translateY(${scrollY.value * 0.3}px)`,
            }}
          />
          <div class="absolute inset-0 bg-gradient-to-b from-[#00173A]/80 via-[#00173A]/50 to-[#00173A]/30"></div>
        </div>

        <div class="relative z-10 px-6 py-32 mx-auto max-w-7xl text-center flex flex-col items-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 border border-[#F9F4E9]/30 rounded-full mb-8 bg-[#00173A]/40 backdrop-blur-sm">
            <LuStar class="w-4 h-4 text-[#F9F4E9]" />
            <span class="text-md uppercase tracking-widest text-[#F9F4E9] font-semibold">35+ Años de Experiencia</span>
          </div>

          <h1 class="text-4xl md:text-6xl lg:text-7xl font-serif text-white max-w-4xl mx-auto leading-tight md:leading-tight mb-8 drop-shadow-md">
            {hero.title}
          </h1>

          <p class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 font-light drop-shadow-sm">
            {hero.description}
          </p>

          <div class="flex flex-col sm:flex-row items-center gap-6">
            <a
              href="https://turnoscolon.com.ar/?sid=12&pid=49&sid=12"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Solicitar turno online"
              class="group relative overflow-hidden bg-[#F9F4E9] text-[#00173A] px-8 py-4 rounded-xl font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_8px_30px_rgba(249,244,233,0.3)] hover:scale-105 flex items-center gap-3"
            >
              <LuCalendarDays class="w-5 h-5" />
              <span class="relative z-10">Solicitar Turno Online</span>
            </a>
            <a
              href="#equipo"
              aria-label="Conocenos"
              class="px-8 py-4 text-white font-medium tracking-wide transition-colors hover:text-[#F9F4E9] underline-offset-4 hover:underline"
            >
              Conocenos
            </a>
          </div>
        </div>
      </section>


      {/* ─── Doctors Section ─── */}
      <section class="py-24 md:py-32 bg-[#F9F6F0]" id="equipo">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-20">
            <span class="text-xs font-bold tracking-widest text-blue-950/60 uppercase mb-3 block">Sobre los profesionales</span>
            <h2 class="text-4xl md:text-5xl text-blue-950 font-serif relative inline-block">
              Perfil Profesional
              <span class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-blue-950/20"></span>
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            {/* Dr. Lafranconi */}
            <div class="flex flex-col">
              <div class="relative aspect-[3/4] max-w-sm mx-auto w-full overflow-hidden rounded-[2.5rem] shadow-xl shadow-blue-900/5 mb-8 group">
                <img
                  src="/Lafranconi-Daniel-Cirugía-Plástica.jpg"
                  alt="Dr. Daniel Lafranconi"
                  width={600}
                  height={800}
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8 text-left">
                  <h3 class="text-2xl md:text-3xl font-serif text-white mb-1">Dr. Daniel Lafranconi</h3>
                  <div class="text-xs font-medium text-white/80 tracking-wider uppercase">Matrícula: 17.595</div>
                </div>
              </div>

              <div class="space-y-0">
                <details class="group border-b border-gray-200" open>
                  <summary class="flex items-center justify-between py-5 cursor-pointer list-none">
                    <span class="text-lg font-medium text-blue-950 group-hover:text-blue-700 transition-colors tracking-tight">Títulos y Formación</span>
                    <LuChevronDown class="w-5 h-5 text-blue-950/40 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div class="pb-6 text-gray-600 text-base leading-relaxed font-light">
                    <ul class="space-y-3">
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Médico. Universidad Nacional de La Plata. Facultad de Ciencias Médicas, 1982.</span>
                      </li>
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Especialista en Cirugía General. Colegio de Médicos de la Provincia de Buenos Aires - IX Distrito, 1987.</span>
                      </li>
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Especialista en Cirugía Plástica y Reparadora. Colegio de Médicos de la Provincia de Buenos Aires - IX Distrito, 1992.</span>
                      </li>
                    </ul>
                  </div>
                </details>

                <details class="group border-b border-gray-200">
                  <summary class="flex items-center justify-between py-5 cursor-pointer list-none">
                    <span class="text-lg font-medium text-blue-950 group-hover:text-blue-700 transition-colors tracking-tight">Membresías y Sociedades</span>
                    <LuChevronDown class="w-5 h-5 text-blue-950/40 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div class="pb-6 text-gray-600 text-base leading-relaxed font-light">
                    <ul class="space-y-3">
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Sociedad de Cirugía Plástica de Mar del Plata</span>
                      </li>
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Asociación Médica Argentina</span>
                      </li>
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Sociedad Argentina de Cirugía Plástica, Estética y Reparadora</span>
                      </li>
                    </ul>
                  </div>
                </details>

                <details class="group border-b border-gray-200">
                  <summary class="flex items-center justify-between py-5 cursor-pointer list-none">
                    <span class="text-lg font-medium text-blue-950 group-hover:text-blue-700 transition-colors tracking-tight">Cargo Asistencial</span>
                    <LuChevronDown class="w-5 h-5 text-blue-950/40 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div class="pb-6 text-gray-600 text-base leading-relaxed font-light">
                    <p>Coordinador del Servicio de Cirugía Plástica en Clínica Colón.</p>
                  </div>
                </details>

                <details class="group border-b border-gray-200">
                  <summary class="flex items-center justify-between py-5 cursor-pointer list-none">
                    <span class="text-lg font-medium text-blue-950 group-hover:text-blue-700 transition-colors tracking-tight">Contacto Directo</span>
                    <LuChevronDown class="w-5 h-5 text-blue-950/40 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div class="pb-6 text-gray-600 text-base leading-relaxed font-light">
                    <a href="mailto:daniel.lafranconi@clinicacolon.com.ar" class="text-blue-950 hover:text-blue-700 transition-colors underline underline-offset-4 decoration-blue-950/20 hover:decoration-blue-700">
                      daniel.lafranconi@clinicacolon.com.ar
                    </a>
                  </div>
                </details>
              </div>
            </div>

            {/* Dr. Pagani */}
            <div class="flex flex-col">
              <div class="relative aspect-[3/4] max-w-sm mx-auto w-full overflow-hidden rounded-[2.5rem] shadow-xl shadow-blue-900/5 mb-8 group">
                <img
                  src="/Pagani-Sergio-Cirugía-Plástica.jpg"
                  alt="Dr. Sergio Pagani"
                  width={600}
                  height={800}
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8 text-left">
                  <h3 class="text-2xl md:text-3xl font-serif text-white mb-1">Dr. Sergio Pagani</h3>
                  <div class="text-xs font-medium text-white/80 tracking-wider uppercase">Matrícula: 92.253</div>
                </div>
              </div>

              <div class="space-y-0">
                <details class="group border-b border-gray-200" open>
                  <summary class="flex items-center justify-between py-5 cursor-pointer list-none">
                    <span class="text-lg font-medium text-blue-950 group-hover:text-blue-700 transition-colors tracking-tight">Títulos y Formación</span>
                    <LuChevronDown class="w-5 h-5 text-blue-950/40 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div class="pb-6 text-gray-600 text-base leading-relaxed font-light">
                    <ul class="space-y-3">
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Médico. Universidad Nacional de La Plata. Facultad de Ciencias Médicas, 1984.</span>
                      </li>
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Especialista en Cirugía General. Colegio de Médicos de la Provincia de Buenos Aires - IX Distrito, 1990.</span>
                      </li>
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Especialista en Cirugía Plástica y Reparadora. Colegio de Médicos de la Provincia de Buenos Aires - IX Distrito, 1996.</span>
                      </li>
                    </ul>
                  </div>
                </details>

                <details class="group border-b border-gray-200">
                  <summary class="flex items-center justify-between py-5 cursor-pointer list-none">
                    <span class="text-lg font-medium text-blue-950 group-hover:text-blue-700 transition-colors tracking-tight">Membresías y Sociedades</span>
                    <LuChevronDown class="w-5 h-5 text-blue-950/40 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div class="pb-6 text-gray-600 text-base leading-relaxed font-light">
                    <ul class="space-y-3">
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Confederation for Plastic Reconstructive and Aesthetic Surgery (IPRAS)</span>
                      </li>
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Asociación Argentina de Cirugía</span>
                      </li>
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Sociedad Argentina de Cirugía Plástica</span>
                      </li>
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Sociedad Marplatense de Cirugía Plástica</span>
                      </li>
                      <li class="flex gap-2">
                        <span class="text-blue-950/30 font-serif mt-0.5">•</span>
                        <span>Sociedad de Cirujanos de Mar del Plata</span>
                      </li>
                    </ul>
                  </div>
                </details>

                <details class="group border-b border-gray-200">
                  <summary class="flex items-center justify-between py-5 cursor-pointer list-none">
                    <span class="text-lg font-medium text-blue-950 group-hover:text-blue-700 transition-colors tracking-tight">Cargo Asistencial</span>
                    <LuChevronDown class="w-5 h-5 text-blue-950/40 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div class="pb-6 text-gray-600 text-base leading-relaxed font-light">
                    <p>Integrante del Servicio de Cirugía Plástica.</p>
                  </div>
                </details>

                <details class="group border-b border-gray-200">
                  <summary class="flex items-center justify-between py-5 cursor-pointer list-none">
                    <span class="text-lg font-medium text-blue-950 group-hover:text-blue-700 transition-colors tracking-tight">Contacto Directo</span>
                    <LuChevronDown class="w-5 h-5 text-blue-950/40 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div class="pb-6 text-gray-600 text-base leading-relaxed font-light">
                    <a href="mailto:sergio.pagani@clinicacolon.com.ar" class="text-blue-950 hover:text-blue-700 transition-colors underline underline-offset-4 decoration-blue-950/20 hover:decoration-blue-700">
                      sergio.pagani@clinicacolon.com.ar
                    </a>
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Administrative Info - bottom wide card */}
          <div class="mt-24 bg-white rounded-[2.5rem] border border-stone-200 shadow-xl shadow-blue-950/5 overflow-hidden max-w-5xl mx-auto">
            <div class="bg-slate-900 p-6 text-center">
              <h3 class="text-2xl font-serif text-white">Información y Turnos</h3>
            </div>

            <div class="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 class="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Atención Administrativa</h4>
                <div class="space-y-4">
                  <p class="text-slate-600 text-sm">
                    <strong>Secretaria:</strong> Carolina
                  </p>
                  <div class="text-slate-600 text-sm">
                    <strong>Horario:</strong><br />
                    Lunes a Jueves: 13:00 a 19:00 hs.<br />
                    Viernes: 10:00 a 16:00 hs.
                  </div>
                  <div class="text-slate-600 text-sm">
                    <strong>Teléfonos de la Clínica:</strong><br />
                    (0223) 499-2606 / 07 (De 08:00 a 16:00 hs.)
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Clínica Colón</h4>
                <div class="space-y-4">
                  <p class="text-slate-600 text-sm">
                    <strong>Dirección:</strong> Bolívar 3585, 1º Piso
                  </p>
                  <div class="text-slate-600 text-sm">
                    <strong>E-mail:</strong><br />
                    <a href="mailto:cirugiaplasticaclinicacolon@gmail.com" class="text-blue-600 hover:underline">cirugiaplasticaclinicacolon@gmail.com</a><br />
                  </div>
                  <div class="bg-amber-50 p-4 rounded-lg border border-amber-100 mt-4">
                    <p class="text-xs text-amber-800 leading-relaxed">
                      Consultas solo con turnos programados.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-slate-50 border-t border-slate-100 p-6 flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
              <a
                href="https://wa.me/5492235569988"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-6 py-3 rounded-xl bg-[#25D366] text-white font-semibold tracking-wide transition-all hover:bg-[#20bd5a] hover:shadow-lg w-full sm:w-auto justify-center"
              >
                Turnos vía WhatsApp
              </a>
              <a
                href="https://turnoscolon.com.ar/?sid=12&pid=49&sid=12"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold tracking-wide transition-all hover:bg-slate-800 hover:shadow-lg w-full sm:w-auto justify-center"
              >
                Turnos Clínica Colón <LuArrowRight class="ml-2 w-4 h-4" />
              </a>
              <a
                href="https://cal.com/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold tracking-wide transition-all hover:bg-blue-700 hover:shadow-lg w-full sm:w-auto justify-center"
              >
                <LuVideo class="mr-2 w-4 h-4" /> Consulta Online (Videollamada)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quote Section ─── */}
      <section class="bg-white py-24 px-6 overflow-hidden border-y border-stone-100">
        <div class="max-w-5xl mx-auto text-center relative">
          <span class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl text-stone-100 font-serif opacity-60 select-none">“</span>
          <div class="mb-8 flex justify-center items-center gap-4">
            <div class="h-px w-12 bg-stone-200"></div>
            <span class="text-xs uppercase tracking-[0.3em] text-stone-400 font-semibold">Excelencia Médica</span>
            <div class="h-px w-12 bg-stone-200"></div>
          </div>
          <p class="text-3xl md:text-4xl lg:text-5xl font-serif italic text-slate-800 leading-tight relative z-10">
            "La trayectoria y la experiencia del cirujano plástico es fundamental al momento de realizarte un tratamiento estético o reparador"
          </p>
        </div>
      </section>


      {/* ─── Description Section ─── */}
      <section class="py-24 bg-white relative overflow-hidden" id="especialidad">
        <div class="max-w-7xl mx-auto px-6 relative z-10">
          <div class="max-w-3xl mx-auto text-center mb-16">
            <h2 class="text-3xl md:text-5xl font-serif text-slate-900 mb-6">La Especialidad</h2>
            <p class="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
              La <strong>Cirugía Plástica</strong> es una especialidad quirúrgica que tiene por objeto la reconstrucción funcional y estética de todo proceso congénito, adquirido, tumoral o involutivo de los tejidos.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-8 mb-16">
            <div class="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6 text-amber-600 border border-amber-100">
                <LuActivity class="w-6 h-6" />
              </div>
              <h3 class="text-2xl font-serif text-slate-900 mb-4">Cirugía Plástica Reparadora</h3>
              <p class="text-slate-600 leading-relaxed">
                Procura restaurar o mejorar la función y el aspecto físico en lesiones congénitas, tumorales o adquiridas (accidentes o quemaduras).
              </p>
            </div>

            <div class="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6 text-rose-500 border border-rose-100">
                <LuSparkles class="w-6 h-6" />
              </div>
              <h3 class="text-2xl font-serif text-slate-900 mb-4">Cirugía Plástica Estética</h3>
              <p class="text-slate-600 leading-relaxed">
                Su objetivo es la corrección de alteraciones en los tejidos y de las secuelas producidas por el envejecimiento con la finalidad de obtener una mayor armonía facial o corporal.
              </p>
            </div>
          </div>

          <div class="bg-[#00173A] rounded-3xl p-8 md:p-12 text-left max-w-4xl mx-auto relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div class="relative z-10 text-white/90 font-light leading-loose text-lg">
              <p class="mb-4">
                La corrección de un trastorno estético alimenta positivamente la autoestima del paciente mejorando su vida en relación a lo afectivo y profesional. El cirujano plástico deberá saber escuchar para poder asesorar y aconsejar, evaluando la motivación y grado de realismo con respecto a posibles resultados, tratando de explicar los reales alcances de la especialidad a pacientes cuya expectativa de resultados sea exagerada.
              </p>
              <p>
                La Cirugía Plástica actual no es patrimonio de una clase social, sexo, actividad laboral ni de un grupo etario determinado. Todos pueden acceder al beneficio, sabiendo que éste no se limita solamente al plano superficial y estético, sino que muestra connotaciones psicológicas con el aumento de la autoestima y el consiguiente mejoramiento de las relaciones laborales y sociales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services Grid ─── */}
      <section class="py-24 bg-white" id="servicios">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-5xl font-serif text-slate-900 mb-4 tracking-tight">Tratamientos</h2>
            <p class="text-slate-500 max-w-2xl mx-auto text-lg">
              Ofrecemos opciones tanto quirúrgicas como no invasivas, diseñadas para brindar resultados naturales y duraderos.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.value.categories.map((cat) => (
              <div key={cat.id} class="bg-stone-50 p-8 rounded-2xl border border-stone-100 flex flex-col group transition-all duration-300 hover:shadow-lg hover:border-slate-200">
                <h3 class="text-2xl font-serif text-slate-900 mb-3 group-hover:text-amber-700 transition-colors">{cat.name}</h3>
                {cat.description && (
                  <p class="text-slate-600 mb-6 text-sm flex-grow line-clamp-3">
                    {cat.description}
                  </p>
                )}

                {cat.services.length > 0 && (
                  <ul class="space-y-3 mb-8">
                    {cat.services.map((srv) => (
                      <li key={srv.id}>
                        <Link href={`/servicios#cat-${cat.id}`} class="flex items-center text-slate-700 hover:text-slate-900 group/link transition-colors">
                          <LuCheck class="w-4 h-4 text-rose-300 mr-2 shrink-0 transition-transform group-hover/link:scale-125" />
                          <span class="text-sm font-medium">{srv.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <div class="mt-auto">
                  <Link
                    href="/servicios"
                    class="inline-flex items-center text-sm font-bold text-slate-900 group-hover:text-amber-700 tracking-wide transition-colors"
                  >
                    Consultar Catálogo <LuArrowRight class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Before & After ─── */}
      {data.value.featuredCases.length > 0 && (
        <section class="py-24 md:py-32 bg-slate-900 text-stone-50 overflow-hidden" id="casos">
          <div class="max-w-7xl mx-auto px-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
              <div class="max-w-3xl">
                <h2 class="text-3xl md:text-5xl font-serif mb-4 tracking-tight">Resultados de Excelencia</h2>
                <p class="text-slate-300 text-lg">Casos clínicos reales garantizando la máxima naturalidad y cuidado en el proceso de recuperación.</p>
              </div>

              <div class="hidden md:flex gap-4">
                <button aria-label="Ver caso anterior" class="p-3 border border-slate-700 rounded-full hover:bg-slate-800 transition-colors"><LuArrowLeftCircle class="w-6 h-6" /></button>
                <button aria-label="Ver caso siguiente" class="p-3 border border-slate-700 rounded-full hover:bg-slate-800 transition-colors"><LuArrowRightCircle class="w-6 h-6" /></button>
              </div>
            </div>

            <div class="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbars -mx-6 px-6 md:mx-0 md:px-0 gap-6">
              {data.value.featuredCases.map((c) => (
                <div key={c.id} class="min-w-[85vw] md:min-w-[500px] lg:min-w-[600px] snap-center shrink-0">
                  <div class="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
                    <div class="flex aspect-[4/3] md:aspect-video w-full">
                      <div class="w-1/2 relative border-r border-slate-900/50">
                        <img
                          src={c.imageBeforeUrl}
                          alt={`Antes - ${c.serviceTitle}`}
                          width={600}
                          height={800}
                          loading="lazy"
                          decoding="async"
                          class="w-full h-full object-cover"
                        />
                        <div class="absolute top-4 left-4 bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
                          ANTES
                        </div>
                      </div>
                      <div class="w-1/2 relative">
                        <img
                          src={c.imageAfterUrl}
                          alt={`Después - ${c.serviceTitle}`}
                          width={600}
                          height={800}
                          loading="lazy"
                          decoding="async"
                          class="w-full h-full object-cover"
                        />
                        <div class="absolute top-4 right-4 bg-stone-50/90 text-slate-900 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider shadow-sm">
                          DESPUÉS
                        </div>
                      </div>
                    </div>

                    <div class="p-6 md:p-8 bg-slate-800">
                      <div class="inline-block px-3 py-1 bg-slate-700 text-rose-200 text-xs font-semibold rounded-full mb-3 tracking-wide">
                        {c.serviceTitle}
                      </div>
                      {c.description && (
                        <p class="text-slate-300 md:text-lg leading-relaxed">
                          "{c.description}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div class="mt-4 text-center md:hidden">
              <p class="text-xs text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                <LuArrowRight class="w-3 h-3" /> Desliza para ver más
              </p>
            </div>
          </div>
        </section>
      )}


      {/* ─── Trust Band ─── */}
      <section class="bg-white py-16 border-t border-stone-100">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            <a
              href="https://clinicacolon.com.ar/especialidades/cirugia-plastica/"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center transition-transform hover:scale-105 opacity-70 hover:opacity-100"
            >
              <img src="/clinicacolon.png" alt="Clínica Colón" class="h-12 md:h-14 w-auto object-contain" />
            </a>
            <a
              href="https://www.sacper.org.ar/"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center transition-transform hover:scale-105 opacity-70 hover:opacity-100"
            >
              <img src="/sacper.webp" alt="SACPER" class="h-12 md:h-14 w-auto object-contain" />
            </a>
            <a
              href="https://www.instagram.com/soc_cirugiaplastica_mdp/"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center transition-transform hover:scale-105 opacity-70 hover:opacity-100"
            >
              <img src="/sociedad-marplatense-de-cirujia-plastica.webp" alt="Sociedad Marplatense de Cirugía Plástica" class="h-12 md:h-14 w-auto object-contain" />
            </a>
            <a
              href="https://www.ipras.org/"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center transition-transform hover:scale-105 opacity-70 hover:opacity-100"
            >
              <img src="/IPRAS.webp" alt="IPRAS" class="h-12 md:h-14 w-auto object-contain" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
});

export const head: DocumentHead = {
  title: "Clínica de Cirugía Plástica y Estética | Dr. Lafranconi & Dr. Pagani - Mar del Plata",
  meta: [
    {
      name: "description",
      content: "Excelencia en cirugía plástica y medicina estética en Mar del Plata. Resultados naturales y cuidado premium. Agenda tu consulta presencial o virtual.",
    },
    { property: "og:title", content: "Clínica de Cirugía Plástica y Estética | Dr. Lafranconi & Dr. Pagani" },
    { property: "og:description", content: "Excelencia en cirugía plástica y medicina estética en Mar del Plata. Resultados naturales y cuidado premium." },
    { property: "og:image", content: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "es_AR" }
  ],
};
