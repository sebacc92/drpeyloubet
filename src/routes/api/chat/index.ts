import type { RequestHandler } from "@builder.io/qwik-city";
import OpenAI from "openai";
import { getDb, siteSettings, chatSessions, chatMessages } from "~/db";

export const onPost: RequestHandler = async (event) => {
  const apiKey = event.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    event.json(500, { error: "Falta configurar OPENAI_API_KEY" });
    return;
  }

  try {
    const body = await event.request.json();
    if (!body || !body.messages) {
      event.json(400, { error: "El formato de mensajes es incorrecto" });
      return;
    }

    const { messages, sessionId } = body;
    
    if (!Array.isArray(messages)) {
      event.json(400, { error: "El formato de mensajes es incorrecto" });
      return;
    }

    const db = getDb(event.env);
    const settingsRows = await db.select().from(siteSettings);
    const settings: Record<string, string> = {};
    settingsRows.forEach(row => { settings[row.key] = row.value; });

    if (settings.aiEnabled === "false") {
      event.json(403, { error: "El Chatbot se encuentra deshabilitado actualmente." });
      return;
    }

    if (sessionId) {
      await db.insert(chatSessions).values({
        id: sessionId,
        createdAt: new Date(),
        lastActive: new Date()
      }).onConflictDoUpdate({
        target: chatSessions.id,
        set: { lastActive: new Date() }
      });

      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === "user") {
        await db.insert(chatMessages).values({
          id: "msg-" + Date.now().toString() + Math.floor(Math.random() * 1000),
          sessionId,
          role: "user",
          content: lastUserMessage.content,
          createdAt: new Date()
        });
      }
    }

    const openai = new OpenAI({ apiKey });

    const aiTone = settings.aiTone || "profesional, empático, confidencial y de alta gama";
    const whatsapp = settings.whatsappNumber || "";
    const extraKnowledge = settings.aiKnowledge || "Información general de la clínica";

    const systemPrompt = `Eres el asistente virtual premium de la clínica de cirugía plástica de los Dres. Daniel Lafranconi y Sergio Pagani en Mar del Plata. Tu tono es ${aiTone}. Tu objetivo es resolver dudas frecuentes y guiar al paciente a agendar una consulta médica. No das diagnósticos médicos.

INFORMACIÓN ADICIONAL DE LA CLÍNICA:
${extraKnowledge}

REGLAS:
1. TRATO NEUTRO Y RESPETUOSO: Mantén siempre la confidencialidad.
2. CERO ALUCINACIONES: Si no sabes una respuesta, indica que deben comunicarse directamente con la clínica.
3. WHATSAPP DE CONTACTO: Si el paciente quiere agendar un turno o consultar precios específicos que no conoces, diles que pueden escribir al WhatsApp: ${whatsapp}.`;

    const systemMessage = {
      role: "system",
      content: systemPrompt
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemMessage, ...messages.map((m: any) => ({ role: m.role, content: m.content }))],
      temperature: 0.7,
      max_tokens: 500,
    });

    const botResponse = response.choices[0]?.message?.content || "Hubo un error al procesar tu solicitud.";

    if (sessionId) {
      await db.insert(chatMessages).values({
        id: "msg-" + Date.now().toString() + Math.floor(Math.random() * 1000),
        sessionId,
        role: "assistant",
        content: botResponse,
        createdAt: new Date()
      });
    }

    event.json(200, { reply: botResponse });
  } catch (error) {
    console.error("Error en API de Chat:", error);
    event.json(500, { error: "Error interno del servidor de chat" });
  }
};
