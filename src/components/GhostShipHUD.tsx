import React from 'react';
import { Skull, Compass, Crosshair, Award, MapPin, X, Ship } from 'lucide-react';
import { GhostShipState } from '../types';

interface GhostShipHUDProps {
  ghostShip: GhostShipState;
  playerPos: { x: number; z: number };
  onFireShipBallista?: () => void;
  onBoardGhostShip?: () => void;
  onTeleportToGhostShip?: () => void;
  onClose?: () => void;
}

export const GhostShipHUD: React.FC<GhostShipHUDProps> = ({
  ghostShip,
  playerPos,
  onFireShipBallista,
  onBoardGhostShip,
  onTeleportToGhostShip,
  onClose,
}) => {
  const dist = Math.round(Math.hypot(ghostShip.x - playerPos.x, ghostShip.z - playerPos.z));
  const hpPercent = Math.max(0, Math.min(100, Math.round((ghostShip.health / ghostShip.maxHealth) * 100)));

  return (
    <div className="fixed top-16 right-4 z-40 w-80 sm:w-96 bg-neutral-950/95 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white select-none transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Skull className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-['Cinzel',serif] text-emerald-300 tracking-wide flex items-center gap-1.5">
              <span>Cursed Ghost Drakkar</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                Naval Boss
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">Draugr Spectral Longship in Midnight Fog</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onTeleportToGhostShip && (
            <button
              onClick={onTeleportToGhostShip}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
              title="Track Ghost Ship (X: -55, Z: 160)"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
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

      {/* Hull & Captain Health */}
      <div className="mt-3 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <Ship className="w-3.5 h-3.5 text-emerald-400" />
            Spectral Hull &amp; Captain HP:
          </span>
          <span className={`font-mono tabular-nums ${ghostShip.isCaptainSunk ? 'text-emerald-400 font-bold' : 'text-emerald-300'}`}>
            {ghostShip.isCaptainSunk ? 'SUNK & VANQUISHED!' : `${ghostShip.health} / ${ghostShip.maxHealth} HP`}
          </span>
        </div>

        <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              ghostShip.isCaptainSunk
                ? 'bg-emerald-500 w-full'
                : hpPercent > 30
                ? 'bg-emerald-500'
                : 'bg-red-500 animate-pulse'
            }`}
            style={{ width: `${ghostShip.isCaptainSunk ? 100 : hpPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2">
          <span className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-400" />
            Range: <span className="text-white font-mono">{dist}m</span> away
          </span>
          <span className="text-neutral-500">Outer Fjord Waters</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-3 flex gap-2">
        {!ghostShip.isCaptainSunk ? (
          <>
            {onFireShipBallista && (
              <button
                onClick={onFireShipBallista}
                className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-950 to-neutral-900 hover:from-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Bombard Ship [R]</span>
              </button>
            )}
            {onBoardGhostShip && (
              <button
                onClick={onBoardGhostShip}
                className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-neutral-900 to-sky-950 hover:from-sky-900/60 border border-sky-500/50 text-sky-300 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Ship className="w-3.5 h-3.5" />
                <span>Board Deck</span>
              </button>
            )}
          </>
        ) : (
          <div className="w-full p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Draugr Haul Claimed (+600 Silver &amp; Spectral Relic)</span>
          </div>
        )}
      </div>
    </div>
  );
};
