import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Zap,
  Heart,
  Eye,
  ArrowRight,
  Check,
  Shield,
  Layers,
  Award,
} from 'lucide-react';
import { PetId, VikingPet, RunicCatalystType, FusedPetChimera } from '../types';
import { sound } from '../audio/soundEngine';

interface PetFusionAltarModalProps {
  isOpen: boolean;
  onClose: () => void;
  silver: number;
  pets: VikingPet[];
  fusedChimeras: FusedPetChimera[];
  onFusePets: (
    primaryPetId: PetId,
    secondaryPetId: PetId,
    catalyst: RunicCatalystType,
    silverCost: number
  ) => FusedPetChimera | null;
  onEquipChimera?: (chimeraId: string) => void;
}

interface CatalystInfo {
  id: RunicCatalystType;
  name: string;
  runeLetter: string;
  costSilver: number;
  bonusTitle: string;
  description: string;
  icon: any;
  color: string;
}

const CATALYSTS: CatalystInfo[] = [
  {
    id: 'thor_lightning',
    name: "Thor's Thunder Core",
    runeLetter: 'ᚦ',
    costSilver: 250,
    bonusTitle: '+45 Lightning Damage & Chain Shock',
    description: 'Chimeras periodically discharge lightning arc that shocks 3 nearby foes.',
    icon: Zap,
    color: '#38bdf8',
  },
  {
    id: 'odin_wisdom',
    name: "Odin's All-Father Rune",
    runeLetter: 'ᚨ',
    costSilver: 200,
    bonusTitle: '+50% Valor Honor & Relic Sight',
    description: 'Grants clairvoyant minimap sight for hidden chests and +50% battle valor.',
    icon: Eye,
    color: '#a855f7',
  },
  {
    id: 'freya_grace',
    name: "Freyja's Life Bloom",
    runeLetter: 'ᚠ',
    costSilver: 180,
    bonusTitle: '+8 HP/Sec Health Regeneration',
    description: 'Surrounds the chieftain in healing petals that regenerate HP and stamina.',
    icon: Heart,
    color: '#10b981',
  },
  {
    id: 'surtr_magma',
    name: "Surtr's Muspelheim Flame",
    runeLetter: 'ᛋ',
    costSilver: 300,
    bonusTitle: '+65 Fire Damage & Burn Aura',
    description: 'Engulfs the companion in primeval volcanic fire that incinerates shields.',
    icon: Flame,
    color: '#f97316',
  },
];

