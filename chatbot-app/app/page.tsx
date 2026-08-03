import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-ink-950 text-mist-100 px-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Logo" className="w-16 h-16 mb-4" />
      <div className="flex items-end gap-1 mb-8 h-10">
        <span className="w-1.5 bg-gold-400 rounded-full h-4 animate-wave1" />
        <span className="w-1.5 bg-gold-400 rounded-full h-8 animate-wave2" />
        <span className="w-1.5 bg-coral-400 rounded-full h-10 animate-wave3" />
        <span className="w-1.5 bg-gold-400 rounded-full h-6 animate-wave4" />
      </div>
      <h1 className="font-display text-5xl md:text-6xl text-center mb-4">
        SoyITSE
      </h1>
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
