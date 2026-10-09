import React from 'react';
import { Waves, AlertTriangle, Sparkles, MapPin, X, Anchor } from 'lucide-react';
import { MaelstromSalvageState } from '../types';

interface MaelstromSalvageHUDProps {
  salvageState: MaelstromSalvageState;
  onSalvageCargo?: () => void;
  onTeleportToMaelstrom?: () => void;
  onEscapeVortex?: () => void;
  onClose?: () => void;
}

export const MaelstromSalvageHUD: React.FC<MaelstromSalvageHUDProps> = ({
  salvageState,
  onSalvageCargo,
  onTeleportToMaelstrom,
  onEscapeVortex,
  onClose,
}) => {
  const isDanger = salvageState.distanceToEye < 25;

  return (
    <div className={`fixed bottom-24 left-4 z-40 w-80 sm:w-96 bg-neutral-950/95 border ${isDanger ? 'border-sky-400 animate-pulse' : 'border-sky-500/40'} rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white select-none transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-300">
            <Waves className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-['Cinzel',serif] text-sky-300 tracking-wide flex items-center gap-1.5">
              <span>Thor's Maelstrom Whirlpool</span>
              {salvageState.inSuctionZone && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/40 text-amber-300 flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                  Suction
                </span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-400">Ocean Vortex Hazard &amp; Sunken Salvage</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onTeleportToMaelstrom && (
            <button
              onClick={onTeleportToMaelstrom}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
              title="Track Maelstrom (X: -75, Z: 125)"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Vortex Suction Proximity */}
      <div className="mt-3 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className="text-neutral-300">Distance to Whirlpool Eye:</span>
          <span className={`font-mono tabular-nums ${isDanger ? 'text-amber-400 font-bold' : 'text-sky-300'}`}>
            {Math.round(salvageState.distanceToEye)}m {isDanger ? '⚠️ CRITICAL PULL!' : ''}
          </span>
        </div>

        <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isDanger ? 'bg-amber-500' : 'bg-sky-500'
            }`}
            style={{
              width: `${Math.max(0, Math.min(100, Math.round(((45 - salvageState.distanceToEye) / 45) * 100)))}%`,
            }}
          />
        </div>

        <p className="text-[10px] text-neutral-400 mt-2">
          {salvageState.inSuctionZone
            ? 'Water currents are dragging vessels inward. Sail with the wind [Shift] or sprint to escape!'
            : 'Fjord waters turbulent around the vortex. Daring captains can plunder sunken cargo.'}
        </p>
      </div>

      {/* Sunken Cargo Salvage Status */}
      <div className="mt-3 flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-neutral-300">Vortex Cargo Salvaged:</span>
        </div>
        <span className="text-amber-300 font-mono font-bold">
          {salvageState.salvagedChests} / {salvageState.totalChests} Cargo Lots
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2">
        {onSalvageCargo && salvageState.salvagedChests < salvageState.totalChests && (
          <button
            onClick={onSalvageCargo}
            className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-sky-950 to-neutral-900 hover:from-sky-900/70 border border-sky-500/50 text-sky-300 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>Salvage Cargo [E]</span>
          </button>
        )}
        {salvageState.inSuctionZone && onEscapeVortex && (
          <button
            onClick={onEscapeVortex}
            className="flex-1 py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>Break Free!</span>
          </button>
        )}
      </div>
    </div>
  );
};
