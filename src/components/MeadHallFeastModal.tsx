import React from 'react';
import { X, UtensilsCrossed, Sparkles, Flame, Heart, Zap, Award, Wine } from 'lucide-react';
import { ActiveFeastBuff, FeastBuffType } from '../types';
import { sound } from '../audio/soundEngine';

interface FeastDish {
  id: FeastBuffType;
  name: string;
  category: 'dish' | 'drink';
  costSilver: number;
  durationSeconds: number;
  effectLabel: string;
  lore: string;
  icon: 'boar' | 'salmon' | 'mead' | 'mushroom';
  accentColor: string;
}

const FEAST_MENU: FeastDish[] = [
  {
    id: 'boar_strength',
    name: 'Spit-Roasted Wild Boar with Glazed Apples',
    category: 'dish',
    costSilver: 60,
    durationSeconds: 180,
    effectLabel: '+35% Attack Damage & Cleave Power',
    lore: 'Slow-cooked over Katfjord hearth coals, succulent dark pork favored by Jarl shieldmen.',
    icon: 'boar',
    accentColor: 'from-amber-950 to-neutral-900 border-amber-500/50 text-amber-300',
  },
  {
    id: 'salmon_stamina',
    name: 'Alderwood Smoked Katfjord King Salmon',
    category: 'dish',
    costSilver: 50,
    durationSeconds: 180,
    effectLabel: '+50% Stamina Recovery & +25% Sprint Speed',
    lore: 'Freshly hauled from the fjord depths and smoked with fragrant mountain herbs.',
    icon: 'salmon',
    accentColor: 'from-sky-950 to-neutral-900 border-sky-500/50 text-sky-300',
  },
  {
    id: 'honey_mead',
    name: 'Golden Clover Honey Mead (Horn of Valhalla)',
    category: 'drink',
    costSilver: 75,
    durationSeconds: 180,
    effectLabel: '+6 HP/sec Continuous Health Regeneration',
    lore: 'Fermented meadow wildflower honey brewed in aged oak casks. Warmth for the warrior spirit.',
    icon: 'mead',
    accentColor: 'from-yellow-950 to-neutral-900 border-yellow-500/50 text-yellow-300',
  },
  {
    id: 'fly_agaric',
    name: 'Shamanic Fly Agaric Red Cap Stew',
    category: 'dish',
    costSilver: 90,
    durationSeconds: 180,
    effectLabel: '+40% Attack Speed & Fiery Berserk Battle Aura',
    lore: 'Consecrated red mushrooms picked by Odin’s völva to kindle uncontrollable battle frenzy.',
    icon: 'mushroom',
    accentColor: 'from-red-950 to-neutral-900 border-red-500/50 text-red-300',
  },
];

interface MeadHallFeastModalProps {
  isOpen: boolean;
  onClose: () => void;
  silver: number;
  activeBuffs: ActiveFeastBuff[];
  onConsumeFeast: (dishId: FeastBuffType, name: string, durationSeconds: number) => void;
  onSkalToast?: () => void;
}

export const MeadHallFeastModal: React.FC<MeadHallFeastModalProps> = ({
  isOpen,
  onClose,
  silver,
  activeBuffs,
  onConsumeFeast,
  onSkalToast,
}) => {
  if (!isOpen) return null;

  const handleTaste = (dish: FeastDish) => {
    if (silver < dish.costSilver) {
      sound.playGateBash();
      return;
    }
    sound.playMeadChug();
    onConsumeFeast(dish.id, dish.name, dish.durationSeconds);
  };

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'boar':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'salmon':
        return <Zap className="w-5 h-5 text-sky-400" />;
      case 'mead':
        return <Wine className="w-5 h-5 text-yellow-400" />;
      case 'mushroom':
        return <Sparkles className="w-5 h-5 text-red-400" />;
      default:
        return <UtensilsCrossed className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-3xl bg-neutral-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-amber-300 font-['Cinzel',serif] flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-400" />
              <span>Katfjord Longhouse Great Feast Banquet</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Feast upon roast meats, draughts of mead, and receive powerful Norse combat blessings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-amber-300 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
              {silver} Silver
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
          {/* Skál Ceremonial Horn Button */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/70 via-neutral-900 to-amber-950/70 border border-amber-500/50 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div>
              <h3 className="text-sm font-bold text-amber-200 font-['Cinzel',serif] flex items-center gap-2">
                <Wine className="w-4 h-4 text-amber-400" />
                <span>Raise Drinking Horn — SKÁL!</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-0.5">
                Clink carved horns with fellow warriors for morale, war horns fanfare &amp; health renewal!
              </p>
            </div>

            <button
              onClick={() => {
                sound.playMeadChug();
                sound.playCrowdCheer();
                onSkalToast?.();
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Wine className="w-3.5 h-3.5" />
              <span>Toast the Hall (SKÁL!)</span>
            </button>
          </div>

          {/* Active Buffs Bar */}
          {activeBuffs.length > 0 && (
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Feast Blessings:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeBuffs.map((b) => {
                  const remaining = Math.max(0, Math.round((b.expiresAt - Date.now()) / 1000));
                  return (
                    <div
                      key={b.id}
                      className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="font-semibold text-white">{b.name}</div>
                      <div className="font-mono text-amber-400 text-[11px] font-bold">{remaining}s left</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4 Feast Menu Items */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Hearth Feast Dishes &amp; Mead Offerings:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {FEAST_MENU.map((item) => {
                const isActive = activeBuffs.some((b) => b.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl bg-gradient-to-br ${item.accentColor} border transition flex flex-col justify-between gap-3 shadow-md`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900/80 border border-neutral-700 uppercase font-extrabold tracking-wider text-neutral-300">
                          {item.category === 'dish' ? 'Hearth Roast' : 'Oak Barrel Mead'}
                        </span>
                        {renderIcon(item.icon)}
                      </div>
                      <h4 className="text-sm font-bold text-white font-['Cinzel',serif]">{item.name}</h4>
                      <div className="text-xs font-semibold text-amber-300 mt-1">{item.effectLabel}</div>
                      <p className="text-[11px] text-neutral-400 mt-1">{item.lore}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {item.costSilver} Silver (3 Min Buff)
                      </span>
                      <button
                        onClick={() => handleTaste(item)}
                        disabled={silver < item.costSilver}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : silver >= item.costSilver
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        }`}
                      >
                        <UtensilsCrossed className="w-3 h-3" />
                        <span>{isActive ? 'Refresh Buff' : 'Feast & Imbibe'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
