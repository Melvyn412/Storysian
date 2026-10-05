import React, { useState } from 'react';
import {
  Anchor,
  Navigation,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  Waves,
  Crosshair,
  RefreshCw,
  Ship,
} from 'lucide-react';
import { SeaSerpentState } from '../types';

interface ShipControlHUDProps {
  speed: number;
  rotation: number;
  onDismount: () => void;
  onAccelerate: (amount: number) => void;
  onSteer: (amount: number) => void;
  isStormy?: boolean;
  seaSerpent?: SeaSerpentState | null;
  onFireBallista?: (side: 'port' | 'starboard') => void;
  onRespawnSeaSerpent?: () => void;
  onOpenArmory?: () => void;
}

export const ShipControlHUD: React.FC<ShipControlHUDProps> = ({
  speed,
  onDismount,
  onAccelerate,
  onSteer,
  isStormy = false,
  seaSerpent,
  onFireBallista,
  onRespawnSeaSerpent,
  onOpenArmory,
}) => {
  const [crewRole, setCrewRole] = useState<'captain' | 'gunner'>('captain');

  return (
    <div className="absolute top-14 sm:top-16 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center select-none font-sans pointer-events-auto max-w-[95vw]">
      {/* Main Naval Deck Bar */}
      <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-neutral-950/90 backdrop-blur-md rounded-2xl border-2 border-amber-500 shadow-2xl flex flex-wrap items-center gap-2.5 sm:gap-4 text-white w-full justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-amber-500/20 rounded-xl border border-amber-400/40 text-amber-400">
            <Navigation className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xs sm:text-base text-amber-300 font-['Cinzel',serif] tracking-wider">
                MULTI-CREW DRAKKAR WARSHIP
              </h3>
            </div>
            <p className="hidden sm:block text-xs text-neutral-300 mt-0.5">
              Steer with <span className="font-bold text-amber-400">W/A/S/D</span> · Fire Frost-Ballistas with{' '}
              <span className="font-bold text-sky-400">[R]</span>
            </p>
          </div>
        </div>

        {/* Role Selector (Helm Captain vs Ballista Gunner) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
          <button
            onClick={() => setCrewRole('captain')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              crewRole === 'captain'
                ? 'bg-amber-500 text-neutral-950'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Helm Captain
          </button>
          <button
            onClick={() => setCrewRole('gunner')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              crewRole === 'gunner'
                ? 'bg-sky-500 text-neutral-950'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Ballista Gunner
          </button>
        </div>

        {/* Drakkar Armory Customization Button */}
        {onOpenArmory && (
          <button
            onClick={onOpenArmory}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-lg transition cursor-pointer shadow-sm"
            title="Open Armory to customize Drakkar sail patterns, hull shields, and bow figurehead"
          >
            <Ship className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ship Armory</span>
            <span className="sm:hidden">Armory</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          {/* Speedometer */}
          <div className="flex flex-col items-center px-2 sm:px-3 py-0.5 sm:py-1 bg-neutral-900 rounded-lg border border-neutral-700">
            <span className="text-[9px] uppercase text-neutral-400 font-bold">Knots</span>
            <span className="text-xs sm:text-sm font-mono font-black text-cyan-400">
              {Math.max(0, Math.round(speed * 1.5))}
            </span>
          </div>

          {/* Broadside Frost-Ballista Fire Button */}
          {onFireBallista && (
            <button
              onClick={() => onFireBallista('starboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-neutral-950 text-xs font-extrabold rounded-lg shadow-md transition cursor-pointer"
              title="Fire Broadside Frost-Ballista at Jörmungandr Sea Serpent [R]"
            >
              <Crosshair className="w-4 h-4" />
              <span>Fire Ballista [R]</span>
            </button>
          )}

          {/* Dismount button */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              onDismount();
            }}
            onClick={onDismount}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md transition cursor-pointer"
          >
            <Anchor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Anchor</span>
          </button>
        </div>
      </div>

      {/* Live Jörmungandr Sea Serpent Boss Bar */}
      {seaSerpent && (
        <div className="mt-1.5 w-full px-4 py-1.5 bg-neutral-950/90 border border-sky-500/60 rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-bold text-white">{seaSerpent.name}:</span>
            {seaSerpent.isAlive ? (
              <span className="font-mono text-sky-300 font-bold">
                {seaSerpent.health} / {seaSerpent.maxHealth} HP
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">SLAIN (+350 Silver)</span>
            )}
          </div>

          {seaSerpent.isAlive ? (
            <div className="flex-1 max-w-44 h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-300"
                style={{
                  width: `${Math.max(0, Math.min(100, (seaSerpent.health / seaSerpent.maxHealth) * 100))}%`,
                }}
              />
            </div>
          ) : (
            onRespawnSeaSerpent && (
              <button
                onClick={onRespawnSeaSerpent}
                className="px-2.5 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Summon Sea Serpent</span>
              </button>
            )
          )}
        </div>
      )}

      {/* Rough Seas Warning in Tempest */}
      {isStormy && (
        <div className="mt-1.5 px-3 py-1 bg-yellow-950/95 border border-yellow-500/80 rounded-full shadow-lg flex items-center gap-2 text-[10px] sm:text-xs font-extrabold text-yellow-300 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse shrink-0" />
          <span className="tracking-wide">THOR'S TEMPEST: ROUGH SEAS · SWELLS ~3.8M · HOLD FAST!</span>
          <Waves className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        </div>
      )}

      {/* On-screen touch boat pedals (Row forward, Reverse, Port, Starboard, Ballista) */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onSteer(0.12);
          }}
          onMouseDown={() => onSteer(0.12)}
          className="px-2.5 sm:px-3 py-1.5 bg-neutral-900/90 active:bg-amber-600 text-amber-300 active:text-white border border-neutral-700 rounded-lg text-xs font-bold shadow flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Port</span>
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onAccelerate(10);
          }}
          onMouseDown={() => onAccelerate(10)}
          className="px-3 sm:px-4 py-1.5 bg-amber-600 active:bg-amber-500 text-white rounded-lg text-xs font-extrabold shadow flex items-center gap-1 cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Row Forward</span>
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onAccelerate(-8);
          }}
          onMouseDown={() => onAccelerate(-8)}
          className="px-2.5 sm:px-3 py-1.5 bg-neutral-900/90 active:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded-lg text-xs font-bold shadow flex items-center gap-1 cursor-pointer"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onSteer(-0.12);
          }}
          onMouseDown={() => onSteer(-0.12)}
          className="px-2.5 sm:px-3 py-1.5 bg-neutral-900/90 active:bg-amber-600 text-amber-300 active:text-white border border-neutral-700 rounded-lg text-xs font-bold shadow flex items-center gap-1 cursor-pointer"
        >
          <span>Starboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
