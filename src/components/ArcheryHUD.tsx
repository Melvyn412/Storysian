import React from 'react';
import { Target, Flame, Snowflake, Crosshair, Award } from 'lucide-react';
import { ArrowType, TargetScoreRecord } from '../types';
import { ARROW_TYPES } from '../game/robloxFeaturesConfig';

interface ArcheryHUDProps {
  isVisible: boolean;
  selectedArrow: ArrowType;
  onSelectArrow: (type: ArrowType) => void;
  quiverStock: Record<ArrowType, number>;
  totalScore: number;
  recentScore: TargetScoreRecord | null;
  onShootArrow: () => void;
}

export const ArcheryHUD: React.FC<ArcheryHUDProps> = ({
  isVisible,
  selectedArrow,
  onSelectArrow,
  quiverStock,
  totalScore,
  recentScore,
  onShootArrow,
}) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Center Aiming Reticle */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-30 select-none">
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400/80 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" />
          <div className="absolute top-[-10px] w-0.5 h-2.5 bg-amber-400/90" />
          <div className="absolute bottom-[-10px] w-0.5 h-2.5 bg-amber-400/90" />
          <div className="absolute left-[-10px] h-0.5 w-2.5 bg-amber-400/90" />
          <div className="absolute right-[-10px] h-0.5 w-2.5 bg-amber-400/90" />
        </div>
      </div>

      {/* Archery Quiver & Score Panel (Top Left / Floating) */}
      <div className="absolute top-16 left-3 z-30 flex flex-col gap-2 select-none pointer-events-auto">
        <div className="px-3.5 py-2.5 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-amber-500/50 shadow-2xl flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-neutral-800 pb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Target className="w-4 h-4" />
              <span>Norse Archery Range</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 font-bold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{totalScore} Pts</span>
            </div>
          </div>

          {/* Arrow Quiver Selector */}
          <div className="flex items-center gap-1.5">
            {ARROW_TYPES.map((a) => {
              const isSelected = selectedArrow === a.id;
              const count = quiverStock[a.id] || 0;

              return (
                <button
                  key={a.id}
                  onClick={() => onSelectArrow(a.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md ring-1 ring-amber-300'
                      : 'bg-neutral-900/90 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                  }`}
                  title={`${a.name}: ${a.description} (${count} left)`}
                >
                  {a.id === 'flame' && <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                  {a.id === 'frost' && <Snowflake className="w-3.5 h-3.5 text-cyan-300 shrink-0" />}
                  {a.id === 'bodkin' && <Crosshair className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span className="capitalize">{a.id}</span>
                  <span className="font-mono text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Quick Loose Arrow Button */}
          <button
            onClick={onShootArrow}
            className="w-full py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider shadow active:scale-95 transition cursor-pointer"
          >
            Loose Arrow (Click / Tap)
          </button>

          {/* Recent Bullseye Toast */}
          {recentScore && (
            <div className="text-[11px] font-bold text-center text-amber-300 animate-pulse">
              {recentScore.isBullseye ? '🎯 BULLSEYE! +100 PTS' : `Hit Target: +${recentScore.points} Pts`}
              <span className="text-neutral-400 font-normal"> ({recentScore.distance}m)</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
