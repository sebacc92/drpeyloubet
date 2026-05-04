import { component$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$, Form, routeAction$, zod$, z, server$ } from "@builder.io/qwik-city";
import { getDb, siteSettings } from "~/db";
import { put } from "@vercel/blob";
import { LuSave, LuBot, LuImage, LuTrash2, LuLoader2 } from "@qwikest/icons/lucide";

export const useChatbotConfig = routeLoader$(async (event) => {
  const db = getDb(event.env);
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  
  return {
    aiEnabled: settings.aiEnabled !== "false", // default to true if not set
    aiTone: settings.aiTone || "profesional, empático, confidencial y de alta gama",
    aiKnowledge: settings.aiKnowledge || "Información general de la clínica",
    whatsappNumber: settings.whatsappNumber || "",
    aiAvatarUrl: settings.aiAvatarUrl || "",
  };
});

export const useUpdateConfig = routeAction$(
  async (data, event) => {
    const db = getDb(event.env);
    
    const updates = [
      { key: "aiEnabled", value: data.aiEnabled ? "true" : "false" },
      { key: "aiTone", value: data.aiTone },
      { key: "aiKnowledge", value: data.aiKnowledge },
      { key: "whatsappNumber", value: data.whatsappNumber },
      { key: "aiAvatarUrl", value: data.aiAvatarUrl || "" },
    ];

    for (const update of updates) {
      await db.insert(siteSettings).values(update)
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: update.value } });
    }

    return { success: true };
  },
  zod$({
    aiEnabled: z.boolean().default(true),
    aiTone: z.string().min(1, "El tono es obligatorio"),
    aiKnowledge: z.string().min(1, "El conocimiento base es obligatorio"),
    whatsappNumber: z.string().optional().default(""),
    aiAvatarUrl: z.string().optional().default(""),
  })
);

// Helper function to convert File to base64 on client
const fileToBase64 = $(async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
});

// Server function to upload to Vercel Blob
const uploadAvatar = server$(async function(base64Data: string, fileName: string, mimeType: string) {
  const blobToken = this.env.get("BLOB_READ_WRITE_TOKEN");
  if (!blobToken) throw new Error("BLOB_READ_WRITE_TOKEN not configured");

  const buffer = Buffer.from(base64Data, "base64");
  const ext = fileName.split(".").pop() || "webp";
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

  const blob = await put(`chatbot/avatar-${uniqueId}.${ext}`, buffer, {
    access: "public",
    token: blobToken,
    contentType: mimeType,
    addRandomSuffix: false,
  });

  return blob.url;
});

export default component$(() => {
  const configData = useChatbotConfig();
  const updateAction = useUpdateConfig();

  const isUploading = useSignal(false);
  const avatarUrl = useSignal(configData.value.aiAvatarUrl || "");

  const handleFileChange = $(async (event: Event) => {
    const element = event.target as HTMLInputElement;
    if (!element.files || element.files.length === 0) return;
    const file = element.files[0];
    
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no debe superar los 2MB.");
      return;
    }

    isUploading.value = true;
    try {
      const base64 = await fileToBase64(file);
      const url = await uploadAvatar(base64, file.name, file.type);
      avatarUrl.value = url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert("Ocurrió un error al subir la imagen.");
    } finally {
      isUploading.value = false;
      element.value = '';
    }
  });

  return (
    <>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LuBot class="w-6 h-6 text-blue-600" />
          Configuración del Chatbot
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Ajustá el comportamiento, el tono y los datos básicos del asistente virtual.
        </p>
      </div>

      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm ring-1 ring-slate-200 max-w-3xl">
        <Form action={updateAction} class="space-y-6">
          <input type="hidden" name="aiAvatarUrl" value={avatarUrl.value} />
          
          {updateAction.value?.success && (
            <div class="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium border border-emerald-100 flex items-center gap-2">
              <LuSave class="w-4 h-4" />
              Configuración guardada correctamente.
            </div>
          )}

          {/* Estado */}
          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <h3 class="font-semibold text-slate-900 text-sm">Estado del Chatbot</h3>
              <p class="text-xs text-slate-500">Habilita o deshabilita el asistente virtual en la web.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="aiEnabled" class="sr-only peer" defaultChecked={configData.value.aiEnabled} />
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="grid grid-cols-1 gap-6">
            {/* Avatar */}
            <div class="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div class="shrink-0 space-y-2 flex flex-col items-center">
                <label class="block text-sm font-semibold text-slate-900 mb-1">Avatar del Chatbot</label>
                <div class="w-20 h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden relative group shadow-sm">
                  {avatarUrl.value ? (
                    <>
                      <img src={avatarUrl.value} alt="Avatar IA" class="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick$={() => avatarUrl.value = ''}
                        class="absolute inset-0 bg-slate-900/50 hidden group-hover:flex items-center justify-center text-white backdrop-blur-[1px]"
                        title="Eliminar avatar"
                      >
                        <LuTrash2 class="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <LuImage class="w-6 h-6 text-slate-300" />
                  )}
                  {isUploading.value && (
                    <div class="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                      <LuLoader2 class="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
              <div class="flex-1">
                <p class="text-xs text-slate-500 mb-3">Sube una imagen cuadrada para reemplazar el logo por defecto que usa el chatbot. Recomendado: 256x256px.</p>
                <div class="relative inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange$={handleFileChange}
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading.value}
                  />
                  <button type="button" class="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    {avatarUrl.value ? 'Cambiar imagen' : 'Subir imagen'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tono */}
            <div>
              <label class="block text-sm font-semibold text-slate-900 mb-2">Tono y Personalidad</label>
              <input
                type="text"
                name="aiTone"
                defaultValue={configData.value.aiTone}
                class="w-full px-4 py-2 bg-stone-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="Ej: profesional, empático, confidencial..."
              />
              <p class="text-xs text-slate-500 mt-1.5">Instrucciones sobre cómo debe responder la IA a los usuarios.</p>
            </div>

            {/* WhatsApp */}
            <div>
              <label class="block text-sm font-semibold text-slate-900 mb-2">Número de WhatsApp (Contacto)</label>
              <input
                type="text"
                name="whatsappNumber"
                defaultValue={configData.value.whatsappNumber}
                class="w-full px-4 py-2 bg-stone-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="Ej: 5492231234567"
              />
              <p class="text-xs text-slate-500 mt-1.5">Número con código de país al cual se derivará a los pacientes para turnos.</p>
            </div>

            {/* Conocimiento Extra */}
            <div>
              <label class="block text-sm font-semibold text-slate-900 mb-2">Conocimiento Adicional (Contexto)</label>
              <textarea
                name="aiKnowledge"
                rows={5}
                class="w-full px-4 py-3 bg-stone-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm resize-y custom-scrollbar"
                placeholder="Información sobre la clínica, doctores, horarios, etc."
              >{configData.value.aiKnowledge}</textarea>
              <p class="text-xs text-slate-500 mt-1.5">Esta información se agrega al "prompt" del bot para que pueda responder basándose en estos datos.</p>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={updateAction.isRunning}
              class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
            >
              <LuSave class="w-4 h-4" />
              {updateAction.isRunning ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </Form>
      </div>
    </>
  );
});
