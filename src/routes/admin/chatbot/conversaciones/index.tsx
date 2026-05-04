import { component$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { getDb, chatSessions, chatMessages } from "~/db";
import { desc, eq } from "drizzle-orm";
import { LuMessageCircle, LuTrash2, LuCalendar, LuClock, LuBot, LuUser, LuX, LuCheck, LuLoader2 } from "@qwikest/icons/lucide";

export const useConversations = routeLoader$(async (event) => {
  const db = getDb(event.env);
  
  const sessions = await db.select().from(chatSessions).orderBy(desc(chatSessions.lastActive));
  
  const allMessages = await db.select().from(chatMessages).orderBy(chatMessages.createdAt);

  const sessionsWithMessages = sessions.map(session => ({
    ...session,
    messages: allMessages.filter(m => m.sessionId === session.id)
  }));

  return sessionsWithMessages;
});

const deleteSession = server$(async function(sessionId: string) {
  if (!sessionId) throw new Error("ID inválido");
  const db = getDb(this.env);
  
  await db.delete(chatSessions).where(eq(chatSessions.id, sessionId));
  // Messages are deleted automatically due to ON DELETE CASCADE
  
  return { success: true };
});

export default component$(() => {
  const data = useConversations();
  const selectedSessionId = useSignal<string | null>(null);
  const deletingId = useSignal<string | null>(null);
  const toast = useSignal<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = $((type: "success" | "error", msg: string) => {
    toast.value = { type, msg };
    setTimeout(() => {
      toast.value = null;
    }, 3000);
  });

  const selectedSession = data.value.find(s => s.id === selectedSessionId.value);

  return (
    <>
      {toast.value && (
        <div class="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div class={["px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-white", toast.value.type === "success" ? "bg-emerald-600" : "bg-red-600"]}>
            {toast.value.type === "success" ? <LuCheck class="w-4 h-4" /> : <LuX class="w-4 h-4" />}
            <span class="text-sm font-semibold">{toast.value.msg}</span>
          </div>
        </div>
      )}

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LuMessageCircle class="w-6 h-6 text-blue-600" />
          Conversaciones del Chatbot
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Auditoría y registro de interacciones de los usuarios con el asistente virtual.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Sidebar - Lista de sesiones */}
        <div class="lg:col-span-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-100 bg-slate-50">
            <h2 class="font-semibold text-slate-800 text-sm">Historial de Sesiones</h2>
          </div>
          
          <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {data.value.length === 0 ? (
              <div class="p-6 text-center text-slate-400">
                <LuMessageCircle class="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p class="text-sm">No hay conversaciones registradas.</p>
              </div>
            ) : (
              data.value.map(session => (
                <button
                  key={session.id}
                  onClick$={() => selectedSessionId.value = session.id}
                  class={[
                    "w-full text-left p-4 rounded-xl transition-all flex flex-col gap-2 relative group",
                    selectedSessionId.value === session.id 
                      ? "bg-blue-50 border border-blue-200 shadow-sm" 
                      : "hover:bg-slate-50 border border-transparent"
                  ]}
                >
                  <div class="flex items-center justify-between w-full">
                    <span class="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">ID: {session.id.substring(0,8)}...</span>
                    
                    <button
                      disabled={deletingId.value === session.id}
                      onClick$={async (e) => {
                        e.stopPropagation();
                        if(!confirm("¿Eliminar esta conversación?")) return;
                        deletingId.value = session.id;
                        try {
                          await deleteSession(session.id);
                          showToast("success", "Conversación eliminada");
                          if(selectedSessionId.value === session.id) selectedSessionId.value = null;
                          window.location.reload();
                        } catch {
                          showToast("error", "Error al eliminar");
                        } finally {
                          deletingId.value = null;
                        }
                      }}
                      class="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {deletingId.value === session.id ? <LuLoader2 class="w-4 h-4 animate-spin" /> : <LuTrash2 class="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div class="flex items-center gap-4 text-xs text-slate-500">
                    <div class="flex items-center gap-1.5">
                      <LuCalendar class="w-3.5 h-3.5" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                    <div class="flex items-center gap-1.5">
                      <LuClock class="w-3.5 h-3.5" />
                      {new Date(session.lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div class="flex items-center gap-1.5 ml-auto font-medium">
                      {session.messages.length} msgs
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Contenido - Mensajes */}
        <div class="lg:col-span-8 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col overflow-hidden">
          {selectedSession ? (
            <>
              <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 class="font-semibold text-slate-800 text-sm">Sesión: <span class="font-mono text-slate-500 ml-1">{selectedSession.id}</span></h2>
                  <p class="text-xs text-slate-500 mt-0.5">Iniciada el {new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
                {selectedSession.messages.map(msg => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg.id} class={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
                      <div class={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isUser ? 'bg-slate-800' : 'bg-blue-100'}`}>
                        {isUser ? <LuUser class="w-5 h-5 text-slate-200" /> : <LuBot class="w-5 h-5 text-blue-600" />}
                      </div>
                      <div class={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${isUser ? 'bg-slate-800 text-stone-50 rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                        {msg.content}
                        <div class={`text-[10px] mt-2 opacity-50 ${isUser ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div class="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <LuMessageCircle class="w-12 h-12 mb-4 opacity-20" />
              <p class="text-sm font-medium text-slate-500">Seleccioná una conversación</p>
              <p class="text-xs mt-1">Elegí una sesión del historial para ver los mensajes intercambiados.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
});
