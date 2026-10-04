import React from 'react';
import { PlayerStats } from '../types';
import { Heart, Zap, Trees, ShieldAlert, Sparkles } from 'lucide-react';

interface PlayerHUDProps {
  stats: PlayerStats;
  interactionPrompt: string | null;
  damageFlash: boolean;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({
  stats,
  interactionPrompt,
  damageFlash,
}) => {
  const healthPercent = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
  const staminaPercent = Math.max(0, Math.min(100, (stats.stamina / stats.maxStamina) * 100));

  return (
    <div className="pointer-events-none select-none">
      {/* Red screen flash on damage */}
      {damageFlash && (
        <div className="absolute inset-0 bg-red-600/30 z-20 pointer-events-none transition-opacity duration-150 animate-pulse" />
      )}

      {/* Center Screen Crosshair (Roblox Style) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none">
        <div className="w-1.5 h-1.5 bg-white/80 rounded-full shadow-[0_0_4px_black]" />
      </div>

      {/* Health, Stamina & Resources: on mobile sits top-left below topbar, on desktop bottom-left */}
      <div className="absolute top-12 left-2.5 sm:top-14 sm:left-3 md:top-auto md:bottom-20 z-20 flex flex-col gap-1.5 max-w-[200px] sm:max-w-[220px] md:max-w-[240px]">
        {/* Resource Badges: Wood & Iron */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-neutral-900/85 backdrop-blur-md rounded-lg border border-neutral-700/80 text-amber-200 text-[10px] sm:text-xs shadow-md">
            <Trees className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
            <span className="font-bold">{stats.wood}</span>
            <span className="text-[9px] sm:text-[10px] text-neutral-400">Timber</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-neutral-900/85 backdrop-blur-md rounded-lg border border-neutral-700/80 text-blue-200 text-[10px] sm:text-xs shadow-md">
            <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span className="font-bold">{stats.iron}</span>
            <span className="text-[9px] sm:text-[10px] text-neutral-400">Iron</span>
          </div>
        </div>

        {/* Health Bar (Classic Roblox Green Bar) */}
        <div className="p-1.5 sm:p-2 bg-neutral-950/85 backdrop-blur-md rounded-xl border border-neutral-700/80 shadow-xl space-y-1 sm:space-y-1.5">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-neutral-200">
            <div className="flex items-center gap-1 text-red-400">
              <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-red-500 text-red-500" />
              <span>HEALTH</span>
            </div>
            <span className="font-mono text-[10px] sm:text-xs tabular-nums">
              {Math.round(stats.health)} / {stats.maxHealth}
            </span>
          </div>

          <div className="w-full h-2 sm:h-3 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-neutral-700">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                healthPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : healthPercent > 25
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>

          {/* Stamina Bar */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-neutral-300 pt-0.5">
            <div className="flex items-center gap-1 text-cyan-400">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-cyan-400 text-cyan-400" />
              <span>STAMINA</span>
            </div>
            <span className="font-mono text-[9px] sm:text-[10px] tabular-nums">
              {Math.round(stats.stamina)}%
            </span>
          </div>

          <div className="w-full h-1 sm:h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-100"
              style={{ width: `${staminaPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Floating Interaction Prompt */}
      {interactionPrompt && (
        <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2 bg-neutral-900/90 backdrop-blur-md rounded-full border-2 border-amber-400 text-amber-300 font-bold text-xs sm:text-sm tracking-wide shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{interactionPrompt}</span>
        </div>
      )}

      {/* Subtle Desktop Hotkeys Hint */}
      <div className="hidden xl:flex absolute bottom-4 left-44 z-20 items-center gap-2 px-3 py-1 bg-neutral-900/80 backdrop-blur-md rounded-lg border border-neutral-800/80 text-[11px] text-neutral-300 shadow-md">
        <span><kbd className="px-1 py-0.5 bg-neutral-800 rounded text-amber-300 font-mono text-[10px]">Drag / IJKL</kbd> Look Up & Around</span>
        <span>·</span>
        <span><kbd className="px-1 py-0.5 bg-neutral-800 rounded text-amber-300 font-mono text-[10px]">C</kbd> Eye View</span>
        <span>·</span>
        <span><kbd className="px-1 py-0.5 bg-neutral-800 rounded text-amber-300 font-mono text-[10px]">H</kbd> Armory</span>
        <span>·</span>
        <span><kbd className="px-1 py-0.5 bg-neutral-800 rounded text-amber-300 font-mono text-[10px]">V</kbd> Weather</span>
        <span>·</span>
        <span><kbd className="px-1 py-0.5 bg-neutral-800 rounded text-amber-300 font-mono text-[10px]">E</kbd> Interact</span>
      </div>
    </div>
  );
};
