import React, { useState, useMemo } from 'react';
import {
  ArmoryItem,
  ArmoryCategory,
  EquippedGear,
  ItemRarity,
  NavalCategory,
  NavalCustomizationItem,
  DrakkarCustomization,
} from '../types';
import { ARMORY_ITEMS, getNextArmoryUnlock } from '../game/armoryConfig';
import {
  NAVAL_CUSTOMIZATION_ITEMS,
  DEFAULT_DRAKKAR_CUSTOMIZATION,
  DEFAULT_UNLOCKED_NAVAL_ITEMS,
  getNavalItemById,
  getNavalItemPerk,
  calculateNavalBonuses,
  NAVAL_PRESETS,
} from '../game/navalArmoryConfig';
import { sound } from '../audio/soundEngine';
import {
  Shield,
  Sword,
  Crown,
  Lock,
  Check,
  Sparkles,
  Zap,
  Flame,
  Snowflake,
  X,
  Trophy,
  ShieldCheck,
  Swords,
  Ship,
  Coins,
  Navigation,
  Wind,
  Anchor,
  Compass,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Waves,
} from 'lucide-react';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number; // Valor points
  equippedGear: EquippedGear;
  onEquipItem: (category: ArmoryCategory, itemId: string) => void;
  // Naval Vessels Armory Additions
  silver?: number;
  drakkarCustomization?: DrakkarCustomization;
  unlockedNavalItems?: string[];
  onPurchaseNavalItem?: (item: NavalCustomizationItem) => void;
  onEquipNavalItem?: (category: NavalCategory, itemId: string) => void;
  initialTab?: 'warrior' | 'naval';
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  isOpen,
  onClose,
  currentPoints,
  equippedGear,
  onEquipItem,
  silver = 150,
  drakkarCustomization = DEFAULT_DRAKKAR_CUSTOMIZATION,
  unlockedNavalItems = DEFAULT_UNLOCKED_NAVAL_ITEMS,
  onPurchaseNavalItem,
  onEquipNavalItem,
  initialTab = 'warrior',
}) => {
  // Main Tab: Warrior Gear vs Naval Vessels
  const [mainTab, setMainTab] = useState<'warrior' | 'naval'>(initialTab);

  // Warrior Armory Filters
  const [selectedWarriorCategory, setSelectedWarriorCategory] = useState<'all' | ArmoryCategory>('all');
  const [warriorRarityFilter, setWarriorRarityFilter] = useState<string>('all');

  // Naval Armory Filters
  const [selectedNavalCategory, setSelectedNavalCategory] = useState<'all' | NavalCategory>('all');
  const [navalRarityFilter, setNavalRarityFilter] = useState<string>('all');

  // Next Valor Point unlock for warrior gear
  const nextUnlock = useMemo(() => getNextArmoryUnlock(currentPoints), [currentPoints]);

  // Filtered Warrior Items
  const filteredWarriorItems = useMemo(() => {
    return ARMORY_ITEMS.filter((item) => {
      if (selectedWarriorCategory !== 'all' && item.category !== selectedWarriorCategory) return false;
      if (warriorRarityFilter !== 'all' && item.rarity !== warriorRarityFilter) return false;
      return true;
    }).sort((a, b) => a.requiredPoints - b.requiredPoints);
  }, [selectedWarriorCategory, warriorRarityFilter]);

  const unlockedWarriorCount = useMemo(() => {
    return ARMORY_ITEMS.filter((item) => currentPoints >= item.requiredPoints).length;
  }, [currentPoints]);

  // Filtered Naval Items
  const filteredNavalItems = useMemo(() => {
    return NAVAL_CUSTOMIZATION_ITEMS.filter((item) => {
      if (selectedNavalCategory !== 'all' && item.category !== selectedNavalCategory) return false;
      if (navalRarityFilter !== 'all' && item.rarity !== navalRarityFilter) return false;
      return true;
    }).sort((a, b) => a.costSilver - b.costSilver);
  }, [selectedNavalCategory, navalRarityFilter]);

  const unlockedNavalCount = useMemo(() => {
    return NAVAL_CUSTOMIZATION_ITEMS.filter((item) => unlockedNavalItems.includes(item.id)).length;
  }, [unlockedNavalItems]);

  // Active Naval Loadout
  const activeSail = useMemo(
    () => getNavalItemById(drakkarCustomization.sailId) || NAVAL_CUSTOMIZATION_ITEMS[0],
    [drakkarCustomization.sailId]
  );
  const activeShields = useMemo(
    () => getNavalItemById(drakkarCustomization.shieldsId) || NAVAL_CUSTOMIZATION_ITEMS[6],
    [drakkarCustomization.shieldsId]
  );
  const activeFigurehead = useMemo(
    () => getNavalItemById(drakkarCustomization.figureheadId) || NAVAL_CUSTOMIZATION_ITEMS[12],
    [drakkarCustomization.figureheadId]
  );

  const navalBonuses = useMemo(() => calculateNavalBonuses(drakkarCustomization), [drakkarCustomization]);

  if (!isOpen) return null;

  const getRarityBadge = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'mythic':
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-500/70',
          glow: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]',
          label: 'Mythic',
        };
      case 'legendary':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/70',
          glow: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
          label: 'Legendary',
        };
      case 'epic':
        return {
          bg: 'bg-purple-950/80 text-purple-300 border-purple-500/70',
          glow: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]',
          label: 'Epic',
        };
      case 'rare':
        return {
          bg: 'bg-sky-950/80 text-sky-300 border-sky-500/70',
          glow: 'shadow-[0_0_8px_rgba(14,165,233,0.25)]',
          label: 'Rare',
        };
      case 'uncommon':
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/70',
          glow: 'shadow-[0_0_8px_rgba(16,185,129,0.2)]',
          label: 'Uncommon',
        };
      default:
        return {
          bg: 'bg-neutral-800 text-neutral-300 border-neutral-600',
          glow: '',
          label: 'Common',
        };
    }
  };

  const getCategoryIcon = (category: ArmoryCategory) => {
    switch (category) {
      case 'shield':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'weapon':
        return <Sword className="w-4 h-4 text-amber-400" />;
      case 'headwear':
        return <Crown className="w-4 h-4 text-purple-400" />;
    }
  };

  const isWarriorEquipped = (item: ArmoryItem) => {
    if (item.category === 'weapon') return equippedGear.weaponId === item.id;
    if (item.category === 'shield') return equippedGear.shieldId === item.id;
    if (item.category === 'headwear') return equippedGear.headwearId === item.id;
    return false;
  };

  const handleEquipWarrior = (item: ArmoryItem) => {
    if (currentPoints < item.requiredPoints) return;
    sound.playShieldBlock();
    onEquipItem(item.category, item.id);
  };

  const isNavalEquipped = (item: NavalCustomizationItem) => {
    if (item.category === 'sail') return drakkarCustomization.sailId === item.id;
    if (item.category === 'shields') return drakkarCustomization.shieldsId === item.id;
    if (item.category === 'figurehead') return drakkarCustomization.figureheadId === item.id;
    return false;
  };

  const isNavalUnlocked = (item: NavalCustomizationItem) => {
    return item.costSilver === 0 || unlockedNavalItems.includes(item.id);
  };

  const handleEquipNaval = (item: NavalCustomizationItem) => {
    if (onEquipNavalItem) {
      onEquipNavalItem(item.category, item.id);
    }
  };

  const handlePurchaseNaval = (item: NavalCustomizationItem) => {
    if (silver < item.costSilver) return;
    if (onPurchaseNavalItem) {
      onPurchaseNavalItem(item);
    }
  };

  const handleApplyPreset = (preset: (typeof NAVAL_PRESETS)[0]) => {
    if (!onEquipNavalItem) return;
    onEquipNavalItem('sail', preset.customization.sailId);
    onEquipNavalItem('shields', preset.customization.shieldsId);
    onEquipNavalItem('figurehead', preset.customization.figureheadId);
    sound.playVictoryTriumph();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-gradient-to-b from-neutral-900 via-stone-950 to-neutral-950 border-2 border-amber-600/70 rounded-2xl shadow-[0_0_50px_rgba(217,119,6,0.35)] overflow-hidden">
        {/* Top Header Banner */}
        <div className="relative px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-950/95 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg border border-amber-400/50 shrink-0">
              {mainTab === 'naval' ? (
                <Ship className="w-6 h-6 text-neutral-950 animate-pulse" />
              ) : (
                <Swords className="w-6 h-6 text-neutral-950" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black tracking-wider text-amber-100 font-serif uppercase drop-shadow">
                  {mainTab === 'naval' ? 'Naval Armory: Drakkar Longship' : 'Viking Armory: Warrior Milestones'}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {mainTab === 'naval'
                    ? `${unlockedNavalCount} / ${NAVAL_CUSTOMIZATION_ITEMS.length} Unlocked`
                    : `${unlockedWarriorCount} / ${ARMORY_ITEMS.length} Unlocked`}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                {mainTab === 'naval'
                  ? 'Spend Silver to customize your Drakkar sail patterns, hull gunwale shields, and bow figurehead design!'
                  : 'Earn Valor Points in raids and combat to forge legendary shields, axes, and crowned helmets!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Player Silver Balance Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shadow-inner ${
                mainTab === 'naval'
                  ? 'bg-gradient-to-r from-amber-950/90 to-stone-900 border-amber-400/60 ring-1 ring-amber-400/30'
                  : 'bg-neutral-900/80 border-neutral-800'
              }`}
            >
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 animate-bounce" />
              <div>
                <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Your Silver</div>
                <div className="text-base sm:text-lg font-black font-mono text-amber-300 leading-none">
                  {silver.toLocaleString()} <span className="text-[10px] text-amber-500 font-sans">SILVER</span>
                </div>
              </div>
            </div>

            {/* Player Valor Points Pill */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shadow-inner ${
                mainTab === 'warrior'
                  ? 'bg-gradient-to-r from-amber-950/90 to-stone-900 border-amber-400/60 ring-1 ring-amber-400/30'
                  : 'bg-neutral-900/80 border-neutral-800'
              }`}
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Valor Points</div>
                <div className="text-base sm:text-lg font-black font-mono text-amber-300 leading-none">
                  {currentPoints.toLocaleString()} <span className="text-[10px] text-amber-500 font-sans">PTS</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition border border-neutral-700 cursor-pointer"
              title="Close Armory [Esc]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRIMARY SUB-TAB SWITCHER: Warrior Gear vs Naval Vessels */}
        <div className="px-4 sm:px-6 py-2 bg-neutral-950 border-b border-neutral-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => {
                setMainTab('warrior');
                sound.playShieldBlock();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mainTab === 'warrior'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Swords className="w-4 h-4 text-amber-300" />
              <span>Warrior Gear</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] bg-black/40 text-amber-200">
                Valor
              </span>
            </button>

            <button
              onClick={() => {
                setMainTab('naval');
                sound.playWaveSplash();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer relative ${
                mainTab === 'naval'
                  ? 'bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Ship className="w-4 h-4 text-sky-300" />
              <span>Naval Vessels (Drakkar)</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/30 text-amber-300 font-bold border border-amber-400/40">
                🪙 Spend Silver
              </span>
            </button>
          </div>

          {/* Quick Active Loadout Pill */}
          {mainTab === 'naval' ? (
            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
              <span className="text-neutral-500 font-semibold">Drakkar Outfit:</span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-rose-300 font-mono text-[11px] truncate max-w-[130px]">
                ⛵ {activeSail?.name.split(' ')[0]}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-[11px] truncate max-w-[130px]">
                🛡️ {activeShields?.name.split(' ')[0]}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-cyan-300 font-mono text-[11px] truncate max-w-[130px]">
                🐉 {activeFigurehead?.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
              <span className="text-neutral-500 font-semibold">Active Loadout:</span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-[11px]">
                {ARMORY_ITEMS.find((i) => i.id === equippedGear.weaponId)?.name.split(' ')[0] || 'Weapon'}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-blue-300 font-mono text-[11px]">
                {ARMORY_ITEMS.find((i) => i.id === equippedGear.shieldId)?.name.split(' ')[0] || 'Shield'}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-purple-300 font-mono text-[11px]">
                {ARMORY_ITEMS.find((i) => i.id === equippedGear.headwearId)?.name.split(' ')[0] || 'Helm'}
              </span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* NAVAL VESSELS VIEW */}
        {/* ======================================================== */}
        {mainTab === 'naval' && (
          <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
            {/* INTERACTIVE DRAKKAR LONGSHIP SHOWCASE BANNER */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-950 via-slate-950 to-neutral-950 border-b border-neutral-800">
              <div className="bg-gradient-to-b from-slate-900/90 to-neutral-900/95 rounded-xl border border-sky-500/40 p-3 sm:p-4 shadow-xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  {/* Visual Drakkar Profile with Dynamic Customizations */}
                  <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4">
                    {/* Illustrated Longship Graphic Stage */}
                    <div className="relative w-full sm:w-64 h-32 bg-gradient-to-b from-sky-950/60 to-slate-950 rounded-xl border border-neutral-700/80 p-2 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                      {/* Ocean waves background effect */}
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-sky-900/40 to-transparent flex items-end justify-center">
                        <Waves className="w-full h-6 text-sky-400/30 animate-pulse" />
                      </div>

                      {/* Mast & Sail Visual Representation */}
                      <div className="relative z-10 flex flex-col items-center">
                        {/* Sail with live stripes */}
                        <div
                          className="w-24 h-14 rounded-sm border border-neutral-700 shadow-md relative overflow-hidden flex"
                          style={{ backgroundColor: activeSail?.sailColor || '#cc2929' }}
                        >
                          {/* Alternating vertical stripes */}
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 h-full"
                              style={{
                                backgroundColor:
                                  i % 2 === 0
                                    ? activeSail?.sailColor || '#cc2929'
                                    : activeSail?.sailStripeColor || '#f8fafc',
                              }}
                            />
                          ))}
                          {/* Center Medallion Emblem */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-5 h-5 rounded-full bg-neutral-900/80 border border-amber-400/80 flex items-center justify-center shadow">
                              <Sparkles className="w-3 h-3 text-amber-300" />
                            </div>
                          </div>
                        </div>

                        {/* Mast Pole */}
                        <div className="w-1.5 h-6 bg-amber-900 border-x border-amber-950" />

                        {/* Ship Hull Silhouette with Gunwale Shields */}
                        <div className="relative w-44 h-5 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-b-xl border border-amber-800 flex items-center justify-center shadow">
                          {/* Bow figurehead prow (left/front) */}
                          <div
                            className="absolute -left-3 -top-3 w-5 h-6 rounded-tl-lg flex items-center justify-center font-bold text-xs shadow-md border"
                            style={{
                              backgroundColor: activeFigurehead?.figureheadColor || '#a64424',
                              borderColor: activeFigurehead?.emissiveColor || '#7c2d12',
                              boxShadow: `0 0 10px ${activeFigurehead?.emissiveColor || '#7c2d12'}`,
                            }}
                            title={`Figurehead: ${activeFigurehead?.name}`}
                          >
                            <Eye className="w-3 h-3 text-amber-200 animate-pulse" />
                          </div>

                          {/* Hull shields row */}
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-full border border-black/80 shadow-inner flex items-center justify-center"
                                style={{
                                  backgroundColor:
                                    i % 2 === 0
                                      ? activeShields?.shieldColorA || '#dc2626'
                                      : activeShields?.shieldColorB || '#d97706',
                                }}
                              >
                                <div
                                  className="w-1.5 h-1.5 rounded-full shadow"
                                  style={{ backgroundColor: activeShields?.shieldBossColor || '#cbd5e1' }}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Stern rudder (right/back) */}
                          <div className="absolute -right-2 -top-1 w-3 h-4 bg-amber-950 rounded-tr-md border border-amber-900" />
                        </div>
                      </div>

                      <div className="absolute top-1 left-2 text-[9px] font-mono text-sky-300/80">
                        KATFJORD LONGSHIP
                      </div>
                    </div>

                    {/* Ship Specs & Outfitted Summary */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                          Active Drakkar Warship
                        </span>
                        <span className="text-xs text-neutral-400">Pier 1 Anchorage</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-amber-100 font-serif">
                        {activeFigurehead?.name.split(' ')[0]}’s{' '}
                        {activeSail?.name.replace(' Canvas', '').replace(' Sail', '')} Warship
                      </h3>
                      <p className="text-xs text-neutral-300 line-clamp-1 mt-0.5">
                        Fitted with {activeShields?.name} along the gunwales and armed with broadside frost-ballistas.
                      </p>

                      {/* Naval Buffs Matrix */}
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="p-1.5 rounded-lg bg-neutral-950/80 border border-neutral-800 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400">
                            <Wind className="w-3 h-3 text-sky-400" /> Speed
                          </div>
                          <div className="text-xs sm:text-sm font-black font-mono text-sky-300">
                            +{navalBonuses.speedBonus}% <span className="text-[10px] font-sans text-neutral-400">knots</span>
                          </div>
                        </div>

                        <div className="p-1.5 rounded-lg bg-neutral-950/80 border border-neutral-800 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400">
                            <Shield className="w-3 h-3 text-emerald-400" /> Hull Armor
                          </div>
                          <div className="text-xs sm:text-sm font-black font-mono text-emerald-300">
                            +{navalBonuses.armorBonus}% <span className="text-[10px] font-sans text-neutral-400">def</span>
                          </div>
                        </div>

                        <div className="p-1.5 rounded-lg bg-neutral-950/80 border border-neutral-800 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400">
                            <Anchor className="w-3 h-3 text-rose-400" /> Ram Impact
                          </div>
                          <div className="text-xs sm:text-sm font-black font-mono text-rose-300">
                            +{navalBonuses.rammingBonus}% <span className="text-[10px] font-sans text-neutral-400">dmg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Presets Menu */}
                  <div className="w-full lg:w-60 border-t lg:border-t-0 lg:border-l border-neutral-800 pt-3 lg:pt-0 lg:pl-4 flex flex-col justify-center">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Quick Longship Presets
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                      {NAVAL_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleApplyPreset(preset)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-left border border-neutral-800 hover:border-amber-500/50 transition cursor-pointer text-xs group"
                        >
                          <span className="font-semibold text-neutral-300 group-hover:text-amber-300 truncate">
                            {preset.name}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 ml-1.5"
                            style={{ backgroundColor: preset.themeColor }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NAVAL SUB-CATEGORIES BAR (Sail Patterns, Hull Shields, Bow Figureheads) */}
            <div className="px-4 sm:px-6 py-2.5 bg-neutral-950/90 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedNavalCategory('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedNavalCategory === 'all'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Ship className="w-3.5 h-3.5" />
                  All Vessel Parts ({NAVAL_CUSTOMIZATION_ITEMS.length})
                </button>

                <button
                  onClick={() => setSelectedNavalCategory('sail')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedNavalCategory === 'sail'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                  Sail Patterns (6)
                </button>

                <button
                  onClick={() => setSelectedNavalCategory('shields')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedNavalCategory === 'shields'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Hull Shields (6)
                </button>

                <button
                  onClick={() => setSelectedNavalCategory('figurehead')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedNavalCategory === 'figurehead'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Bow Figureheads (6)
                </button>
              </div>

              {/* Rarity Filter */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-neutral-500 font-medium hidden sm:inline">Rarity:</span>
                {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setNavalRarityFilter(r)}
                    className={`px-2 py-0.5 rounded capitalize transition cursor-pointer ${
                      navalRarityFilter === r
                        ? 'bg-neutral-700 text-amber-300 font-bold'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* NAVAL CARDS GRID */}
            <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
              {filteredNavalItems.map((item) => {
                const isEquipped = isNavalEquipped(item);
                const isUnlocked = isNavalUnlocked(item);
                const canAfford = silver >= item.costSilver;
                const rarityInfo = getRarityBadge(item.rarity);
                const perkText = getNavalItemPerk(item);

                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col rounded-xl border p-4 transition-all duration-200 ${
                      isEquipped
                        ? 'bg-gradient-to-b from-sky-950/40 via-neutral-900 to-neutral-950 border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.25)]'
                        : isUnlocked
                        ? 'bg-neutral-900/85 hover:bg-neutral-850 border-neutral-700/80 hover:border-neutral-500 shadow-md'
                        : 'bg-neutral-950/75 border-neutral-800/80 opacity-85'
                    }`}
                  >
                    {/* Top Row: Category Icon + Rarity + Cost */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded bg-neutral-800 border border-neutral-700">
                          {item.category === 'sail' && <Wind className="w-3.5 h-3.5 text-rose-400" />}
                          {item.category === 'shields' && <Shield className="w-3.5 h-3.5 text-blue-400" />}
                          {item.category === 'figurehead' && <Eye className="w-3.5 h-3.5 text-amber-400" />}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${rarityInfo.bg} ${rarityInfo.glow}`}
                        >
                          {rarityInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs">
                        {isUnlocked ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-[11px]">
                            <Check className="w-3.5 h-3.5" />
                            {item.costSilver === 0 ? 'Starter' : 'Owned'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-300 font-mono text-[11px] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/40">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            {item.costSilver} Silver
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visual Preview Graphic Box */}
                    <div className="flex items-center gap-3 mb-2.5">
                      {/* Custom preview container based on category */}
                      {item.category === 'sail' && (
                        <div
                          className="relative w-16 h-14 rounded-xl flex items-center justify-center shrink-0 border border-neutral-700 shadow-inner overflow-hidden"
                          style={{ backgroundColor: item.sailColor }}
                        >
                          {/* 4 striped bands */}
                          <div className="absolute inset-0 flex">
                            {[0, 1, 2, 3].map((idx) => (
                              <div
                                key={idx}
                                className="flex-1 h-full"
                                style={{
                                  backgroundColor: idx % 2 === 0 ? item.sailColor : item.sailStripeColor,
                                }}
                              />
                            ))}
                          </div>
                          <div className="relative z-10 w-5 h-5 rounded-full bg-black/60 border border-white/60 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                          </div>
                        </div>
                      )}

                      {item.category === 'shields' && (
                        <div className="relative w-16 h-14 rounded-xl bg-neutral-950 border border-neutral-700 flex items-center justify-center gap-1 p-1 shrink-0 shadow-inner">
                          <div
                            className="w-6 h-6 rounded-full border border-black/80 flex items-center justify-center shadow"
                            style={{ backgroundColor: item.shieldColorA }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: item.shieldBossColor || '#cbd5e1' }}
                            />
                          </div>
                          <div
                            className="w-6 h-6 rounded-full border border-black/80 flex items-center justify-center shadow"
                            style={{ backgroundColor: item.shieldColorB }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: item.shieldBossColor || '#cbd5e1' }}
                            />
                          </div>
                        </div>
                      )}

                      {item.category === 'figurehead' && (
                        <div
                          className="relative w-16 h-14 rounded-xl border border-neutral-700 flex flex-col items-center justify-center shrink-0 shadow-inner overflow-hidden"
                          style={{
                            backgroundColor: item.figureheadColor || '#a64424',
                            boxShadow: item.emissiveColor ? `0 0 12px ${item.emissiveColor}44` : undefined,
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-md border"
                            style={{
                              backgroundColor: '#1e293b',
                              borderColor: item.emissiveColor || '#7c2d12',
                            }}
                          >
                            <Eye
                              className="w-4 h-4 animate-pulse"
                              style={{ color: item.emissiveColor || '#f59e0b' }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-white/90 uppercase mt-0.5">
                            {item.figureheadType}
                          </span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-neutral-100 font-serif leading-snug truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.lore}
                        </p>
                      </div>
                    </div>

                    {/* Perk & Stat Box */}
                    <div className="mb-3 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span className="text-sky-200/90 leading-tight">{perkText}</span>
                    </div>

                    {/* Footer Equip or Purchase Button */}
                    <div className="mt-auto pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                      {isEquipped ? (
                        <div className="w-full py-1.5 px-3 rounded-lg bg-sky-950/80 border border-sky-500/70 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-inner">
                          <CheckCircle2 className="w-4 h-4 text-sky-400" />
                          EQUIPPED ON LONGSHIP
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleEquipNaval(item)}
                          className="w-full py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md active:scale-95 cursor-pointer"
                        >
                          <Anchor className="w-4 h-4" />
                          EQUIP ON DRAKKAR
                        </button>
                      ) : canAfford ? (
                        <button
                          onClick={() => handlePurchaseNaval(item)}
                          className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg active:scale-95 cursor-pointer border border-amber-400/40"
                        >
                          <Coins className="w-4 h-4 text-amber-200" />
                          SPEND {item.costSilver} SILVER & EQUIP
                        </button>
                      ) : (
                        <div className="w-full py-1.5 px-3 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs flex items-center justify-center gap-1.5 font-mono">
                          <Lock className="w-3.5 h-3.5 text-neutral-500" />
                          Need {item.costSilver - silver} more Silver
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Tip for Naval Armory */}
            <div className="px-6 py-2.5 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <span className="font-bold text-sky-400">Naval Tip:</span>
                <span>
                  All customized sail patterns, hull shields, and figureheads immediately transform the live 3D Drakkar
                  longship docked at Katfjord Pier!
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition border border-neutral-700 cursor-pointer"
              >
                Close Armory
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* WARRIOR GEAR VIEW (Original Valor Points Milestones) */}
        {/* ======================================================== */}
        {mainTab === 'warrior' && (
          <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
            {/* Milestone Progress Bar */}
            <div className="px-6 py-2.5 bg-neutral-900/60 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-[280px] flex-1">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                {nextUnlock ? (
                  <span className="text-neutral-300 truncate">
                    Next Unlock: <strong className="text-amber-300">{nextUnlock.name}</strong> at{' '}
                    <strong className="text-white font-mono">{nextUnlock.requiredPoints} pts</strong> (
                    <span className="text-cyan-400 font-mono font-bold">
                      {nextUnlock.requiredPoints - currentPoints} pts remaining
                    </span>
                    )
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Supreme Warlord! All armory equipment unlocked!
                  </span>
                )}
              </div>

              {nextUnlock && (
                <div className="flex items-center gap-2 w-full sm:w-64">
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, (currentPoints / nextUnlock.requiredPoints) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-neutral-400 shrink-0">
                    {Math.round((currentPoints / nextUnlock.requiredPoints) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Category Navigation Bar */}
            <div className="px-6 py-3 bg-neutral-950/70 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedWarriorCategory('all')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedWarriorCategory === 'all'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  All Equipment ({ARMORY_ITEMS.length})
                </button>

                <button
                  onClick={() => setSelectedWarriorCategory('shield')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedWarriorCategory === 'shield'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Shields (6)
                </button>

                <button
                  onClick={() => setSelectedWarriorCategory('weapon')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedWarriorCategory === 'weapon'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <Sword className="w-3.5 h-3.5" />
                  Swords & Axes (6)
                </button>

                <button
                  onClick={() => setSelectedWarriorCategory('headwear')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedWarriorCategory === 'headwear'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  Headwear & Helmets (6)
                </button>
              </div>

              {/* Rarity Filter */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-neutral-500 font-medium hidden sm:inline">Rarity:</span>
                {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setWarriorRarityFilter(r)}
                    className={`px-2 py-0.5 rounded capitalize transition cursor-pointer ${
                      warriorRarityFilter === r
                        ? 'bg-neutral-700 text-amber-300 font-bold'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Cards Grid */}
            <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
              {filteredWarriorItems.map((item) => {
                const unlocked = currentPoints >= item.requiredPoints;
                const equipped = isWarriorEquipped(item);
                const rarityInfo = getRarityBadge(item.rarity);

                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col rounded-xl border p-4 transition-all duration-200 ${
                      equipped
                        ? 'bg-gradient-to-b from-amber-950/40 via-neutral-900 to-neutral-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : unlocked
                        ? 'bg-neutral-900/80 hover:bg-neutral-850 border-neutral-700/80 hover:border-neutral-500 shadow-md'
                        : 'bg-neutral-950/70 border-neutral-800/80 opacity-75'
                    }`}
                  >
                    {/* Top Row: Category Icon + Rarity + Point Requirement */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded bg-neutral-800 border border-neutral-700">
                          {getCategoryIcon(item.category)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${rarityInfo.bg} ${rarityInfo.glow}`}
                        >
                          {rarityInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs">
                        {unlocked ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-[11px]">
                            <Check className="w-3.5 h-3.5" />
                            {item.requiredPoints === 0 ? 'Starter' : `${item.requiredPoints} pts`}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-neutral-400 font-mono text-[11px] bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700">
                            <Lock className="w-3 h-3 text-amber-500" />
                            {item.requiredPoints} pts
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visual Swatch Card & Name */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <div
                        className="relative w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-neutral-700 shadow-inner overflow-hidden"
                        style={{
                          backgroundColor: item.primaryColor,
                        }}
                      >
                        {/* Decorative accent element */}
                        <div
                          className="absolute inset-2 rounded-lg border-2 border-dashed opacity-60"
                          style={{ borderColor: item.accentColor }}
                        />
                        <div
                          className="w-6 h-6 rounded-full shadow-md flex items-center justify-center z-10"
                          style={{ backgroundColor: item.accentColor }}
                        >
                          {item.specialEffect === 'frost' ? (
                            <Snowflake className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                          ) : item.specialEffect === 'lightning' ? (
                            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                          ) : item.specialEffect === 'gold_glow' ? (
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                          ) : item.specialEffect === 'blood_rune' ? (
                            <Flame className="w-3.5 h-3.5 text-red-300" />
                          ) : (
                            getCategoryIcon(item.category)
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-neutral-100 font-serif leading-snug truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Perk & Stat Box */}
                    <div className="mb-3 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-amber-200/90 leading-tight">{item.perkDescription}</span>
                    </div>

                    {/* Footer Equip Button & Status */}
                    <div className="mt-auto pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                      {equipped ? (
                        <div className="w-full py-1.5 px-3 rounded-lg bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-inner">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          EQUIPPED IN 3D REALM
                        </div>
                      ) : unlocked ? (
                        <button
                          onClick={() => handleEquipWarrior(item)}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md active:scale-95 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          EQUIP NOW
                        </button>
                      ) : (
                        <div className="w-full py-1.5 px-3 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs flex items-center justify-center gap-1.5 font-mono">
                          <Lock className="w-3.5 h-3.5 text-neutral-500" />
                          Earn {item.requiredPoints - currentPoints} more points
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Tips Bar */}
            <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
              <div className="flex items-center gap-1 text-neutral-300">
                <span className="font-bold text-amber-400">Pro-tip:</span>
                <span>
                  Equipping warrior gear transforms your 3D avatar’s weapon, shield, and helmet model in real time!
                </span>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition border border-neutral-700 cursor-pointer"
              >
                Close Armory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
