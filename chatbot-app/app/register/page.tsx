"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink-950 text-mist-100 px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-8">Crear cuenta</h1>
        {done ? (
          <p className="text-mist-400">
            Revisa tu correo para confirmar la cuenta y luego{" "}
            <Link href="/login" className="text-gold-400 underline">
              inicia sesión
            </Link>
            .
          </p>
        ) : (
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
              minLength={6}
              placeholder="Contraseña (mín. 6 caracteres)"
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
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>
        )}
        <p className="text-mist-400 text-sm mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-gold-400 underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
