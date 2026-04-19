import { component$ } from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";

interface BookingFormProps {
  action: any;
  services: { id: number; title: string }[];
}

export const BookingForm = component$<BookingFormProps>(({ action, services }) => {
  return (
    <div class="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-stone-100 w-full max-w-lg mx-auto relative overflow-hidden">
      {/* Decorative top accent */}
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-900 to-slate-700"></div>

      <h3 class="text-2xl md:text-3xl font-serif text-slate-900 mb-2 text-center">Agendar Consulta</h3>
      <p class="text-slate-500 text-sm mb-8 text-center px-4">Completa el formulario y te contactaremos a la brevedad para coordinar tu turno.</p>

      <Form action={action} class="space-y-6">
        {action.value?.error && (
          <div class="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-start gap-2">
            <span class="mt-0.5">⚠️</span>
            {action.value.error}
          </div>
        )}
        
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Nombre Completo <span class="text-rose-400">*</span></label>
          <input 
            type="text" 
            name="name" 
            required 
            class="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all shadow-sm" 
            placeholder="Ej. María Perez" 
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">WhatsApp <span class="text-rose-400">*</span></label>
            <input 
              type="tel" 
              name="phone" 
              required 
              class="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all shadow-sm" 
              placeholder="+54 9 223..." 
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
            <input 
              type="email" 
              name="email" 
              class="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all shadow-sm" 
              placeholder="opcional@mail.com" 
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Servicio de Interés <span class="text-rose-400">*</span></label>
          <div class="relative">
            <select 
              name="serviceId" 
              required 
              class="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all shadow-sm appearance-none cursor-pointer text-slate-700"
            >
              <option value="">Selecciona un tratamiento...</option>
              {services.map(s => <option value={s.id} key={s.id}>{s.title}</option>)}
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Modalidad <span class="text-rose-400">*</span></label>
          <div class="relative">
            <select 
              name="type" 
              required 
              class="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all shadow-sm appearance-none cursor-pointer text-slate-700"
            >
              <option value="presencial">Presencial (Consultorio Médico)</option>
              <option value="virtual">Videollamada</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div class="pt-4">
          <button 
            type="submit" 
            disabled={action.isRunning}
            class="w-full bg-slate-900 text-stone-50 rounded-2xl py-4 font-semibold tracking-wide hover:bg-slate-800 transition-all duration-300 active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 relative overflow-hidden group"
          >
            <span class="relative z-10">{action.isRunning ? "Procesando..." : "Solicitar Turno"}</span>
            <div class="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </button>
          <p class="text-center text-xs text-slate-400 mt-4 leading-relaxed">Al enviar serás redirigido a WhatsApp<br/>para coordinar la disponibilidad con nuestra secretaria.</p>
        </div>
      </Form>
    </div>
  )
});
