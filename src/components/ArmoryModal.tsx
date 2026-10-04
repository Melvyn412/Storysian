import React, { useState, useMemo } from 'react';
import { ArmoryItem, ArmoryCategory, EquippedGear, ItemRarity } from '../types';
import { ARMORY_ITEMS, getNextArmoryUnlock } from '../game/armoryConfig';
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
} from 'lucide-react';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number; // Valor points
  equippedGear: EquippedGear;
  onEquipItem: (category: ArmoryCategory, itemId: string) => void;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  isOpen,
  onClose,
  currentPoints,
  equippedGear,
  onEquipItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ArmoryCategory>('all');
  const [activeTabRarity, setActiveTabRarity] = useState<string>('all');

  const nextUnlock = useMemo(() => getNextArmoryUnlock(currentPoints), [currentPoints]);

  const filteredItems = useMemo(() => {
    return ARMORY_ITEMS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (activeTabRarity !== 'all' && item.rarity !== activeTabRarity) return false;
      return true;
    }).sort((a, b) => a.requiredPoints - b.requiredPoints);
  }, [selectedCategory, activeTabRarity]);

  const unlockedCount = useMemo(() => {
    return ARMORY_ITEMS.filter((item) => currentPoints >= item.requiredPoints).length;
  }, [currentPoints]);

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

  const isEquipped = (item: ArmoryItem) => {
    if (item.category === 'weapon') return equippedGear.weaponId === item.id;
    if (item.category === 'shield') return equippedGear.shieldId === item.id;
    if (item.category === 'headwear') return equippedGear.headwearId === item.id;
    return false;
  };

  const handleEquip = (item: ArmoryItem) => {
    if (currentPoints < item.requiredPoints) return;
    sound.playShieldBlock();
    onEquipItem(item.category, item.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-gradient-to-b from-neutral-900 via-stone-950 to-neutral-950 border-2 border-amber-600/70 rounded-2xl shadow-[0_0_50px_rgba(217,119,6,0.3)] overflow-hidden">
        {/* Top Header Banner */}
        <div className="relative px-6 py-4 border-b border-neutral-800 bg-neutral-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg border border-amber-400/50">
              <Swords className="w-6 h-6 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-wider text-amber-100 font-serif uppercase drop-shadow">
                  Viking Armory & Point Unlocks
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {unlockedCount} / {ARMORY_ITEMS.length} Unlocked
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Earn Valor Points by defeating raiders, slaying bosses, and conquering campaign raids to forge legendary gear!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Player Valor Points Pill */}
            <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-amber-950/60 to-neutral-900 rounded-xl border border-amber-500/40 shadow-inner">
              <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Your Valor Points</div>
                <div className="text-lg font-black font-mono text-amber-300 leading-none">
                  {currentPoints.toLocaleString()} <span className="text-xs text-amber-500 font-sans">PTS</span>
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
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              All Equipment ({ARMORY_ITEMS.length})
            </button>

            <button
              onClick={() => setSelectedCategory('shield')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'shield'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Shields (6)
            </button>

            <button
              onClick={() => setSelectedCategory('weapon')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'weapon'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Sword className="w-3.5 h-3.5" />
              Swords & Axes (6)
            </button>

            <button
              onClick={() => setSelectedCategory('headwear')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'headwear'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              Headwear & Helmets (6)
            </button>
          </div>

          {/* Quick Equipped Summary */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-400">
            <span className="text-neutral-500 font-semibold">Active Loadout:</span>
            <span className="px-2 py-0.5 rounded bg-neutral-800/90 border border-neutral-700 text-amber-300 font-mono text-[11px]">
              {ARMORY_ITEMS.find((i) => i.id === equippedGear.weaponId)?.name.split(' ')[0] || 'Weapon'}
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800/90 border border-neutral-700 text-blue-300 font-mono text-[11px]">
              {ARMORY_ITEMS.find((i) => i.id === equippedGear.shieldId)?.name.split(' ')[0] || 'Shield'}
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800/90 border border-neutral-700 text-purple-300 font-mono text-[11px]">
              {ARMORY_ITEMS.find((i) => i.id === equippedGear.headwearId)?.name.split(' ')[0] || 'Helm'}
            </span>
          </div>
        </div>

        {/* Equipment Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
          {filteredItems.map((item) => {
            const unlocked = currentPoints >= item.requiredPoints;
            const equipped = isEquipped(item);
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
                      onClick={() => handleEquip(item)}
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
            <span>Equipping gear immediately transforms your 3D avatar's physical weapon, shield, and helmet model in the live world!</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition border border-neutral-700 cursor-pointer"
          >
            Close Armory
          </button>
        </div>
      </div>
    </div>
  );
};
