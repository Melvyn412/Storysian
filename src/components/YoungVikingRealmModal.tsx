import React from 'react';
import {
  X,
  Compass,
  Sparkles,
  ShoppingBag,
  Flame,
  Navigation,
  Play,
  Pause,
  Coins,
  CheckCircle2,
  ArrowRight,
  TreePine,
} from 'lucide-react';
import {
  MeadowGatherNode,
  MeadowItemCategory,
  YoungVikingSatchel,
} from '../types';

interface YoungVikingRealmModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInMeadowRealm: boolean;
  isYoungVikingMode: boolean;
  isAutoWandering: boolean;
  satchel: YoungVikingSatchel;
  totalItemsGathered: number;
  nodes: MeadowGatherNode[];
  onEnterMeadowRealm: (startAutoWander: boolean) => void;
  onReturnToKatfjord: () => void;
  onToggleYoungVikingMode: () => void;
  onToggleAutoWander: () => void;
  onGatherNearestItem: () => void;
  onTeleportToItem: (x: number, z: number, name: string) => void;
  onTradeAllSatchel: () => void;
  onCraftRecipe: (recipeId: 'berry_tea' | 'mushroom_brew' | 'golden_feast') => void;
}

const SATCHEL_META: {
  key: MeadowItemCategory;
  label: string;
  subtitle: string;
  silverEach: number;
  accent: string;
}[] = [
  {
    key: 'berries',
    label: 'Wild Fjord Berries',
    subtitle: 'Sweet ruby berries from sunlit bushes',
    silverEach: 35,
    accent: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
  },
  {
    key: 'mushrooms',
    label: 'Glowing Moon-Mushrooms',
    subtitle: 'Bioluminescent caps under silver birches',
    silverEach: 45,
    accent: 'text-sky-400 border-sky-500/30 bg-sky-950/20',
  },
  {
    key: 'honeycomb',
    label: 'Golden Mead Honeycomb',
    subtitle: 'Rich clover honey from wild hives',
    silverEach: 55,
    accent: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
  },
  {
    key: 'amber',
    label: 'Baltic Sea Amber',
    subtitle: 'Translucent sunstone gems by the spring',
    silverEach: 65,
    accent: 'text-orange-400 border-orange-500/30 bg-orange-950/20',
  },
  {
    key: 'herbs',
    label: "Freya's Healing Herbs",
    subtitle: 'Fragrant Nordic mint and wild sage',
    silverEach: 40,
    accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
  },
  {
    key: 'golden_apples',
    label: "Idunn's Golden Apples",
    subtitle: 'Sacred orchard fruit of eternal youth',
    silverEach: 85,
    accent: 'text-yellow-300 border-yellow-500/30 bg-yellow-950/20',
  },
  {
    key: 'runestones',
    label: 'Ancient Mini Runestones',
    subtitle: 'Carved violet pebbles humming with magic',
    silverEach: 70,
    accent: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
  },
  {
    key: 'driftwood',
    label: 'Elder Birch Driftwood',
    subtitle: 'Smooth timber for campfire carving',
    silverEach: 38,
    accent: 'text-amber-300 border-amber-600/30 bg-amber-950/20',
  },
];

