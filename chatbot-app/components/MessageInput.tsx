"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import CameraCapture from "@/components/CameraCapture";

export type MessageInputHandle = {
  startListening: () => void;
  stopListening: () => void;
  setText: (text: string) => void;
  setRecognitionLang: (lang: string) => void;
};

type Props = {
  onSend: (text: string, file: File | null, viaVoice: boolean) => void;
  disabled: boolean;
  loading: boolean;
  onCancel: () => void;
  conversationMode: boolean;
  onToggleConversationMode: () => void;
  onListeningChange?: (listening: boolean) => void;
};

const MessageInput = forwardRef<MessageInputHandle, Props>(function MessageInput(
  {
    onSend,
    disabled,
    loading,
    onCancel,
    conversationMode,
    onToggleConversationMode,
    onListeningChange,
  },
  ref
) {
  const [text, setTextState] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [listening, setListeningState] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileStateRef = useRef<File | null>(null);
  const textStateRef = useRef("");
  const resultHandledRef = useRef(false);
  const onSendRef = useRef(onSend);
  const menuRef = useRef<HTMLDivElement>(null);
  const onListeningChangeRef = useRef(onListeningChange);

  useEffect(() => {
    onListeningChangeRef.current = onListeningChange;
  }, [onListeningChange]);

  function setListening(v: boolean) {
    setListeningState(v);
    onListeningChangeRef.current?.(v);
  }

  useImperativeHandle(ref, () => ({
    startListening: () => toggleListening(true),
    stopListening: () => toggleListening(false),
    setText: (t: string) => setTextState(t),
    setRecognitionLang: (lang: string) => {
      if (recognitionRef.current) recognitionRef.current.lang = lang;
    },
  }));

  useEffect(() => {
    fileStateRef.current = file;
  }, [file]);

  useEffect(() => {
    textStateRef.current = text;
  }, [text]);

  useEffect(() => {
    onSendRef.current = onSend;
  }, [onSend]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    // Se envía una sola vez, directo desde el resultado final —
    // no se vuelve a disparar desde onend, para evitar respuestas dobles.
    recognition.onresult = (event: any) => {
      if (resultHandledRef.current) return;
      resultHandledRef.current = true;
      const transcript = event.results[0][0].transcript.trim();
      if (!transcript) return;
      const finalText = textStateRef.current
        ? textStateRef.current + " " + transcript
        : transcript;
      onSendRef.current(finalText, fileStateRef.current, true);
      setTextState("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognition.onerror = (event: any) => {
      setListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        alert(
          "El navegador bloqueó el micrófono. Haz clic en el candado 🔒 junto a la URL y permite el acceso al micrófono para este sitio, luego intenta de nuevo."
        );
      } else if (event.error === "no-speech" || event.error === "aborted") {
        // Silencio o se detuvo a propósito; no hace falta alertar.
      } else {
        alert("No se pudo usar el micrófono (" + event.error + "). Intenta de nuevo.");
      }
    };
    recognitionRef.current = recognition;
  }, []);

  function toggleListening(forceStart?: boolean) {
    if (!recognitionRef.current) {
      if (forceStart !== false) {
        alert(
          "Tu navegador no soporta reconocimiento de voz. Usa Google Chrome para esta función."
        );
      }
      return;
    }
    const shouldListen = forceStart !== undefined ? forceStart : !listening;
    if (!shouldListen) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      if (listening) return;
      resultHandledRef.current = false;
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (err) {
        // ya estaba escuchando; se ignora
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onSend(text.trim(), file, false);
    setTextState("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const menuItems = [
    {
      icon: "📎",
      label: "Agregar archivos o fotos",
      onClick: () => fileInputRef.current?.click(),
    },
    {
      icon: "📷",
      label: "Tomar captura",
      onClick: () => setShowCamera(true),
    },
    {
      icon: "🤖",
      label: "Asistente virtual",
      active: conversationMode,
      onClick: onToggleConversationMode,
    },
    {
      icon: "🎤",
      label: listening ? "Apagar micrófono" : "Chat de voz",
      active: listening,
      onClick: () => toggleListening(),
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto w-full px-4 pb-6 pt-2"
    >
      {showCamera && (
        <CameraCapture
          onClose={() => setShowCamera(false)}
          onCapture={(capturedFile) => {
            setFile(capturedFile);
            setShowCamera(false);
          }}
        />
      )}
      {file && (
        <div className="mb-2 text-xs text-mist-400 flex items-center gap-2">
          <span>📎 {file.name}</span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-coral-400 hover:underline"
          >
            Quitar
          </button>
        </div>
      )}
      {listening && (
        <div className="mb-2 text-xs text-coral-400 flex items-center gap-1">
          🔴 Escuchando...
        </div>
      )}
      <div className="flex items-center gap-2 bg-ink-900 border border-ink-700 rounded-full px-3 py-2 focus-within:border-gold-500">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="text-mist-400 hover:text-gold-400 px-1 text-lg leading-none"
            title="Más opciones"
          >
            +
          </button>
          {showMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-ink-800 border border-ink-700 rounded-xl shadow-lg overflow-hidden z-20">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-mist-100 hover:bg-ink-700 transition text-left"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.active && <span className="text-gold-400">●</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setTextState(e.target.value)}
          placeholder="Escribe o habla tu mensaje..."
          className="flex-1 bg-transparent outline-none text-sm py-1 text-mist-100"
        />
        {loading ? (
          <button
            type="button"
            onClick={onCancel}
            className="bg-coral-500 text-ink-950 rounded-full w-9 h-9 flex items-center justify-center hover:bg-coral-400 transition"
            title="Cancelar"
          >
            ⏹
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled}
            className="bg-gold-500 text-ink-950 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gold-400 transition disabled:opacity-50"
          >
            ➤
          </button>
        )}
      </div>
    </form>
  );
});

export default MessageInput;
