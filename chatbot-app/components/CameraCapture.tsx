"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setError(
          "No se pudo acceder a la cámara. Revisa que le hayas dado permiso a este sitio (candado 🔒 junto a la URL)."
        );
      }
    }
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `foto-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
      }
    }, "image/jpeg");
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-ink-900 border border-ink-700 rounded-2xl p-4 max-w-md w-full">
        {error ? (
          <p className="text-coral-400 text-sm mb-4">{error}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black"
          />
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-ink-700 text-sm text-mist-400 hover:border-coral-400 transition"
          >
            Cancelar
          </button>
          {!error && (
            <button
              type="button"
              onClick={handleCapture}
              className="px-4 py-2 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition"
            >
              📸 Capturar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
