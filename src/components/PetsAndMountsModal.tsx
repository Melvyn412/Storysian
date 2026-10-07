import React, { useState } from 'react';
import { X, Sparkles, Coins, Trophy, Zap, PoundSterling, Shield, ArrowUpCircle } from 'lucide-react';
import { VikingPet, VikingMount, PetId, MountId, PetEvolutionData, MountArmorPiece } from '../types';
import { INITIAL_PET_EVOLUTIONS, MOUNT_ARMOR_CATALOG } from '../game/robloxFeaturesConfig';

interface PetsAndMountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  silver: number;
  valor: number;
  gbpBalance?: number;
  pets: VikingPet[];
  activePetId: PetId | null;
  onSelectPet: (petId: PetId | null) => void;
  onHatchPetEgg: (paidWithGBP?: boolean) => PetId | null;
  mounts: VikingMount[];
  activeMountId: MountId | null;
  onToggleMount: (mountId: MountId) => void;
  onBuyMount: (mountId: MountId, paidWithGBP?: boolean) => void;
  petEvolutions?: Record<PetId, PetEvolutionData>;
  onFeedPet?: (petId: PetId) => void;
  mountArmor?: MountArmorPiece[];
  onToggleMountArmor?: (armorId: string) => void;
}

export const PetsAndMountsModal: React.FC<PetsAndMountsModalProps> = ({
  isOpen,
  onClose,
  silver,
  valor,
  gbpBalance = 25.0,
  pets,
  activePetId,
  onSelectPet,
  onHatchPetEgg,
  mounts,
  activeMountId,
  onToggleMount,
  onBuyMount,
  petEvolutions = INITIAL_PET_EVOLUTIONS,
  onFeedPet,
  mountArmor = MOUNT_ARMOR_CATALOG,
  onToggleMountArmor,
}) => {
  const [activeTab, setActiveTab] = useState<'pets' | 'evolution' | 'mounts' | 'mount_armor'>('pets');
  const [hatchedMessage, setHatchedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleHatch = (paidWithGBP = false) => {
    const hatchedId = onHatchPetEgg(paidWithGBP);
    if (hatchedId) {
      const pet = pets.find((p) => p.id === hatchedId);
      if (pet) {
        setHatchedMessage(
          `Runic Egg Hatched: ${pet.name} (${pet.species})${
            paidWithGBP ? ' — £1.29 GBP' : ''
          }!`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-amber-400 font-['Cinzel',serif]">
              Norse Beasts: Companions, Pet Evolution &amp; Armored Mounts
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Feed and evolve 3D pets · Equip Spiked War Barding on Battle Bears &amp; Sleipnir [Key G]
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-neutral-200">
              <span className="flex items-center gap-1 text-amber-300">
                <Coins className="w-4 h-4 text-amber-400" />
                {silver.toLocaleString()} Silver
              </span>
              <span className="text-neutral-600">·</span>
              <span className="flex items-center gap-1 text-sky-300">
                <Trophy className="w-4 h-4 text-sky-400" />
                {valor.toLocaleString()} Valor
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

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900/60 border-b border-neutral-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'pets'
                ? 'bg-sky-500 text-neutral-950 shadow'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            3D Companion Pets ({pets.length})
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'evolution'
                ? 'bg-emerald-500 text-neutral-950 shadow'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            Pet Evolution &amp; Feasts
          </button>
          <button
            onClick={() => setActiveTab('mounts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'mounts'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            Rideable Mounts ({mounts.length})
          </button>
          <button
            onClick={() => setActiveTab('mount_armor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'mount_armor'
                ? 'bg-purple-500 text-white shadow'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Mount Armored Barding
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'pets' && (
            <>
              {/* Runestone Egg Hatcher */}
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-sky-500/40 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-sky-300">
                    Mystic Runestone Egg Hatcher (£1.29 GBP or 180 Silver)
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Chance for Legendary Arctic Alpha Wolves, Twin Storm Ravens &amp; Mythic Fjord Drakes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleHatch(true)}
                    className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <span>Hatch £1.29 GBP</span>
                  </button>
                  <button
                    onClick={() => handleHatch(false)}
                    disabled={silver < 180}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      silver >= 180
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Hatch 180 Silver</span>
                  </button>
                </div>
              </div>

              {hatchedMessage && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-lg text-emerald-300 text-xs font-bold flex items-center justify-between">
                  <span>✨ {hatchedMessage}</span>
                  <button onClick={() => setHatchedMessage(null)} className="text-neutral-400 hover:text-white">
                    ✕
                  </button>
                </div>
              )}

              {/* Pets List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pets.map((p) => {
                  const isActive = activePetId === p.id;
                  const evo = petEvolutions[p.id];

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        isActive
                          ? 'bg-sky-950/30 border-sky-400 ring-1 ring-sky-400'
                          : 'bg-neutral-900/70 border-neutral-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                          <span className="text-xs uppercase font-mono font-bold text-sky-400">{p.rarity}</span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">{p.species}</p>
                        <p className="text-xs text-emerald-300 mt-2">{p.buffDescription}</p>
                        {evo && (
                          <div className="mt-2 text-[10px] text-amber-300 font-mono">
                            Stage {evo.stage}: {evo.stage === 2 ? '⭐ EVOLVED FORM' : `XP: ${evo.currentXp}/${evo.maxXp}`}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Owned: {p.count}</span>
                        <button
                          onClick={() => onSelectPet(isActive ? null : p.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isActive
                              ? 'bg-sky-500 text-neutral-950'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                          }`}
                        >
                          {isActive ? 'Active Companion' : 'Equip Pet'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'evolution' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                <h3 className="text-sm font-bold text-emerald-300">Pet Evolution &amp; Growth Feasts</h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Feed your pets berries, fish and honeycomb to level them up into their awakened Titan forms (+2x to +3x stat multipliers).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pets.map((p) => {
                  const evo = petEvolutions[p.id];
                  if (!evo) return null;
                  const isMax = evo.stage === 2;

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">{p.name}</div>
                          <div className="text-xs text-emerald-400">
                            Awakens into: <span className="font-semibold text-white">{evo.evolvedName}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          {isMax ? 'MAX EVOLVED' : `Stage ${evo.stage}`}
                        </span>
                      </div>

                      {/* XP Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-mono text-neutral-400 mb-1">
                          <span>Growth XP</span>
                          <span>{evo.currentXp} / {evo.maxXp} XP</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                          <div
                            className="h-full bg-emerald-400 transition-all duration-300"
                            style={{ width: `${Math.min(100, (evo.currentXp / evo.maxXp) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-sky-300">Bonus: {evo.bonusMultiplier}x stats</span>
                        <button
                          onClick={() => onFeedPet && onFeedPet(p.id)}
                          disabled={isMax}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                            isMax
                              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Feed Fjord Treat (+25 XP)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'mounts' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mounts.map((m) => {
                const isMounted = activeMountId === m.id;
                const canAfford = silver >= m.priceSilver;

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                      isMounted
                        ? 'bg-amber-950/30 border-amber-400 ring-1 ring-amber-400'
                        : 'bg-neutral-900/70 border-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">{m.name}</h4>
                        <div className="flex items-center gap-1.5">
                          {m.priceGBP && m.priceGBP > 0 ? (
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              £{m.priceGBP.toFixed(2)}
                            </span>
                          ) : null}
                          <span className="text-xs font-mono text-amber-400">
                            {m.speedMultiplier}x Speed
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{m.title}</p>
                      <p className="text-xs text-sky-300 mt-2">
                        +{Math.round((m.speedMultiplier - 1) * 100)}% Sprint Speed · +
                        {Math.round((m.jumpMultiplier - 1) * 100)}% Jump Height
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800">
                      {m.unlocked ? (
                        <button
                          onClick={() => onToggleMount(m.id)}
                          className={`w-full py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            isMounted
                              ? 'bg-amber-500 text-neutral-950 font-bold'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isMounted ? 'Riding (Dismount [G])' : 'Summon Mount [G]'}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onBuyMount(m.id, true)}
                            className="flex-1 py-2 px-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition cursor-pointer"
                          >
                            Buy £{(m.priceGBP || 2.99).toFixed(2)}
                          </button>
                          <button
                            onClick={() => onBuyMount(m.id, false)}
                            disabled={!canAfford}
                            className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            }`}
                          >
                            {m.priceSilver} Silver
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'mount_armor' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40">
                <h3 className="text-sm font-bold text-purple-300">Mount Armored Barding &amp; Elemental Auras</h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Equip horned chanfrons, runic saddles, and flaming hoof auras to reach up to +140% gallop speed on your beasts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mountArmor.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{a.name}</span>
                        <span className="text-xs font-mono font-bold text-purple-400 uppercase">{a.slot}</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{a.description}</p>
                      <div className="mt-2 text-xs font-bold text-emerald-400">
                        +{Math.round(a.speedBonus * 100)}% Mount Gallop Speed
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800">
                      <button
                        onClick={() => onToggleMountArmor && onToggleMountArmor(a.id)}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          a.unlocked
                            ? 'bg-purple-600 hover:bg-purple-500 text-white'
                            : silver >= a.priceSilver
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        }`}
                      >
                        {a.unlocked ? 'Equipped on Mount' : `Unlock for ${a.priceSilver} Silver`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
