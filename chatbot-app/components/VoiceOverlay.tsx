"use client";

export type VoiceStatus = "idle" | "listening" | "thinking" | "speaking";

const STATUS_LABEL: Record<VoiceStatus, string> = {
  idle: "Toca para hablar",
  listening: "Escuchando...",
  thinking: "Pensando...",
  speaking: "Hablando...",
};

const STATUS_ANIMATION: Record<VoiceStatus, string> = {
  idle: "animate-[orb-idle-pulse_2.5s_ease-in-out_infinite]",
  listening: "animate-[orb-listening-pulse_1.1s_ease-in-out_infinite]",
  thinking: "animate-[orb-thinking-spin_1.8s_ease-in-out_infinite]",
  speaking: "animate-[orb-speaking-pulse_0.8s_ease-in-out_infinite]",
};

export default function VoiceOverlay({
  status,
  muted,
  onToggleMute,
  onClose,
}: {
  status: VoiceStatus;
  muted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-ink-950 z-50 flex flex-col items-center justify-between py-16">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="SoyITSE" className="w-6 h-6" />
        <span className="text-mist-400 text-sm font-display">SoyITSE</span>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full blur-2xl opacity-70 bg-gradient-to-br from-gold-400 via-coral-400 to-ink-700 ${STATUS_ANIMATION[status]}`}
          />
          <div
            className={`absolute inset-6 rounded-full opacity-90 bg-gradient-to-tr from-coral-500 via-gold-400 to-gold-500 ${STATUS_ANIMATION[status]}`}
          />
        </div>
        <p className="text-mist-200 text-sm tracking-wide">
          {STATUS_LABEL[status]}
        </p>
      </div>

      <div className="flex items-center gap-8">
        <button
          onClick={onToggleMute}
          className="w-14 h-14 rounded-full border border-ink-700 flex items-center justify-center text-xl hover:border-gold-500 transition"
          title={muted ? "Activar micrófono" : "Silenciar micrófono"}
        >
          {muted ? "🔇" : "🎤"}
        </button>
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-coral-500 flex items-center justify-center text-xl text-ink-950 hover:bg-coral-400 transition"
          title="Cerrar asistente de voz"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
