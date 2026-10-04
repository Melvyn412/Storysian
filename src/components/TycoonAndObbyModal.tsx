import React from 'react';
import { X, Hammer, Coins, Trophy, Trees, ShieldAlert, Compass, ArrowUpRight } from 'lucide-react';
import { TycoonBuilding } from '../types';

interface TycoonAndObbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  silver: number;
  valor: number;
  wood: number;
  iron: number;
  buildings: TycoonBuilding[];
  uncollectedSilver: number;
  uncollectedValor: number;
  onCollectTycoon: () => void;
  onUpgradeBuilding: (buildingId: string) => void;
  onTeleportToObby: () => void;
  onTeleportToTycoon: () => void;
}

export const TycoonAndObbyModal: React.FC<TycoonAndObbyModalProps> = ({
  isOpen,
  onClose,
  silver,
  valor,
  wood,
  iron,
  buildings,
  uncollectedSilver,
  uncollectedValor,
  onCollectTycoon,
  onUpgradeBuilding,
  onTeleportToObby,
  onTeleportToTycoon,
}) => {
  if (!isOpen) return null;

  const totalSilverPerSec = buildings.reduce(
    (acc, b) => acc + (b.level > 0 ? b.silverPerSec * b.level : 0),
    0
  );
  const totalValorPerSec = buildings.reduce(
    (acc, b) => acc + (b.level > 0 ? b.valorPerSec * b.level : 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-amber-400 font-['Cinzel',serif] flex items-center gap-2">
              <Hammer className="w-5 h-5 text-amber-400" />
              <span>Katfjord Village Tycoon & Valhalla Sky Obby</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Construct 3D passive-income structures in the village · Ascend the floating Valhalla Sky Obby
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-neutral-200">
              <span className="flex items-center gap-1 text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {silver}
              </span>
              <span className="text-neutral-600">·</span>
              <span className="flex items-center gap-1 text-emerald-300">
                <Trees className="w-3.5 h-3.5 text-emerald-400" />
                {wood} Timber
              </span>
              <span className="text-neutral-600">·</span>
              <span className="flex items-center gap-1 text-sky-300">
                <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                {iron} Iron
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tycoon Treasury Collector Bar */}
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-emerald-500/50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-emerald-300">
                Clan Tycoon Treasury Collector
              </h3>
              <p className="text-xs text-neutral-300 mt-0.5 font-mono tabular-nums">
                Production Rate: +{totalSilverPerSec} Silver/s · +{totalValorPerSec} Valor/s
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Step onto the glowing green pad in Katfjord Village or click Collect below.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  onTeleportToTycoon();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition cursor-pointer"
              >
                Visit 3D Plot
              </button>
              <button
                onClick={onCollectTycoon}
                disabled={uncollectedSilver <= 0 && uncollectedValor <= 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer font-mono tabular-nums ${
                  uncollectedSilver > 0 || uncollectedValor > 0
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-lg'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                Collect +{Math.floor(uncollectedSilver)} Silver & +{Math.floor(uncollectedValor)} Valor
              </button>
            </div>
          </div>

          {/* 4 Tycoon Buildings */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-200 mb-3">
              01. Village Tycoon Buildings (Spawns & Upgrades in 3D World)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buildings.map((b) => {
                const nextLevel = b.level + 1;
                const isMax = b.level >= b.maxLevel;
                const costSilver = Math.round(b.baseCostSilver * Math.pow(1.4, b.level));
                const costWood = b.baseCostWood + b.level * 2;
                const costIron = b.baseCostIron + (b.level > 0 ? b.level : 0);
                const canAfford =
                  !isMax && silver >= costSilver && wood >= costWood && iron >= costIron;

                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-white">{b.name}</h4>
                        <span className="text-xs font-mono text-amber-400">
                          Lv.{b.level} / {b.maxLevel}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{b.description}</p>
                      <p className="text-xs font-mono text-emerald-300 mt-2">
                        Output: +{b.silverPerSec * Math.max(1, b.level)} Silver/s · +
                        {b.valorPerSec * Math.max(1, b.level)} Valor/s
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                      {isMax ? (
                        <span className="text-xs font-semibold text-amber-400">
                          Max Tier Reached
                        </span>
                      ) : (
                        <>
                          <span className="text-xs font-mono tabular-nums text-neutral-300">
                            {costSilver} Silver · {costWood} Wood
                            {costIron > 0 ? ` · ${costIron} Iron` : ''}
                          </span>
                          <button
                            onClick={() => onUpgradeBuilding(b.id)}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            }`}
                          >
                            {b.level === 0 ? 'Construct' : `Upgrade Lv.${nextLevel}`}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Valhalla Sky Obby Parkour Challenge */}
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-amber-500/40 flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-xl">
              <h3 className="text-base font-semibold text-amber-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>02. Valhalla Sky Obby — Floating Cloud Parkour Trial</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Test your agility across 10 ascending runic platforms suspended high above Katfjord. Reach the Golden Summit Sanctuary at 27m elevation and press [E] at the chest for +800 Silver, +600 Valor, and the Sky Walker Badge!
              </p>
            </div>
            <button
              onClick={() => {
                onTeleportToObby();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg"
            >
              <span>Teleport to Sky Obby Start</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