export const YoungVikingRealmModal: React.FC<YoungVikingRealmModalProps> = ({
  isOpen,
  onClose,
  isInMeadowRealm,
  isYoungVikingMode,
  isAutoWandering,
  satchel,
  totalItemsGathered,
  nodes,
  onEnterMeadowRealm,
  onReturnToKatfjord,
  onToggleYoungVikingMode,
  onToggleAutoWander,
  onGatherNearestItem,
  onTeleportToItem,
  onTradeAllSatchel,
  onCraftRecipe,
}) => {
  if (!isOpen) return null;

  const currentBagCount = (Object.values(satchel) as number[]).reduce((a, b) => a + b, 0);
  const totalSatchelSilverValue = SATCHEL_META.reduce(
    (sum, item) => sum + (satchel[item.key] || 0) * item.silverEach,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-950 border border-emerald-500/30 text-neutral-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-amber-950/40">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-400">
              <TreePine className="w-4 h-4" />
              <span>PEACEFUL FORAGING SANCTUARY REALM</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300">
                {isInMeadowRealm ? "Inside Idunn's Golden Meadow (X: 135, Z: -135)" : 'Ready to Enter'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Cinzel',serif] mt-0.5">
              Young Viking Wanderer &amp; Forager Realm
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
            title="Close [Y]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Hero Action Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Idunn&apos;s Golden Meadow Sanctuary · Zero Hostile Enemies
              </div>
              <h3 className="text-lg font-bold text-white">
                Play as a Young Viking Apprentice Wandering &amp; Gathering Wild Treasures
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Step into a sunlit Nordic meadow filled with wild fjord berries, glowing moon-mushrooms,
                golden honeycombs, Baltic sea amber, and sacred golden apples. Walk near items to
                gather them into your woven basket—or turn on{' '}
                <span className="text-emerald-300 font-semibold">Auto-Wander &amp; Gather [G]</span> to watch
                your Young Viking peacefully roam from bush to crystal patch on his own!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {!isInMeadowRealm ? (
                <button
                  onClick={() => {
                    onEnterMeadowRealm(true);
                    onClose();
                  }}
                  className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  Enter Meadow &amp; Auto-Wander
                </button>
              ) : (
                <button
                  onClick={() => {
                    onToggleAutoWander();
                  }}
                  className={`px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer ${
                    isAutoWandering
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  {isAutoWandering ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Auto-Wandering Active [G]
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Auto-Wander &amp; Gather [G]
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  onEnterMeadowRealm(false);
                  onClose();
                }}
                className="px-3.5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                Teleport to Meadow (Manual Walk)
              </button>

              {isInMeadowRealm && (
                <button
                  onClick={() => {
                    onReturnToKatfjord();
                    onClose();
                  }}
                  className="px-3.5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-semibold transition cursor-pointer"
                >
                  Return to Katfjord Village
                </button>
              )}
            </div>
          </div>

          {/* Status & Mode Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-neutral-400">Avatar Form</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {isYoungVikingMode ? '🧒 Young Viking Apprentice' : '🧔 Adult Viking Warrior'}
                </div>
              </div>
              <button
                onClick={onToggleYoungVikingMode}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
              >
                Switch
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-neutral-400">Wandering Mode</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {isAutoWandering ? 'Roaming & Gathering' : 'Manual WASD Control'}
                </div>
              </div>
              <button
                onClick={onToggleAutoWander}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
              >
                Toggle [G]
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
              <div className="text-[11px] text-neutral-400">Items in Woven Basket</div>
              <div className="text-lg font-bold text-amber-300 mt-0.5">
                {currentBagCount} Items{' '}
                <span className="text-xs font-normal text-neutral-400">
                  ({totalItemsGathered} lifetime)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-neutral-400">Basket Trade Value</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  +{totalSatchelSilverValue} Silver
                </div>
              </div>
              <button
                onClick={onTradeAllSatchel}
                disabled={currentBagCount === 0}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                  currentBagCount > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                Sell Basket
              </button>
            </div>
          </div>

          {/* Woven Forager's Satchel Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Young Viking&apos;s Woven Forager Satchel
              </h3>
              <button
                onClick={onGatherNearestItem}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Gather Nearest Item Now [E]
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SATCHEL_META.map((item) => {
                const count = satchel[item.key] || 0;
                return (
                  <div
                    key={item.key}
                    className={`p-3.5 rounded-xl border ${item.accent} flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-white">{item.label}</span>
                        <span className="text-base font-extrabold px-2 py-0.5 rounded bg-black/40 text-white">
                          ×{count}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-1">{item.subtitle}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-300">
                      <span>Value: +{item.silverEach} Silver</span>
                      <span className="font-semibold text-amber-300">
                        Total: +{count * item.silverEach}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meadow Campfire Herbalist Crafting */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Meadow Homestead Campfire Recipes
              </h3>
              <span className="text-xs text-neutral-400">
                Craft warm Nordic treats from your gathered berries, herbs &amp; honey
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Recipe 1 */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-rose-300">🍓 Sweet Fjord Berry Tea</div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Requires: 2 Wild Berries + 1 Healing Herb
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold mt-1.5">
                    Reward: Full HP Heal · +180 Silver · +80 XP
                  </div>
                </div>
                <button
                  onClick={() => onCraftRecipe('berry_tea')}
                  disabled={satchel.berries < 2 || satchel.herbs < 1}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                    satchel.berries >= 2 && satchel.herbs >= 1
                      ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Brew at Campfire
                </button>
              </div>

              {/* Recipe 2 */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-sky-300">🍄 Moon-Mushroom Honey Elixir</div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Requires: 2 Moon-Mushrooms + 1 Honeycomb
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold mt-1.5">
                    Reward: +260 Silver · +120 XP · +50 Valor
                  </div>
                </div>
                <button
                  onClick={() => onCraftRecipe('mushroom_brew')}
                  disabled={satchel.mushrooms < 2 || satchel.honeycomb < 1}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                    satchel.mushrooms >= 2 && satchel.honeycomb >= 1
                      ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Brew at Campfire
                </button>
              </div>

              {/* Recipe 3 */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-amber-300">🍎 Idunn&apos;s Golden Apple Feast</div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Requires: 1 Golden Apple + 1 Baltic Amber
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold mt-1.5">
                    Reward: +420 Silver · +200 XP · +100 Valor
                  </div>
                </div>
                <button
                  onClick={() => onCraftRecipe('golden_feast')}
                  disabled={satchel.golden_apples < 1 || satchel.amber < 1}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                    satchel.golden_apples >= 1 && satchel.amber >= 1
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Prepare Feast
                </button>
              </div>
            </div>
          </div>

          {/* Live 3D Meadow Resource Nodes List */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Live Meadow Gathering Spots (16 Wild Nodes + 2 Companion Young Vikings)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{node.name}</div>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                      <span
                        className={
                          node.isAvailable ? 'text-emerald-400 font-semibold' : 'text-amber-400'
                        }
                      >
                        {node.isAvailable ? '● Ready' : '○ Regrowing'}
                      </span>
                      <span>·</span>
                      <span>+{node.silverReward} Silver</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onTeleportToItem(node.x, node.z, node.name);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-emerald-600 hover:text-slate-950 text-emerald-300 text-[11px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
                  >
                    Go
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
