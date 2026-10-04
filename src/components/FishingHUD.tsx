import React from 'react';
import { Fish, Waves, AlertTriangle, Sparkles, Anchor, Flame, Coins, RotateCcw } from 'lucide-react';
import { FishingState } from '../types';

interface FishingHUDProps {
  isVisible: boolean;
  fishingState: FishingState;
  isNearWater: boolean;
  onCast: () => void;
  onHookBite: () => void;
  onReelPull: () => void;
  onReleaseTension: () => void;
  onOpenModal: () => void;
  onTeleportPier: () => void;
}

export const FishingHUD: React.FC<FishingHUDProps> = ({
  isVisible,
  fishingState,
  isNearWater,
  onCast,
  onHookBite,
  onReelPull,
  onReleaseTension,
  onOpenModal,
  onTeleportPier,
}) => {
  if (!isVisible) return null;

  const { status, tension, reelProgress, targetFish, targetFishWeight } = fishingState;
  const isSweetSpot = tension >= 35 && tension <= 75;
  const isHighTension = tension > 80;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-30 flex flex-col items-end gap-2 select-none pointer-events-auto">
      {/* Floating HUD Container */}
      <div className="w-72 sm:w-80 p-3.5 rounded-2xl bg-neutral-950/92 backdrop-blur-md border border-sky-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-neutral-100 flex flex-col gap-2.5">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center">
              <Fish className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold font-['Cinzel',serif] text-white">Fjord Fishing</span>
              <span className="block text-[10px] text-sky-300">
                {status === 'idle' && (isNearWater ? 'Ready to cast' : 'Away from water')}
                {status === 'casting' && 'Casting line...'}
                {status === 'waiting' && 'Float in water...'}
                {status === 'bite' && '⚡ Strike now!'}
                {status === 'reeling' && 'Tug of war!'}
                {status === 'caught' && 'Catch landed!'}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenModal}
            className="px-2 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-[10px] font-bold text-sky-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
            title="Open Fish Creel & Bestiary [K]"
          >
            <span>Creel [K]</span>
          </button>
        </div>

        {/* State Content */}
        {status === 'idle' && (
          <div className="space-y-2">
            {isNearWater ? (
              <div className="flex gap-2">
                <button
                  onClick={onCast}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Waves className="w-4 h-4" />
                  <span>Cast Line [E / Strike]</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2 text-center">
                <p className="text-[11px] text-neutral-400">
                  Walk closer to the Katfjord waters, or warp directly to the prime fishing pier:
                </p>
                <button
                  onClick={onTeleportPier}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Anchor className="w-3.5 h-3.5" />
                  <span>Warp to Katfjord Pier</span>
                </button>
              </div>
            )}
          </div>
        )}

        {status === 'casting' && (
          <div className="py-3 text-center space-y-1">
            <div className="text-xs font-bold text-sky-300 animate-pulse">Casting Line Outward...</div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-sky-400 animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {status === 'waiting' && (
          <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Watching Float...
              </span>
              <span className="text-[11px] text-sky-300 font-mono">Bite Incoming</span>
            </div>
            <p className="text-[10px] text-neutral-400 italic">
              Watch for the float to dive and the horn to sound, then strike immediately!
            </p>
          </div>
        )}

        {status === 'bite' && (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-950/80 via-amber-950/80 to-red-950/80 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce space-y-2">
            <div className="text-center">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest">
                ⚡ FISH BITE DETECTED!
              </span>
            </div>
            <button
              onClick={onHookBite}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-red-500 text-slate-950 font-black text-sm uppercase tracking-widest shadow-xl active:scale-90 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-slate-950 animate-spin" />
              <span>STRIKE! [SPACE]</span>
            </button>
          </div>
        )}

        {status === 'reeling' && (
          <div className="p-3 rounded-xl bg-sky-950/50 border border-sky-500/40 space-y-2.5">
            {/* Reel Progress */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span className="text-neutral-300">Reel Progress</span>
                <span className="text-sky-300 font-mono font-bold">{Math.round(reelProgress)}%</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-700">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-75"
                  style={{ width: `${reelProgress}%` }}
                />
              </div>
            </div>

            {/* Tension Meter with color bands */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span className="text-neutral-300 flex items-center gap-1">
                  Line Tension
                  {isHighTension && <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />}
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    isHighTension ? 'text-red-400 animate-pulse' : isSweetSpot ? 'text-emerald-400' : 'text-amber-300'
                  }`}
                >
                  {Math.round(tension)}% {isHighTension ? '(SNAP RISK!)' : isSweetSpot ? '(SWEET SPOT)' : ''}
                </span>
              </div>
              <div className="relative w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-neutral-700">
                {/* Sweet Spot Overlay */}
                <div className="absolute left-[35%] w-[40%] h-full bg-emerald-500/25 pointer-events-none" />
                <div
                  className={`h-full transition-all duration-75 ${
                    isHighTension ? 'bg-red-500 shadow-[0_0_10px_red]' : isSweetSpot ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${tension}%` }}
                />
              </div>
            </div>

            {/* Reel & Tension Controls */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onReelPull}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow transition cursor-pointer"
              >
                Reel In!
              </button>
              <button
                onClick={onReleaseTension}
                className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold transition cursor-pointer"
                title="Release slack so line doesn't snap"
              >
                Slack
              </button>
            </div>
          </div>
        )}

        {status === 'caught' && targetFish && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950/80 to-neutral-900 border border-emerald-500/60 text-center space-y-2">
            <span className="text-2xl">{targetFish.icon}</span>
            <div className="font-bold text-xs text-white">{targetFish.name}</div>
            <div className="text-[10px] text-emerald-300">
              {targetFishWeight} kg · +{targetFish.silverValue} Silver
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={onCast}
                className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold shadow transition cursor-pointer"
              >
                Cast Again
              </button>
              <button
                onClick={onOpenModal}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold border border-neutral-700 transition cursor-pointer"
              >
                Creel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
