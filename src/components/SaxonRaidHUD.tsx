import React from 'react';
import { Shield, Sparkles, Crosshair, Award, MapPin, X, Swords } from 'lucide-react';
import { SaxonFortRaidState } from '../types';

interface SaxonRaidHUDProps {
  raidState: SaxonFortRaidState;
  onAttackGate?: () => void;
  onLootRelic?: (relicId: string) => void;
  onTeleportToFort?: () => void;
  onClose?: () => void;
}

export const SaxonRaidHUD: React.FC<SaxonRaidHUDProps> = ({
  raidState,
  onAttackGate,
  onLootRelic,
  onTeleportToFort,
  onClose,
}) => {
  const gatePercent = Math.max(0, Math.min(100, Math.round((raidState.gateHealth / raidState.maxGateHealth) * 100)));

  const relics = [
    { id: 'saxon_relic_cross', name: "St. Cuthbert's Golden Cross", silver: 300, valor: 150, color: 'text-amber-400' },
    { id: 'saxon_relic_chalice', name: 'Saxon Monastic Chalice', silver: 250, valor: 100, color: 'text-slate-300' },
    { id: 'saxon_relic_gospels', name: 'Lindisfarne Holy Gospels', silver: 350, valor: 200, color: 'text-purple-400' },
  ];

  return (
    <div className="fixed top-16 left-4 z-40 w-80 sm:w-96 bg-neutral-950/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white select-none transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-['Cinzel',serif] text-amber-300 tracking-wide">
              Saxon Coastal Fortress Raid
            </h3>
            <p className="text-[11px] text-neutral-400">Breach Gate &amp; Plunder 3 Holy Relics</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onTeleportToFort && (
            <button
              onClick={onTeleportToFort}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
              title="Warp to Saxon Fortress (X: 40, Z: 230)"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
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

      {/* Fortress Gate Integrity */}
      <div className="mt-3 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            Fortress Timber Gate:
          </span>
          <span className={`font-mono tabular-nums ${raidState.gateBreached ? 'text-emerald-400 font-bold' : 'text-orange-400'}`}>
            {raidState.gateBreached ? 'BREACHED! [OPEN]' : `${raidState.gateHealth} / ${raidState.maxGateHealth} HP (${gatePercent}%)`}
          </span>
        </div>

        <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              raidState.gateBreached
                ? 'bg-emerald-500 w-full'
                : gatePercent > 40
                ? 'bg-orange-500'
                : 'bg-red-500 animate-pulse'
            }`}
            style={{ width: `${raidState.gateBreached ? 100 : gatePercent}%` }}
          />
        </div>

        {!raidState.gateBreached && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80">
            <span className="text-[10px] text-neutral-400">Attack with Axe [1] or Ship Ballistas [R]</span>
            {onAttackGate && (
              <button
                onClick={onAttackGate}
                className="px-2 py-0.5 rounded bg-orange-600/80 hover:bg-orange-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
              >
                <Crosshair className="w-3 h-3" />
                <span>Chop Gate (-50 HP)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3 Saxon Monastery Relic Chests */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
          <span>Saxon Monastic Relics Plundered:</span>
          <span className="text-amber-400 font-mono tabular-nums">
            {raidState.chestsLooted} / {raidState.maxChests}
          </span>
        </div>

        {relics.map((r) => {
          const isLooted = raidState.relicsFound.includes(r.id);
          return (
            <div
              key={r.id}
              className={`p-2 rounded-lg border text-xs flex items-center justify-between transition ${
                isLooted
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={`w-3.5 h-3.5 ${isLooted ? r.color : 'text-neutral-500'}`} />
                <div>
                  <div className={`font-semibold ${isLooted ? 'text-white' : 'text-neutral-300'}`}>
                    {r.name}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    +{r.silver} Silver · +{r.valor} Valor
                  </div>
                </div>
              </div>

              {isLooted ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Plundered
                </span>
              ) : (
                onLootRelic && (
                  <button
                    onClick={() => onLootRelic(r.id)}
                    disabled={!raidState.gateBreached}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      raidState.gateBreached
                        ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {raidState.gateBreached ? 'Loot Relic' : 'Gate Locked'}
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
