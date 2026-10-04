import React from 'react';
import { Flag, ShieldAlert, Swords, Trophy, Clock } from 'lucide-react';
import { ClanConquestTower } from '../types';

interface ClanConquestHUDProps {
  isVisible: boolean;
  towers: ClanConquestTower[];
  playerClan: string;
  onTeleportTower?: (tower: ClanConquestTower) => void;
}

export const ClanConquestHUD: React.FC<ClanConquestHUDProps> = ({
  isVisible,
  towers,
  playerClan,
  onTeleportTower,
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-3 select-none pointer-events-auto">
      <div className="rounded-xl bg-neutral-950/90 backdrop-blur-md border border-amber-500/50 shadow-2xl p-2.5 flex flex-col gap-2">
        {/* Banner Header */}
        <div className="flex items-center justify-between text-xs font-bold border-b border-neutral-800 pb-1 px-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-['Cinzel',serif]">
            <Flag className="w-4 h-4 text-amber-400" />
            <span>Valhalla Clan Conquest (GvG Battlefields)</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Clan Dividends Active</span>
          </div>
        </div>

        {/* 3 Tower Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {towers.map((t) => {
            const isHeldByUs = t.controllingClan === playerClan;
            const isContested = t.isContested;

            return (
              <div
                key={t.id}
                onClick={() => onTeleportTower && onTeleportTower(t)}
                className={`p-2 rounded-lg border text-left flex flex-col justify-between gap-1 transition cursor-pointer ${
                  isHeldByUs
                    ? 'bg-amber-950/40 border-amber-500/60'
                    : t.controllingClan
                    ? 'bg-red-950/30 border-red-500/50'
                    : 'bg-neutral-900/70 border-neutral-800'
                }`}
                title="Click to warp near tower"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white truncate">{t.name}</span>
                  {isContested && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  )}
                </div>

                <div className="text-[10px]">
                  {t.controllingClan ? (
                    <span className={isHeldByUs ? 'text-amber-300 font-bold' : 'text-red-300'}>
                      🚩 {t.controllingClan}
                    </span>
                  ) : (
                    <span className="text-neutral-400 italic">Unclaimed</span>
                  )}
                </div>

                {/* Capture progress bar */}
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className={`h-full transition-all duration-150 ${
                      isHeldByUs ? 'bg-amber-400' : t.controllingClan ? 'bg-red-500' : 'bg-neutral-500'
                    }`}
                    style={{ width: `${t.capturePercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
