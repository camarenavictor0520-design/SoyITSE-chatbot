# SoyITSE — Chatbot con IA

Aplicación web completa de chatbot: respuestas inteligentes (Claude), voz
(hablar y escuchar), historial de conversaciones, carga de imágenes y
registro/inicio de sesión de usuarios.

## Stack

- **Next.js 14** (React) — frontend y backend en un solo proyecto
- **Supabase** — autenticación, base de datos (historial) y almacenamiento (imágenes)
- **Anthropic API (Claude)** — el "cerebro" del chatbot, incluye visión para las imágenes
- **Web Speech API** (nativa del navegador) — reconocimiento de voz y texto a voz, sin costo

## 1. Configura Supabase (gratis)

1. Crea una cuenta en https://supabase.com y un nuevo proyecto.
2. Ve a **SQL Editor** y pega el contenido de `supabase-schema.sql`. Ejecútalo.
   Esto crea las tablas `conversations` y `messages`, las reglas de seguridad
   (cada usuario solo ve sus propios chats) y el bucket de imágenes.
3. Ve a **Authentication > Providers** y confirma que "Email" esté activado
   (viene activado por defecto).
4. Ve a **Project Settings > API** y copia la `Project URL` y la `anon public key`.

## 2. Consigue tu clave de Anthropic

1. Crea una cuenta en https://console.anthropic.com
2. Genera una API key en **API Keys**.

## 3. Consigue tu clave de ElevenLabs (voz natural)

1. Crea una cuenta gratis en https://elevenlabs.io
2. Ve a tu perfil (ícono arriba a la derecha) → **API Keys** y genera una.
3. El plan gratis incluye minutos de voz de sobra para probar. Si se agotan
   los créditos o falla la conexión, la app usa automáticamente la voz del
   navegador como respaldo, así que nunca se queda muda.

## 4. Configura el proyecto localmente

```bash
cp .env.local.example .env.local
# pega tus 3 claves en .env.local

npm install
npm run dev
```

Abre http://localhost:3000

## 5. Publícalo en internet (gratis, con Vercel)

1. Sube este proyecto a un repositorio de GitHub.
2. Ve a https://vercel.com, importa el repositorio.
3. En **Environment Variables**, agrega las mismas 4 variables de tu `.env.local`.
4. Despliega. En unos minutos tendrás una URL pública (ej. `atlas.vercel.app`).

## Funcionalidades incluidas

- ✅ Registro e inicio de sesión (Supabase Auth)
- ✅ Respuestas inteligentes y **concisas** vía Claude (instrucción de sistema ajustada)
- ✅ Chat de voz: micrófono para hablarle y síntesis de voz para que te responda
- ✅ Carga de imágenes (el modelo las analiza con visión)
- ✅ Historial de conversaciones guardado por usuario, con barra lateral
- ✅ Diseño propio (no plantilla genérica): paleta verde tinta / dorado, tipografía Fraunces + Inter

## Cómo cambiar el logo

Simplemente reemplaza el archivo `public/logo.svg` por tu propio logo (puede ser .svg, .png o .jpg — si usas otro formato, actualiza también las referencias `/logo.svg` en `app/page.tsx` y `app/chat/page.tsx` por el nuevo nombre de archivo). No necesitas tocar nada más del código.

## Ideas para seguir ampliándolo

- Streaming de la respuesta palabra por palabra (Server-Sent Events)
- Editar/borrar conversaciones desde la barra lateral
- Selector de "personalidad" o modelo
- Modo oscuro/claro
- Exportar una conversación a PDF (útil para la entrega del curso)
