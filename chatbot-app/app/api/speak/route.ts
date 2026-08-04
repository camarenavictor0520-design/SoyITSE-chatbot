import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Voces predeterminadas de ElevenLabs (disponibles en cualquier cuenta).
const VOICE_IDS: Record<"male" | "female", string> = {
  female: "21m00Tcm4TlvDq8ikWAM", // Rachel
  male: "pNInz6obpgDQGcFmaJgB", // Adam
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
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "Falta configurar ELEVENLABS_API_KEY" },
      { status: 500 }
    );
  }

  const voiceId = VOICE_IDS[gender === "male" ? "male" : "female"];

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          // Modelo multilingüe: detecta el idioma del texto automáticamente
          // (español, inglés, mandarín, francés, árabe, hindi, portugués...).
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs error:", errText);
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
