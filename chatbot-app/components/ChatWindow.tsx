"use client";

import ReactMarkdown from "react-markdown";

export type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string | null;
};

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/i;

function fileNameFromUrl(url: string) {
  try {
    return decodeURIComponent(url.split("/").pop()?.split("?")[0] || "archivo");
  } catch {
    return "archivo";
  }
}

export default function ChatWindow({
  messages,
  loading,
  onSpeak,
  onEdit,
}: {
  messages: Message[];
  loading: boolean;
  onSpeak: (text: string) => void;
  onEdit: (index: number) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-0">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        {messages.length === 0 && !loading && (
          <div className="text-center text-mist-400 mt-24">
            <p className="font-display text-2xl mb-2">¿En qué te ayudo hoy?</p>
            <p className="text-sm">
              Escribe, habla o comparte una imagen para empezar.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-sm ${
                m.role === "user"
                  ? "bg-gold-500/95 text-ink-950"
                  : "bg-ink-900/60 border border-gold-400/30 text-mist-100"
              }`}
            >
              {m.image_url && IMAGE_EXT.test(m.image_url) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.image_url}
                  alt="Imagen enviada"
                  className="rounded-lg mb-2 max-h-64"
                />
              )}
              {m.image_url && !IMAGE_EXT.test(m.image_url) && (
                <a
                  href={m.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-2 flex items-center gap-2 text-xs underline opacity-80 hover:opacity-100"
                >
                  📎 {fileNameFromUrl(m.image_url)}
                </a>
              )}
              <ReactMarkdown>{m.content}</ReactMarkdown>
              {m.role === "assistant" && (
                <button
                  onClick={() => onSpeak(m.content)}
                  className="mt-2 text-xs text-mist-400 hover:text-gold-400 transition flex items-center gap-1"
                  title="Leer en voz alta"
                >
                  🔊 Leer en voz alta
                </button>
              )}
              {m.role === "user" && !loading && (
                <button
                  onClick={() => onEdit(i)}
                  className="mt-2 text-xs text-ink-900/70 hover:text-ink-950 transition flex items-center gap-1"
                  title="Editar y volver a enviar"
                >
                  ✏️ Editar
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-ink-800 rounded-2xl px-4 py-3 flex gap-1 items-end h-6">
              <span className="w-1.5 bg-gold-400 rounded-full h-2 animate-wave1" />
              <span className="w-1.5 bg-gold-400 rounded-full h-4 animate-wave2" />
              <span className="w-1.5 bg-gold-400 rounded-full h-3 animate-wave3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
