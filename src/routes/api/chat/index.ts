import type { RequestHandler } from "@builder.io/qwik-city";
import OpenAI from "openai";
import { getDb, chatLogs } from "~/db";

export const onPost: RequestHandler = async (event) => {
  const apiKey = event.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    event.json(500, { error: "Falta configurar OPENAI_API_KEY" });
    return;
  }

  try {
    const { messages, sessionId } = await event.request.json();
    
    if (!Array.isArray(messages)) {
      event.json(400, { error: "El formato de mensajes es incorrecto" });
      return;
    }

    const openai = new OpenAI({ apiKey });

    const systemMessage = {
      role: "system",
      content: "Eres el asistente virtual premium de la clínica de cirugía plástica de los Dres. Daniel Lafranconi y Sergio Pagani en Mar del Plata. Tu tono es profesional, empático, confidencial y de alta gama. Tu objetivo es resolver dudas frecuentes y guiar al paciente a agendar una consulta médica. No das diagnósticos médicos."
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    const botResponse = response.choices[0]?.message?.content || "Hubo un error al procesar tu solicitud.";

    // Guardar en Turso DB (opcional, para mantener el log del chat)
    if (sessionId) {
      const db = getDb(event.env);
      const userMessage = messages[messages.length - 1]?.content || "";
      await db.insert(chatLogs).values({
        sessionId,
        userMessage,
        botResponse
      });
    }

    event.json(200, { reply: botResponse });
  } catch (error) {
    console.error("Error en API de Chat:", error);
    event.json(500, { error: "Error interno del servidor de chat" });
  }
};
