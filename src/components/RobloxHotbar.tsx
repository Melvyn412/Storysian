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
  Gem,
  Briefcase,
} from 'lucide-react';

interface RobloxHotbarProps {
  items: HotbarItem[];
  activeSlot: number;
  onSelectSlot: (slot: number) => void;
  onToggleBackpack?: () => void;
}

export const RobloxHotbar: React.FC<RobloxHotbarProps> = ({
  items,
  activeSlot,
  onSelectSlot,
  onToggleBackpack,
}) => {
  const getIcon = (type: ToolType) => {
    switch (type) {
      case 'axe':
        return <Axe className="w-5 h-5 sm:w-6 sm:h-6 text-slate-200" />;
      case 'shield':
        return <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />;
      case 'horn':
        return <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />;
      case 'mead':
        return <Beer className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />;
      case 'torch':
        return <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />;
      case 'hammer':
        return <Hammer className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-200" />;
      case 'fishing_rod':
        return <Fish className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />;
      case 'bow':
        return <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />;
      default:
        return <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />;
    }
  };

  const activeItem = items.find((i) => i.slot === activeSlot);

  return (
    <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 z-25 flex flex-col items-center select-none pointer-events-auto max-w-[98vw]">
      {/* Active Item Title & Usage Hint */}
      {activeItem && (
        <div className="mb-1 sm:mb-1.5 px-3 py-0.5 sm:py-1 bg-neutral-900/90 backdrop-blur-md rounded-full border border-neutral-700/80 shadow-lg text-center animate-in fade-in slide-in-from-bottom-2 duration-150 max-w-[90vw] truncate">
          <span className="text-[11px] sm:text-xs font-bold text-amber-400 tracking-wide font-['Cinzel',serif]">
            {activeItem.name}
          </span>
          <span className="hidden xs:inline sm:inline ml-2 text-[10px] text-neutral-300">
            {activeItem.description}
          </span>
        </div>
      )}

      {/* Hotbar Slots + Backpack Drawer Button */}
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-neutral-950/85 backdrop-blur-md rounded-xl border border-neutral-700/70 shadow-2xl overflow-x-auto max-w-full">
        {/* Backpack Button */}
        {onToggleBackpack && (
          <button
            onClick={onToggleBackpack}
            className="w-8 h-10 xs:w-9 xs:h-11 sm:w-11 sm:h-12 rounded-lg bg-neutral-900/90 border border-neutral-700/80 hover:bg-neutral-800 text-amber-400 flex flex-col items-center justify-center transition shrink-0 cursor-pointer"
            title="Open Backpack (~)"
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-[7px] font-black uppercase text-neutral-400 mt-0.5">~</span>
          </button>
        )}

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
              className={`relative w-8 h-10 xs:w-9 xs:h-11 sm:w-11 sm:h-12 md:w-12 md:h-13 rounded-lg flex flex-col items-center justify-center transition-all duration-100 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-105 z-10'
                  : 'bg-neutral-900/90 border border-neutral-700/80 hover:bg-neutral-800 hover:border-neutral-500 opacity-90'
              }`}
            >
              {/* Number Key Indicator */}
              <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-black text-neutral-400">
                {item.slot}
              </span>

              {/* Tool Icon */}
              <div className="transform translate-y-0.5 scale-75 sm:scale-90">
                {getIcon(item.type)}
              </div>

              {/* Bottom Label */}
              <span className="text-[7px] sm:text-[8px] font-bold text-neutral-300 truncate max-w-[32px] sm:max-w-[42px] mt-0.5 leading-none">
                {item.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
