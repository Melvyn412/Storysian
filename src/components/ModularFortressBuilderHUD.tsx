import React, { useState } from 'react';
import {
  Shield,
  Hammer,
  Plus,
  Trash2,
  Wrench,
  X,
  Target,
  Flame,
  TowerControl,
} from 'lucide-react';
import { ModularFortressPiece } from '../types';
import { sound } from '../audio/soundEngine';

interface ModularFortressBuilderHUDProps {
  isOpen: boolean;
  onClose: () => void;
  wood: number;
  iron: number;
  fortressPieces: ModularFortressPiece[];
  onPlacePiece: (type: ModularFortressPiece['type']) => void;
  onRepairPiece: (pieceId: string) => void;
  onDismantlePiece: (pieceId: string) => void;
}

interface PieceTemplate {
  type: ModularFortressPiece['type'];
  name: string;
  woodCost: number;
  ironCost: number;
  maxHp: number;
  description: string;
  icon: any;
}

const PIECE_TEMPLATES: PieceTemplate[] = [
  {
    type: 'palisade_heavy',
    name: 'Heavy Spiked Palisade',
    woodCost: 40,
    ironCost: 0,
    maxHp: 500,
    description: 'Carved timber barrier with sharpened stakes. Absorbs enemy attacks.',
    icon: Shield,
  },
  {
    type: 'stone_tower',
    name: 'Reinforced Stone Tower',
    woodCost: 80,
    ironCost: 40,
    maxHp: 1200,
    description: 'Elevated vantage outpost with automatic clan archers stationed atop.',
    icon: TowerControl,
  },
  {
    type: 'portcullis_iron',
    name: 'Iron Portcullis Gate',
    woodCost: 60,
    ironCost: 80,
    maxHp: 1500,
    description: 'Heavy reinforced gate that can be raised and lowered to protect Katfjord.',
    icon: Shield,
  },
  {
    type: 'defense_catapult',
    name: 'Fortress Defense Catapult',
    woodCost: 120,
    ironCost: 60,
    maxHp: 800,
    description: 'Hurls burning pitch boulders at enemy raiders and coastal warships.',
    icon: Target,
  },
  {
    type: 'cauldron_pitch',
    name: 'Boiling Pitch Cauldron',
    woodCost: 20,
    ironCost: 50,
    maxHp: 600,
    description: 'Dumps scalding tar on invaders attempting to breach the perimeter.',
    icon: Flame,
  },
  {
    type: 'spiked_trench',
    name: 'Spiked Trench Barricade',
    woodCost: 30,
    ironCost: 10,
    maxHp: 350,
    description: 'Concealed spike pits that severely slow and impale advancing raiders.',
    icon: Shield,
  },
];

export const ModularFortressBuilderHUD: React.FC<ModularFortressBuilderHUDProps> = ({
  isOpen,
  onClose,
  wood,
  iron,
  fortressPieces,
  onPlacePiece,
  onRepairPiece,
  onDismantlePiece,
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'defenses'>('build');

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-3 select-none font-sans pointer-events-auto animate-fade-in">
      <div className="bg-neutral-950/95 backdrop-blur-md border-2 border-emerald-500/70 rounded-2xl shadow-2xl p-4 text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Hammer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-['Cinzel',serif] text-emerald-300 flex items-center gap-2">
                Modular Clan Fortress Builder
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {fortressPieces.length} Defenses Erected
                </span>
              </div>
              <div className="text-[10px] text-neutral-400">
                Snap-place defenses around Katfjord to repel Saxon raids &amp; Blood Moon invasions
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
              <span className="text-amber-400">🌲 {wood} Wood</span>
              <span className="text-neutral-500">·</span>
              <span className="text-sky-300">⛏️ {iron} Iron</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setActiveTab('build')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'build'
                ? 'bg-emerald-500 text-neutral-950'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Construct Blueprints
          </button>
          <button
            onClick={() => setActiveTab('defenses')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'defenses'
                ? 'bg-emerald-500 text-neutral-950'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Fortress Health &amp; Repairs ({fortressPieces.length})
          </button>
        </div>

        {/* TAB 1: CONSTRUCT BLUEPRINTS */}
        {activeTab === 'build' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto">
            {PIECE_TEMPLATES.map((tmpl) => {
              const canAfford = wood >= tmpl.woodCost && iron >= tmpl.ironCost;
              const Icon = tmpl.icon;
              return (
                <div
                  key={tmpl.type}
                  className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate">{tmpl.name}</span>
                      <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[10px] text-neutral-400 line-clamp-2 mb-2 leading-tight">
                      {tmpl.description}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-neutral-800">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={wood >= tmpl.woodCost ? 'text-amber-400' : 'text-red-400'}>
                        {tmpl.woodCost} Wood
                      </span>
                      {tmpl.ironCost > 0 && (
                        <span className={iron >= tmpl.ironCost ? 'text-sky-300' : 'text-red-400'}>
                          {tmpl.ironCost} Iron
                        </span>
                      )}
                      <span className="text-neutral-500">{tmpl.maxHp} HP</span>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        sound.playHammerBuild();
                        onPlacePiece(tmpl.type);
                      }}
                      className={`w-full py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                        canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Place Piece
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: DEFENSES HEALTH & REPAIRS */}
        {activeTab === 'defenses' && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {fortressPieces.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                No active modular fortress pieces erected. Select Blueprints to place palisades and towers!
              </div>
            ) : (
              fortressPieces.map((piece) => {
                const hpPercent = Math.max(0, (piece.health / piece.maxHealth) * 100);
                const isDamaged = piece.health < piece.maxHealth;
                return (
                  <div
                    key={piece.id}
                    className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white truncate">{piece.name}</span>
                        <span className="font-mono text-[10px] text-neutral-400">
                          {piece.health} / {piece.maxHealth} HP
                        </span>
                      </div>
                      <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            hpPercent > 50
                              ? 'bg-emerald-500'
                              : hpPercent > 20
                              ? 'bg-amber-500'
                              : 'bg-red-500 animate-pulse'
                          }`}
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDamaged && (
                        <button
                          onClick={() => {
                            sound.playHammerBuild();
                            onRepairPiece(piece.id);
                          }}
                          className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Wrench className="w-3 h-3" />
                          Repair (-15 Wood)
                        </button>
                      )}
                      <button
                        onClick={() => onDismantlePiece(piece.id)}
                        className="p-1 rounded-md bg-neutral-800 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                        title="Dismantle Piece"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
