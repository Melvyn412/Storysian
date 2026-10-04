import React, { useEffect, useState } from 'react';
import { Skull, Zap, ShieldAlert } from 'lucide-react';
import { BossCombatState } from '../types';

interface BossHealthHUDProps {
  boss: BossCombatState;
}

export const BossHealthHUD: React.FC<BossHealthHUDProps> = ({ boss }) => {
  const [delayedHealth, setDelayedHealth] = useState(boss.health);

  // Smooth damage buffer trail effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedHealth(boss.health);
    }, 450);
    return () => clearTimeout(timer);
  }, [boss.health]);

  const currentPercent = Math.max(0, Math.min(100, (boss.health / boss.maxHealth) * 100));
  const delayedPercent = Math.max(0, Math.min(100, (delayedHealth / boss.maxHealth) * 100));

  return (
    <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none select-none w-[92%] max-w-[580px] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-neutral-950/90 backdrop-blur-md rounded-2xl border-2 border-red-600/80 p-3 sm:p-4 shadow-[0_0_35px_rgba(220,38,38,0.35)] relative overflow-hidden">
        {/* Background Norse Runic Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Name, Title & Phase Badge */}
        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-500/60 text-red-400 shrink-0">
              <Skull className="w-5 h-5 animate-pulse" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-neutral-100 tracking-wider uppercase font-serif drop-shadow-md truncate">
                  {boss.name}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-red-300/80 font-medium tracking-wide truncate">
                {boss.title}
              </p>
            </div>
          </div>

          {/* Phase Badge */}
          <div className="shrink-0">
            {boss.isEnraged ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-[10px] sm:text-xs tracking-wider border border-red-400 shadow-md animate-bounce">
                <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                PHASE 2: FROST ENRAGED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 font-bold text-[10px] tracking-wide">
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                PHASE 1: DUEL
              </span>
            )}
          </div>
        </div>

        {/* Boss Health Bar with Dual-Layer Damage Drain */}
        <div className="space-y-1 relative z-10">
          <div className="w-full h-4 sm:h-5 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700/80 p-0.5 relative shadow-inner">
            {/* Trailing Yellow/Orange damage buffer bar */}
            <div
              className="absolute top-0.5 bottom-0.5 left-0.5 rounded-md bg-amber-500/80 transition-all duration-700 ease-out"
              style={{ width: `calc(${delayedPercent}% - 4px)` }}
            />

            {/* Front Red/Crimson current health bar */}
            <div
              className={`relative h-full rounded-md transition-all duration-150 ease-out ${
                boss.isEnraged
                  ? 'bg-gradient-to-r from-red-700 via-rose-600 to-red-500'
                  : 'bg-gradient-to-r from-red-800 via-red-600 to-amber-600'
              }`}
              style={{ width: `${currentPercent}%` }}
            >
              {/* Shimmer line */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
            </div>
          </div>

          {/* Numerical Status */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 font-bold px-1">
            <span>
              {boss.isEnraged ? '⚠️ Beware of Heavy Shockwave Slam!' : 'Target locked'}
            </span>
            <span className="text-neutral-200">
              {Math.round(boss.health)} / {boss.maxHealth} HP (
              {Math.round(currentPercent)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
