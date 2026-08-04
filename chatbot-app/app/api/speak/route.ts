import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Voces predeterminadas de OpenAI TTS (disponibles en cualquier cuenta con
// una API key de OpenAI, sin necesidad de configuración extra).
const VOICE_NAMES: Record<"male" | "female", string> = {
  female: "nova",
  male: "onyx",
};

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { text, gender } = await req.json();
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Falta texto" }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Falta configurar OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const voice = VOICE_NAMES[gender === "male" ? "male" : "female"];

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        voice,
        input: text,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI TTS error:", errText);
      return NextResponse.json({ error: "Error al generar audio" }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al generar audio" }, { status: 500 });
  }
}
