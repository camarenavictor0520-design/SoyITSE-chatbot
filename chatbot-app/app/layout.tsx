import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoyITSE — Tu asistente de IA",
  description: "Chatbot inteligente con voz, imágenes e historial",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-body">{children}</body>
    </html>
  );
}
