import React from 'react';
import { Smile, Flame, Shield, Beer, Activity, Eye } from 'lucide-react';

interface EmoteMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerEmote: (emoteId: string) => void;
}

export const EmoteMenu: React.FC<EmoteMenuProps> = ({
  isOpen,
  onClose,
  onTriggerEmote,
}) => {
  if (!isOpen) return null;

  const emotes = [
    { id: 'scout', name: 'Look Up & Scout Horizon', icon: <Eye className="w-5 h-5 text-sky-400" /> },
    { id: 'roar', name: 'Viking War Roar', icon: <Flame className="w-5 h-5 text-red-400" /> },
    { id: 'dance', name: 'Roblox Dance', icon: <Activity className="w-5 h-5 text-amber-400" /> },
    { id: 'skol', name: 'Skol Toast', icon: <Beer className="w-5 h-5 text-yellow-300" /> },
    { id: 'bash', name: 'Shield Salute', icon: <Shield className="w-5 h-5 text-cyan-400" /> },
  ];

  return (
    <div className="absolute bottom-24 right-4 z-40 w-56 bg-neutral-950/90 backdrop-blur-md rounded-2xl border border-neutral-700 shadow-2xl p-3 select-none font-sans animate-in zoom-in-95 duration-100">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs font-bold text-amber-400">
        <span className="flex items-center gap-1.5">
          <Smile className="w-4 h-4" />
          <span>Viking Emotes</span>
        </span>
        <button onClick={onClose} className="text-neutral-400 hover:text-white">✕</button>
      </div>

      <div className="grid grid-cols-1 gap-1.5 mt-2">
        {emotes.map((em) => (
          <button
            key={em.id}
            onClick={() => {
              onTriggerEmote(em.id);
              onClose();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-amber-300 text-xs font-bold border border-neutral-800 hover:border-neutral-600 transition"
          >
            {em.icon}
            <span>{em.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
