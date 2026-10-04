import React from 'react';
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
} from 'lucide-react';

interface RobloxHotbarProps {
  items: HotbarItem[];
  activeSlot: number;
  onSelectSlot: (slot: number) => void;
}

export const RobloxHotbar: React.FC<RobloxHotbarProps> = ({
  items,
  activeSlot,
  onSelectSlot,
}) => {
  const getIcon = (type: ToolType) => {
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
        return <Axe className="w-6 h-6" />;
    }
  };

  const activeItem = items.find((i) => i.slot === activeSlot);

  return (
    <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 z-25 flex flex-col items-center select-none pointer-events-auto max-w-[95vw]">
      {/* Active Item Title & Usage Hint */}
      {activeItem && (
        <div className="mb-1 sm:mb-2 px-2.5 sm:px-3 py-0.5 sm:py-1 bg-neutral-900/90 backdrop-blur-md rounded-full border border-neutral-700/80 shadow-lg text-center animate-in fade-in slide-in-from-bottom-2 duration-150 max-w-[90vw] truncate">
          <span className="text-[11px] sm:text-xs font-bold text-amber-400 tracking-wide font-['Cinzel',serif]">
            {activeItem.name}
          </span>
          <span className="hidden xs:inline sm:inline ml-2 text-[10px] text-neutral-300">
            {activeItem.description}
          </span>
        </div>
      )}

      {/* 6 Hotbar Slots */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 p-1 sm:p-1.5 bg-neutral-950/85 backdrop-blur-md rounded-xl border border-neutral-700/70 shadow-2xl overflow-x-auto max-w-full">
        {items.map((item) => {
          const isSelected = item.slot === activeSlot;
          return (
            <button
              key={item.id}
              onTouchStart={(e) => {
                e.stopPropagation();
                onSelectSlot(item.slot);
              }}
              onClick={() => onSelectSlot(item.slot)}
              className={`relative w-9 h-11 xs:w-10 xs:h-12 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center transition-all duration-100 shrink-0 ${
                isSelected
                  ? 'bg-neutral-800 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-105'
                  : 'bg-neutral-900/90 border border-neutral-700/80 hover:bg-neutral-800 hover:border-neutral-500 opacity-90'
              }`}
            >
              {/* Number Key Indicator */}
              <span className="absolute top-0.5 left-1 text-[8px] sm:text-[10px] font-black text-neutral-400">
                {item.slot}
              </span>

              {/* Tool Icon */}
              <div className="transform translate-y-0.5 scale-80 sm:scale-100">
                {getIcon(item.type)}
              </div>

              {/* Bottom Label */}
              <span className="text-[8px] sm:text-[9px] font-bold text-neutral-300 truncate max-w-[36px] sm:max-w-[48px] mt-0.5 leading-none">
                {item.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
