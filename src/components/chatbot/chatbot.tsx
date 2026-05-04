import { component$, useSignal, $ } from "@builder.io/qwik";
import { LuX, LuSend } from "@qwikest/icons/lucide";

export const Chatbot = component$((props: { avatarUrl?: string }) => {
  const isOpen = useSignal(false);
  const messages = useSignal<{role: string, content: string}[]>([
    { role: "assistant", content: "Hola. Soy el asistente virtual de la clínica. ¿En qué puedo ayudarte a agendar tu cita hoy?" }
  ]);
  const inputMsg = useSignal("");
  const isLoading = useSignal(false);
  // Un ID simple de sesión (en un caso real, podría persistir o basarse en el usuario real)
  const sessionId = useSignal(Math.random().toString(36).substring(7));

  const sendMessage = $(async () => {
    if (!inputMsg.value.trim() || isLoading.value) return;
    
    const userMsg = inputMsg.value;
    inputMsg.value = "";
    
    // Add user message to UI
    messages.value = [...messages.value, { role: "user", content: userMsg }];
    isLoading.value = true;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.value.map(m => ({ role: m.role, content: m.content })),
          sessionId: sessionId.value
        })
      });
      
      const data = await res.json();
      if (res.ok && data.reply) {
        messages.value = [...messages.value, { role: "assistant", content: data.reply }];
      } else {
        throw new Error("Respuesta inválida");
      }
    } catch {
      messages.value = [...messages.value, { role: "assistant", content: "Lo siento, hubo un error de conexión intentando comunicarme con la clínica." }];
    } finally {
      isLoading.value = false;
    }
  });

  return (
    <>
      {/* Botón Flotante */}
      <div class="fixed bottom-6 right-6 z-50 flex items-center justify-center group">
        {!isOpen.value && (
          <div class="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900 text-white text-[13px] font-medium px-4 py-2.5 rounded-2xl whitespace-nowrap shadow-xl pointer-events-none translate-x-4 group-hover:translate-x-0 after:content-[''] after:absolute after:top-1/2 after:left-full after:-translate-y-1/2 after:border-8 after:border-transparent after:border-l-slate-900">
            Hola, soy el asistente virtual, estoy aquí para ayudarte
          </div>
        )}
        <button 
          onClick$={() => isOpen.value = !isOpen.value}
          class={`relative flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${isOpen.value ? 'bg-slate-800 text-stone-50' : 'bg-white text-blue-950 border border-stone-100'}`}
        >
          {!isOpen.value && (
            <span class="animate-ping absolute inset-0 rounded-full bg-white opacity-60"></span>
          )}
          {isOpen.value ? <LuX class="w-6 h-6 relative z-10" /> : <img src={props.avatarUrl || "/logo.png"} alt="Chat" class="w-8 h-8 object-cover relative z-10 bg-white rounded-full" />}
        </button>
      </div>

      {/* Ventana de Chat */}
      {isOpen.value && (
        <div class="fixed bottom-[160px] sm:bottom-[180px] right-6 w-[90vw] max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div class="bg-slate-900 p-4 text-stone-50 flex justify-between items-center shadow-md z-10">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden">
                <img src={props.avatarUrl || "/logo.png"} alt="Avatar" class="w-full h-full object-cover bg-white" />
              </div>
              <div>
                <h3 class="font-serif font-bold text-[15px] leading-tight">Asistente Premium</h3>
                <p class="text-[11px] text-slate-400 mt-0.5 tracking-wider uppercase">En línea</p>
              </div>
            </div>
          </div>
          
          <div class="h-80 overflow-y-auto p-4 bg-stone-50/50 flex flex-col gap-3">
            {messages.value.map((m, i) => (
              <div key={i} class={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div class={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] shadow-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-slate-800 text-stone-50 rounded-br-none' 
                    : 'bg-white border border-stone-100 text-slate-700 rounded-bl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading.value && (
              <div class="flex justify-start">
                <div class="bg-white border border-stone-100 rounded-2xl rounded-bl-none px-4 py-3 text-[13px] shadow-sm text-slate-400 italic">Escribiendo...</div>
              </div>
            )}
          </div>
          
          <div class="p-3 border-t border-stone-100 bg-white flex gap-2">
            <input 
              type="text" 
              value={inputMsg.value}
              onInput$={(e) => inputMsg.value = (e.target as HTMLInputElement).value}
              onKeyDown$={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu consulta..."
              class="flex-1 bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
            />
            <button 
              onClick$={sendMessage}
              disabled={isLoading.value}
              class="p-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
            >
              <LuSend class="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
});
