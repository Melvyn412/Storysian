import React from 'react';
import { X, Briefcase, Sparkles, Check, GripVertical } from 'lucide-react';
import { HotbarItem, ToolType } from '../types';
import {
  Axe,
  Shield,
  Volume2,
  Beer,
  Flame,
  Hammer,
  Fish,
  Target,
  Gem,
} from 'lucide-react';

interface RobloxBackpackModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: HotbarItem[];
  activeSlot: number;
  onSelectSlot: (slot: number) => void;
  onSwapSlots?: (slotA: number, slotB: number) => void;
}

export const RobloxBackpackModal: React.FC<RobloxBackpackModalProps> = ({
  isOpen,
  onClose,
  items,
  activeSlot,
  onSelectSlot,
}) => {
  if (!isOpen) return null;

  const getToolIcon = (type: ToolType) => {
    switch (type) {
      case 'axe':
        return <Axe className="w-6 h-6 text-slate-200" />;
      case 'shield':
        return <Shield className="w-6 h-6 text-red-400" />;
      case 'horn':
        return <Volume2 className="w-6 h-6 text-amber-300" />;
      case 'mead':
        return <Beer className="w-6 h-6 text-amber-400" />;
      case 'torch':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'hammer':
        return <Hammer className="w-6 h-6 text-yellow-200" />;
      case 'fishing_rod':
        return <Fish className="w-6 h-6 text-sky-400" />;
      case 'bow':
        return <Target className="w-6 h-6 text-orange-400" />;
      default:
        return <Gem className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-black/60 backdrop-blur-sm p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#191b1d]/95 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#111214] border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Roblox Backpack & Equipment (Slots 1-9)
              </h2>
              <p className="text-[10px] text-neutral-400">
                Click any tool to equip. Press number keys 1–9 or ~ in-game.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
            title="Close Backpack (~)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9 Slots Grid */}
        <div className="p-5">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {items.map((item) => {
              const isEquipped = item.slot === activeSlot;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSlot(item.slot);
                  }}
                  className={`group relative p-3 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer h-28 ${
                    isEquipped
                      ? 'bg-neutral-800/90 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-102 ring-1 ring-amber-400/50'
                      : 'bg-neutral-900/80 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  {/* Slot Number Badge */}
                  <span className="absolute top-2 left-2 text-[10px] font-black font-mono px-1.5 py-0.5 rounded bg-neutral-950/80 text-amber-400 border border-neutral-700/60">
                    {item.slot}
                  </span>

                  {/* Active Indicator */}
                  {isEquipped && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">
                      Equipped
                    </span>
                  )}

                  {/* Tool Icon */}
                  <div className="mt-4 transform group-hover:scale-110 transition-transform">
                    {getToolIcon(item.type)}
                  </div>

                  {/* Tool Name */}
                  <div className="w-full text-center mt-1">
                    <div className="text-xs font-bold text-white truncate">
                      {item.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Tip: Press <kbd className="bg-neutral-800 px-1 rounded text-neutral-200">~</kbd> anytime to open/close backpack</span>
            <span className="text-amber-400 font-semibold">{items.length} Tools Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
