import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-ink-950 text-mist-100 px-6 py-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/portada-itse.png"
        alt="ITSE — Instituto Técnico Superior Especializado"
        className="w-full max-w-xl rounded-2xl shadow-2xl shadow-black/50 mb-10"
      />
      <p className="text-mist-400 text-center max-w-md mb-10">
        Un asistente que conversa, escucha, ve y recuerda. Habla con voz,
        comparte imágenes y retoma cualquier conversación donde la dejaste.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-full bg-gold-500 text-ink-950 font-medium hover:bg-gold-400 transition"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 rounded-full border border-ink-700 hover:border-gold-500 transition"
        >
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
