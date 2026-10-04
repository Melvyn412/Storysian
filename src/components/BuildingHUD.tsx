import React from 'react';
import { Hammer, Shield, Swords, Sparkles, X, ChevronRight, AlertTriangle } from 'lucide-react';
import { BuildableStructureType, RaidWaveState } from '../types';
import { BUILDABLE_BLUEPRINTS } from '../game/robloxFeaturesConfig';

interface BuildingHUDProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBlueprint: BuildableStructureType;
  onSelectBlueprint: (type: BuildableStructureType) => void;
  onPlaceStructure: () => void;
  wood: number;
  iron: number;
  silver: number;
  raidState: RaidWaveState;
  onStartRaidWave: () => void;
}

export const BuildingHUD: React.FC<BuildingHUDProps> = ({
  isOpen,
  onClose,
  selectedBlueprint,
  onSelectBlueprint,
  onPlaceStructure,
  wood,
  iron,
  silver,
  raidState,
  onStartRaidWave,
}) => {
  if (!isOpen) return null;

  const currentBp = BUILDABLE_BLUEPRINTS.find((b) => b.type === selectedBlueprint) || BUILDABLE_BLUEPRINTS[0];
  const canAfford =
    wood >= currentBp.woodCost && iron >= currentBp.ironCost && silver >= currentBp.silverCost;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-35 w-full max-w-2xl px-3 select-none pointer-events-auto">
      <div className="rounded-2xl bg-neutral-950/95 backdrop-blur-xl border border-amber-500/50 shadow-2xl p-4 flex flex-col gap-3 text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm text-white font-['Cinzel',serif]">
                Katfjord Fortress Construction
              </h3>
              <p className="text-[10px] text-neutral-400">
                Place defensive palisades, watchtowers, automated ballistas &amp; survive raid invasions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Resources Indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono">
              <span className="text-amber-400">🪵 {wood}</span>
              <span className="text-sky-300">⛏️ {iron}</span>
              <span className="text-emerald-400">🪙 {silver}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Blueprint Catalog Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {BUILDABLE_BLUEPRINTS.map((bp) => {
            const isSelected = bp.type === selectedBlueprint;
            const affordable =
              wood >= bp.woodCost && iron >= bp.ironCost && silver >= bp.silverCost;

            return (
              <button
                key={bp.type}
                onClick={() => onSelectBlueprint(bp.type)}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between gap-1 transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="text-[11px] font-bold text-white leading-tight truncate">
                  {bp.name}
                </div>
                <div className="text-[9px] text-neutral-400 font-mono">
                  HP: {bp.maxHealth}
                </div>
                <div
                  className={`text-[9px] font-mono font-semibold ${
                    affordable ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {bp.woodCost}W · {bp.ironCost}I · {bp.silverCost}S
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800">
          <div className="text-xs text-neutral-300">
            Selected: <span className="font-bold text-amber-300">{currentBp.name}</span>
            <span className="text-[11px] text-neutral-400 ml-1.5">({currentBp.description})</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Wave Defense Raid Trigger */}
            <button
              onClick={onStartRaidWave}
              disabled={raidState.isActive}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                raidState.isActive
                  ? 'bg-red-950/80 border-red-500/60 text-red-300 animate-pulse cursor-default'
                  : 'bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-500 hover:to-amber-600 text-white border-red-400/60 shadow-lg'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>
                {raidState.isActive
                  ? `Wave ${raidState.wave} (${raidState.enemiesRemaining} Left)`
                  : 'Trigger Raid Wave Defense'}
              </span>
            </button>

            {/* Place Structure Button */}
            <button
              onClick={onPlaceStructure}
              disabled={!canAfford}
              className={`px-4 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition ${
                canAfford
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 cursor-pointer active:scale-95'
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Build Here</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
