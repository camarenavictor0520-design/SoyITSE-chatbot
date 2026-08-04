"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";
import ChatWindow, { Message } from "@/components/ChatWindow";
import MessageInput, { MessageInputHandle } from "@/components/MessageInput";
import VoiceOverlay, { VoiceStatus } from "@/components/VoiceOverlay";

// Idiomas que el asistente puede hablar si el usuario lo pide.
const LANG_TTS: Record<string, string> = {
  es: "es-ES",
  en: "en-US",
  zh: "zh-CN",
  fr: "fr-FR",
  ar: "ar-SA",
  hi: "hi-IN",
  pt: "pt-BR",
};
const LANG_NAME: Record<string, string> = {
  es: "español",
  en: "inglés",
  zh: "mandarín",
  fr: "francés",
  ar: "árabe",
  hi: "hindi",
  pt: "portugués",
};
// Frases que activan un cambio de idioma o de voz. Solo cambian si el
// usuario lo pide explícitamente — nunca aparece un botón visible para esto.
const LANG_TRIGGERS: [string, string][] = [
  ["ingles", "en"],
  ["english", "en"],
  ["mandarin", "zh"],
  ["chino", "zh"],
  ["frances", "fr"],
  ["francés", "fr"],
  ["arabe", "ar"],
  ["árabe", "ar"],
  ["hindi", "hi"],
  ["portugues", "pt"],
  ["portugués", "pt"],
  ["español", "es"],
  ["espanol", "es"],
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectLanguageRequest(text: string): string | null {
  const t = normalize(text);
  if (!/(habla|responde|contesta|cambia).*(idioma|en )/.test(t) && !/habla en/.test(t))
    return null;
  for (const [needle, code] of LANG_TRIGGERS) {
    if (t.includes(normalize(needle))) return code;
  }
  return null;
}

// Quita emojis y símbolos antes de hablar, para que no diga "carita
// sonriente" ni nombres de emojis en voz alta.
function stripEmojis(text: string) {
  return text
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu,
      ""
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Nombres de voces conocidas por idioma/género — Chrome, Edge y otros
// navegadores traen voces con estos nombres según el sistema operativo.
const GENDER_VOICE_NAMES: Record<string, { male: string[]; female: string[] }> = {
  es: {
    male: ["pablo", "jorge", "diego", "enrique", "miguel", "andres", "male", "hombre"],
    female: ["helena", "sabina", "laura", "monica", "mónica", "paulina", "elvira", "lucia", "female", "mujer"],
  },
  en: {
    male: ["david", "mark", "guy", "daniel", "fred", "alex", "male"],
    female: ["zira", "samantha", "susan", "karen", "victoria", "aria", "jenny", "female"],
  },
  zh: {
    male: ["yunyang", "kangkang", "male"],
    female: ["xiaoxiao", "huihui", "yaoyao", "female"],
  },
  fr: {
    male: ["paul", "henri", "guillaume", "male"],
    female: ["julie", "hortense", "denise", "female"],
  },
  ar: {
    male: ["hamed", "naayf", "male"],
    female: ["zariah", "salma", "female"],
  },
  hi: {
    male: ["hemant", "madhur", "male"],
    female: ["kalpana", "swara", "female"],
  },
  pt: {
    male: ["daniel", "antonio", "antónio", "male"],
    female: ["maria", "francisca", "raquel", "female"],
  },
};

let cachedVoices: SpeechSynthesisVoice[] = [];
function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length) {
      cachedVoices = existing;
      resolve(existing);
      return;
    }
    synth.onvoiceschanged = () => {
      cachedVoices = synth.getVoices();
      resolve(cachedVoices);
    };
    // Algunos navegadores nunca disparan voiceschanged si ya estaban listas.
    setTimeout(() => resolve(synth.getVoices().length ? synth.getVoices() : cachedVoices), 300);
  });
}

