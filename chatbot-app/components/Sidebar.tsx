"use client";

import { useState } from "react";

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onLogout,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onLogout: () => void;
  onDelete: (id: string) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <aside className="w-64 shrink-0 bg-ink-900 border-r border-ink-700 h-screen flex flex-col p-3">
      <button
        onClick={onNew}
        className="mb-4 px-4 py-2 rounded-lg bg-gold-500 text-ink-950 font-medium text-sm hover:bg-gold-400 transition"
      >
        + Nueva conversación
      </button>
      <div className="flex-1 overflow-y-auto space-y-1">
        {conversations.map((c) => (
          <div key={c.id} className="relative group">
            <button
              onClick={() => onSelect(c.id)}
              className={`w-full text-left pl-3 pr-8 py-2 rounded-lg text-sm truncate transition ${
                c.id === activeId
                  ? "bg-ink-700 text-mist-100"
                  : "text-mist-400 hover:bg-ink-800"
              }`}
            >
              {c.title || "Nueva conversación"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === c.id ? null : c.id);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-1.5 py-1 rounded text-mist-400 hover:text-mist-100 transition"
              title="Opciones"
            >
              ⋮
            </button>
            {openMenuId === c.id && (
              <div className="absolute right-0 top-full mt-1 z-10 w-40 bg-ink-800 border border-ink-700 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(null);
                    onDelete(c.id);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-coral-400 hover:bg-ink-700 transition"
                >
                  🗑️ Borrar chat
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onLogout}
        className="mt-4 text-sm text-mist-400 hover:text-coral-400 transition text-left"
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
