"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/chat");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink-950 text-mist-100 px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-8">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-ink-900 border border-ink-700 rounded-lg px-4 py-3 outline-none focus:border-gold-500"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-ink-900 border border-ink-700 rounded-lg px-4 py-3 outline-none focus:border-gold-500"
          />
          {error && <p className="text-coral-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 text-ink-950 font-medium rounded-lg py-3 hover:bg-gold-400 transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-mist-400 text-sm mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-gold-400 underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
