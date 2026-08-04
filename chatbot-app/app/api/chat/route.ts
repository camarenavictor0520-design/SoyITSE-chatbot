import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Instrucción de sistema: respuestas concisas, en el idioma que pida el usuario.
function buildSystemPrompt(language: string) {
  return `Eres SoyITSE, un asistente de IA conversacional.
Responde SIEMPRE en ${language}, a menos que el usuario te pida explícitamente
cambiar de idioma o de voz (hombre/mujer) — en ese caso confirma el cambio en
el nuevo idioma y continúa en ese idioma de ahí en adelante.
Responde de forma clara, cálida y CONCISA: ve directo al punto, evita relleno
y usa listas o pasos solo cuando de verdad ayuden. Si la pregunta es simple,
responde en 1-3 frases.`;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { messages, imageUrl, language } = await req.json();
  // messages: [{ role: 'user' | 'assistant', content: string }, ...]

  const lastUserContent: any[] = [];
  if (imageUrl) {
    const imgResp = await fetch(imageUrl);
    const buffer = Buffer.from(await imgResp.arrayBuffer());
    const mediaType = imgResp.headers.get("content-type") || "image/jpeg";
    lastUserContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: buffer.toString("base64"),
      },
    });
  }

  const formatted = messages.map((m: any, i: number) => {
    if (i === messages.length - 1 && m.role === "user" && lastUserContent.length) {
      return {
        role: m.role,
        content: [...lastUserContent, { type: "text", text: m.content }],
      };
    }
    return { role: m.role, content: m.content };
  });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: buildSystemPrompt(language || "español"),
      messages: formatted,
    });

    const text = response.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");

    return NextResponse.json({ reply: text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Error al contactar al modelo de IA" },
      { status: 500 }
    );
  }
}