export const PetFusionAltarModal: React.FC<PetFusionAltarModalProps> = ({
  isOpen,
  onClose,
  silver,
  pets,
  fusedChimeras,
  onFusePets,
  onEquipChimera,
}) => {
  const unlockedPets = pets.filter((p) => p.unlocked);
  const [slotPrimary, setSlotPrimary] = useState<PetId | null>(unlockedPets[0]?.id || null);
  const [slotSecondary, setSlotSecondary] = useState<PetId | null>(unlockedPets[1]?.id || null);
  const [selectedCatalyst, setSelectedCatalyst] = useState<RunicCatalystType>('thor_lightning');
  const [isFusing, setIsFusing] = useState(false);
  const [recentlyFusedChimera, setRecentlyFusedChimera] = useState<FusedPetChimera | null>(null);

  if (!isOpen) return null;

  const catalystObj = CATALYSTS.find((c) => c.id === selectedCatalyst)!;
  const primaryPetObj = pets.find((p) => p.id === slotPrimary);
  const secondaryPetObj = pets.find((p) => p.id === slotSecondary);

  const canFuse =
    slotPrimary &&
    slotSecondary &&
    slotPrimary !== slotSecondary &&
    silver >= catalystObj.costSilver &&
    !isFusing;

  const handlePerformFusion = () => {
    if (!canFuse || !slotPrimary || !slotSecondary) return;

    setIsFusing(true);
    sound.playFanfare();

    setTimeout(() => {
      const result = onFusePets(slotPrimary, slotSecondary, selectedCatalyst, catalystObj.costSilver);
      setIsFusing(false);
      if (result) {
        setRecentlyFusedChimera(result);
        sound.playVictoryTriumph();
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Cinzel',serif] flex items-center gap-2">
                Ancient Pet Runic Fusion Altar
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Breed Mythic Chimeras
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Fuse two companion beasts with a Runic Catalyst to forge powerful hybrid guardians
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-mono font-bold text-amber-300 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
              🪙 {silver} Silver
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Fusion Chamber Interactive Display */}
          <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-purple-950/40 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Slot 1: Primary Pet */}
              <div className="bg-neutral-900/90 border-2 border-dashed border-amber-500/40 rounded-xl p-4 text-center">
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-2">
                  Primary Companion
                </div>
                {primaryPetObj ? (
                  <div className="space-y-1">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl">
                      🐾
                    </div>
                    <div className="text-sm font-bold text-white font-['Cinzel',serif]">{primaryPetObj.name}</div>
                    <div className="text-[11px] text-amber-400">+{primaryPetObj.damageBonus} DMG · {primaryPetObj.rarity}</div>
                  </div>
                ) : (
                  <div className="py-6 text-xs text-neutral-500">Select a Pet Below</div>
                )}
              </div>

              {/* Center Catalyst & Fusion Action */}
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative">
                  <div
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl shadow-xl transition-transform ${
                      isFusing ? 'animate-spin scale-110' : ''
                    }`}
                    style={{
                      borderColor: catalystObj.color,
                      backgroundColor: `${catalystObj.color}20`,
                      boxShadow: `0 0 25px ${catalystObj.color}40`,
                    }}
                  >
                    <span className="font-serif font-black">{catalystObj.runeLetter}</span>
                  </div>
                  <Sparkles
                    className="w-5 h-5 absolute -top-1 -right-1 animate-pulse"
                    style={{ color: catalystObj.color }}
                  />
                </div>

                <div>
                  <div className="text-xs font-bold text-white">{catalystObj.name}</div>
                  <div className="text-[10px] text-neutral-400">Cost: 🪙 {catalystObj.costSilver} Silver</div>
                </div>

                <button
                  disabled={!canFuse}
                  onClick={handlePerformFusion}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                    canFuse
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 active:scale-95'
                      : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {isFusing ? 'Fusing Runic Spirits...' : 'Commence Runic Fusion'}
                </button>
              </div>

              {/* Slot 2: Secondary Pet */}
              <div className="bg-neutral-900/90 border-2 border-dashed border-sky-500/40 rounded-xl p-4 text-center">
                <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider mb-2">
                  Secondary Companion
                </div>
                {secondaryPetObj ? (
                  <div className="space-y-1">
                    <div className="w-14 h-14 mx-auto rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-2xl">
                      🐉
                    </div>
                    <div className="text-sm font-bold text-white font-['Cinzel',serif]">{secondaryPetObj.name}</div>
                    <div className="text-[11px] text-sky-400">+{secondaryPetObj.damageBonus} DMG · {secondaryPetObj.rarity}</div>
                  </div>
                ) : (
                  <div className="py-6 text-xs text-neutral-500">Select a Pet Below</div>
                )}
              </div>
            </div>
          </div>

          {/* Newly Fused Chimera Reward Banner */}
          {recentlyFusedChimera && (
            <div className="bg-gradient-to-r from-purple-950 via-neutral-900 to-purple-950 border-2 border-purple-400 rounded-xl p-4 flex items-center justify-between gap-4 animate-bounce-once">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/30 border border-purple-400 flex items-center justify-center text-3xl shrink-0">
                  {recentlyFusedChimera.iconEmoji}
                </div>
                <div>
                  <div className="text-xs uppercase font-mono font-bold text-purple-300">
                    ✨ MYTHIC CHIMERA FORGED!
                  </div>
                  <div className="text-sm font-bold text-white font-['Cinzel',serif]">
                    {recentlyFusedChimera.name} · <span className="text-xs text-purple-400">{recentlyFusedChimera.title}</span>
                  </div>
                  <div className="text-xs text-neutral-300">
                    Active Ability: <strong className="text-amber-400">{recentlyFusedChimera.activeAbilityName}</strong> ({recentlyFusedChimera.activeAbilityDesc})
                  </div>
                </div>
              </div>

              {onEquipChimera && (
                <button
                  onClick={() => onEquipChimera(recentlyFusedChimera.id)}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow cursor-pointer transition shrink-0"
                >
                  Equip Chimera
                </button>
              )}
            </div>
          )}

          {/* Catalyst Selector */}
          <div>
            <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              1. Select Runic Catalyst:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {CATALYSTS.map((cat) => {
                const isSelected = selectedCatalyst === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCatalyst(cat.id);
                      sound.playButtonClick();
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-purple-400 bg-purple-950/40 shadow-md ring-1 ring-purple-400/50'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white truncate">{cat.name}</span>
                      <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold mb-1">🪙 {cat.costSilver} Silver</div>
                    <div className="text-[10px] text-neutral-400 leading-tight">{cat.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select Companions */}
          <div>
            <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              2. Select Companions to Fuse (Slot 1 &amp; Slot 2):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {unlockedPets.map((pet) => {
                const isPrimary = slotPrimary === pet.id;
                const isSecondary = slotSecondary === pet.id;
                return (
                  <div
                    key={pet.id}
                    className={`p-2.5 rounded-xl border transition text-center relative ${
                      isPrimary
                        ? 'border-amber-400 bg-amber-950/30'
                        : isSecondary
                        ? 'border-sky-400 bg-sky-950/30'
                        : 'border-neutral-800 bg-neutral-900/60'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-white truncate">{pet.name}</div>
                    <div className="text-[9px] text-neutral-400 mt-0.5">+{pet.damageBonus} DMG</div>

                    <div className="flex items-center justify-center gap-1 mt-2">
                      <button
                        onClick={() => setSlotPrimary(pet.id)}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition ${
                          isPrimary
                            ? 'bg-amber-500 text-neutral-950'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300'
                        }`}
                      >
                        Slot 1
                      </button>
                      <button
                        onClick={() => setSlotSecondary(pet.id)}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition ${
                          isSecondary
                            ? 'bg-sky-500 text-neutral-950'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-sky-300'
                        }`}
                      >
                        Slot 2
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fused Chimeras Roster */}
          {fusedChimeras.length > 0 && (
            <div>
              <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                Your Forged Mythic Chimeras ({fusedChimeras.length}):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fusedChimeras.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-neutral-900/80 border border-purple-500/30 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-2xl">{ch.iconEmoji}</div>
                      <div>
                        <div className="text-xs font-bold text-white font-['Cinzel',serif]">{ch.name}</div>
                        <div className="text-[10px] text-purple-300">{ch.activeAbilityName} · +{ch.damageBonus} DMG</div>
                      </div>
                    </div>
                    {onEquipChimera && (
                      <button
                        onClick={() => onEquipChimera(ch.id)}
                        className="px-3 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer transition"
                      >
                        Equip
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Fused chimeras inherit combined attack bonuses and active spell attacks</span>
          <button onClick={onClose} className="hover:text-white transition cursor-pointer">
            Close [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