export default function ChatPage() {
  const supabase = createClient();
  const router = useRouter();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [assistantLang, setAssistantLang] = useState("es");
  const [assistantGender, setAssistantGender] = useState<"female" | "male">(
    "male"
  );
  const assistantLangRef = useRef(assistantLang);
  const assistantGenderRef = useRef(assistantGender);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<MessageInputHandle>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const conversationModeRef = useRef(conversationMode);
  const mutedRef = useRef(muted);

  useEffect(() => {
    assistantLangRef.current = assistantLang;
  }, [assistantLang]);

  useEffect(() => {
    assistantGenderRef.current = assistantGender;
  }, [assistantGender]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    conversationModeRef.current = conversationMode;
  }, [conversationMode]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function loadConversations() {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });
    setConversations(data || []);
    if (data && data.length && !activeId) {
      selectConversation(data[0].id);
    }
  }

  async function selectConversation(id: string) {
    setActiveId(id);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    setMessages(
      (data || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        image_url: m.image_url,
      }))
    );
  }

  async function newConversation() {
    setActiveId(null);
    setMessages([]);
  }

  async function handleDeleteConversation(id: string) {
    await supabase.from("conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // Habla la respuesta y, si el modo conversación está activo, vuelve a
  // escuchar automáticamente al terminar — como una llamada real.
  const speakingKeepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  function stopSpeaking() {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    if (speakingKeepAliveRef.current) clearInterval(speakingKeepAliveRef.current);
    setSpeaking(false);
  }

  // Voz principal: audio real generado por ElevenLabs (mucho más natural).
  // Si falla (sin clave, sin créditos, sin internet), cae automáticamente
  // a la voz del navegador para que la conversación no se corte.
  async function speak(text: string, onDone?: () => void) {
    const cleanText = stripEmojis(text);
    if (!cleanText) {
      onDone?.();
      return;
    }
    stopSpeaking();

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, gender: assistantGenderRef.current }),
      });
      if (!res.ok) throw new Error("tts-failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      setSpeaking(true);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudioRef.current = null;
        setSpeaking(false);
        onDone?.();
      };
      audio.onerror = () => {
        currentAudioRef.current = null;
        setSpeaking(false);
        onDone?.();
      };
      await audio.play();
    } catch (err) {
      console.error("Fallo ElevenLabs, usando voz del navegador como respaldo:", err);
      speakBrowserFallback(cleanText, onDone);
    }
  }

  async function speakBrowserFallback(cleanText: string, onDone?: () => void) {
    const synth = window.speechSynthesis;
    if (!synth) {
      onDone?.();
      return;
    }
    synth.cancel();

    const lang = LANG_TTS[assistantLangRef.current] || "es-ES";
    const langCode = lang.split("-")[0];
    const gender = assistantGenderRef.current;
    const names = GENDER_VOICE_NAMES[langCode];

    const voices = await getVoicesAsync();
    const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(langCode));
    const pool = matching.length ? matching : voices;
    const byGender = names
      ? pool.find((v) => names[gender].some((k) => v.name.toLowerCase().includes(k)))
      : undefined;
    const chosenVoice = byGender || pool[0];

    const chunks = cleanText
      .split(/(?<=[.!?;:\n])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!chunks.length) {
      onDone?.();
      return;
    }

    setSpeaking(true);
    speakingKeepAliveRef.current = setInterval(() => {
      if (synth.speaking) {
        synth.pause();
        synth.resume();
      }
    }, 10000);

    chunks.forEach((chunk, i) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = lang;
      utterance.pitch = gender === "male" ? 0.75 : 1.15;
      utterance.rate = gender === "male" ? 0.95 : 1.03;
      if (chosenVoice) utterance.voice = chosenVoice;

      if (i === chunks.length - 1) {
        utterance.onend = () => {
          if (speakingKeepAliveRef.current) clearInterval(speakingKeepAliveRef.current);
          setSpeaking(false);
          onDone?.();
        };
        utterance.onerror = () => {
          if (speakingKeepAliveRef.current) clearInterval(speakingKeepAliveRef.current);
          setSpeaking(false);
          onDone?.();
        };
      }
      synth.speak(utterance);
    });
  }

  function toggleConversationMode() {
    setConversationMode((prev) => {
      const next = !prev;
      if (next) {
        setMuted(false);
        // Empieza a escuchar de inmediato, como si contestaras el teléfono.
        setTimeout(() => inputRef.current?.startListening(), 0);
      } else {
        stopSpeaking();
        inputRef.current?.stopListening();
      }
      return next;
    });
  }

  function toggleMute() {
    setMuted((prev) => {
      const next = !prev;
      if (next) {
        inputRef.current?.stopListening();
      } else {
        stopSpeaking();
        setTimeout(() => inputRef.current?.startListening(), 0);
      }
      return next;
    });
  }

  function handleCancel() {
    abortControllerRef.current?.abort();
    setLoading(false);
  }

  // Quita el mensaje del usuario (y lo que le siguiera) del historial y de la
  // base de datos, y lo deja listo para editar en el campo de texto — sin
  // tener que volver a escribir la pregunta desde cero.
  async function handleEdit(index: number) {
    const target = messages[index];
    if (!target || target.role !== "user") return;
    const idsToDelete = messages
      .slice(index)
      .map((m) => m.id)
      .filter(Boolean) as string[];
    if (idsToDelete.length) {
      await supabase.from("messages").delete().in("id", idsToDelete);
    }
    setMessages((prev) => prev.slice(0, index));
    inputRef.current?.setText(target.content);
  }

  async function handleSend(text: string, file: File | null, viaVoice: boolean) {
    const requestedLang = detectLanguageRequest(text);
    if (requestedLang && requestedLang !== assistantLangRef.current) {
      setAssistantLang(requestedLang);
      inputRef.current?.setRecognitionLang(LANG_TTS[requestedLang]);
    }
    // La voz del asistente queda fija en Adam (masculina); ya no cambia por
    // petición del usuario.

    setLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let convId = activeId;
    if (!convId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user!.id,
          title: text.slice(0, 40) || "Imagen",
        })
        .select()
        .single();
      if (error || !data) {
        setLoading(false);
        return;
      }
      convId = data.id;
      setActiveId(convId);
      setConversations((prev) => [data, ...prev]);
    }

    let imageUrl: string | null = null;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      imageUrl = json.url || null;
    }

    const { data: savedUserMsg } = await supabase
      .from("messages")
      .insert({
        conversation_id: convId,
        role: "user",
        content: text,
        image_url: imageUrl,
      })
      .select()
      .single();

    const userMessage: Message = {
      id: savedUserMsg?.id,
      role: "user",
      content: text,
      image_url: imageUrl,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          imageUrl,
          language: LANG_NAME[assistantLangRef.current] || "español",
        }),
        signal: controller.signal,
      });
      const json = await res.json();
      const reply = json.reply || "Lo siento, ocurrió un error al responder.";

      const { data: savedAssistantMsg } = await supabase
        .from("messages")
        .insert({
          conversation_id: convId,
          role: "assistant",
          content: reply,
        })
        .select()
        .single();

      setMessages((prev) => [
        ...prev,
        { id: savedAssistantMsg?.id, role: "assistant", content: reply },
      ]);

      setLoading(false);

      if (conversationModeRef.current) {
        speak(reply, () => {
          if (conversationModeRef.current && !mutedRef.current) {
            inputRef.current?.startListening();
          }
        });
      }
    } catch (err: any) {
      setLoading(false);
      if (err?.name !== "AbortError") {
        console.error(err);
      }
      // Si se canceló, el mensaje del usuario ya quedó guardado arriba;
      // puede editarlo o volver a preguntar sin perder el historial.
    }
  }

  const voiceStatus: VoiceStatus = voiceListening
    ? "listening"
    : loading && conversationMode
    ? "thinking"
    : speaking
    ? "speaking"
    : "idle";

  return (
    <div className="flex h-screen bg-ink-950 text-mist-100">
      {conversationMode && (
        <VoiceOverlay
          status={voiceStatus}
          muted={muted}
          onToggleMute={toggleMute}
          onClose={toggleConversationMode}
        />
      )}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNew={newConversation}
        onLogout={handleLogout}
        onDelete={handleDeleteConversation}
      />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Logo" className="w-7 h-7" />
            <h1 className="font-display text-lg">SoyITSE</h1>
          </div>
        </header>
        <ChatWindow
          messages={messages}
          loading={loading}
          onSpeak={speak}
          onEdit={handleEdit}
        />
        <div ref={bottomRef} />
        <MessageInput
          ref={inputRef}
          onSend={handleSend}
          disabled={false}
          loading={loading}
          onCancel={handleCancel}
          conversationMode={conversationMode}
          onToggleConversationMode={toggleConversationMode}
          onListeningChange={setVoiceListening}
          onBeforeListen={stopSpeaking}
        />
      </div>
    </div>
  );
}
