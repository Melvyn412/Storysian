import React, { useState } from 'react';
import {
  X,
  Fish,
  Flame,
  Coins,
  Trophy,
  Sparkles,
  Waves,
  Anchor,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ShoppingBag,
  Zap,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { FishingState, CaughtFishRecord } from '../types';
import { NORSE_FISH_SPECIES } from '../game/robloxFeaturesConfig';

interface FishingMiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  fishingState: FishingState;
  caughtLog: CaughtFishRecord[];
  onCastLine: (lure?: 'standard' | 'speed' | 'rare') => void;
  onTeleportToPier: () => void;
  onHookBite: () => void;
  onReelPull: () => void;
  onReleaseTension: () => void;
  onReset: () => void;
  onCookFish: (record: CaughtFishRecord) => void;
  onSellFish: (record: CaughtFishRecord) => void;
  onCookAllFish?: () => void;
  onSellAllFish?: () => void;
  isNearWater?: boolean;
}

export const FishingMiniGameModal: React.FC<FishingMiniGameModalProps> = ({
  isOpen,
  onClose,
  fishingState,
  caughtLog,
  onCastLine,
  onTeleportToPier,
  onHookBite,
  onReelPull,
  onReleaseTension,
  onReset,
  onCookFish,
  onSellFish,
  onCookAllFish,
  onSellAllFish,
  isNearWater = true,
}) => {
  const [activeTab, setActiveTab] = useState<'fishing' | 'creel' | 'bestiary' | 'guide'>('fishing');
  const [selectedLure, setSelectedLure] = useState<'standard' | 'speed' | 'rare'>('standard');

  if (!isOpen) return null;

  const { status, tension, reelProgress, targetFish, targetFishWeight } = fishingState;
  const isSweetSpot = tension >= 35 && tension <= 75;
  const isHighTension = tension > 80;

  // Bestiary counts
  const speciesCounts: Record<string, number> = {};
  caughtLog.forEach((item) => {
    speciesCounts[item.species.id] = (speciesCounts[item.species.id] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 select-none font-sans">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-sky-500/50 rounded-2xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-gradient-to-r from-sky-950/70 via-neutral-900 to-sky-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <Fish className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-['Cinzel',serif] tracking-wide">
                  Katfjord Fjord Fishing
                </h3>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    status === 'bite'
                      ? 'bg-red-500 text-white border-red-300 animate-bounce'
                      : status === 'reeling'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                      : status === 'caught'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                      : status === 'waiting'
                      ? 'bg-sky-500/30 text-sky-300 border-sky-400/50'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                  }`}
                >
                  {status === 'idle' && 'Ready to Fish'}
                  {status === 'casting' && 'Casting...'}
                  {status === 'waiting' && 'Float in Water'}
                  {status === 'bite' && '⚡ BITE! STRIKE!'}
                  {status === 'reeling' && 'Reeling in Fish!'}
                  {status === 'caught' && 'Catch Landed!'}
                </span>
              </div>
              <p className="text-[11px] text-sky-300">
                Hook, Reel &amp; Cook Legendary Nordic Catches from the Icy Midgard Waters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
            title="Close Fishing Window [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800/80 bg-neutral-900/60 px-5 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('fishing')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'fishing'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Active Fishing</span>
            {(status === 'bite' || status === 'reeling') && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('creel')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'creel'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Fish Creel ({caughtLog.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bestiary')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'bestiary'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Norse Bestiary (6)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'guide'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: ACTIVE FISHING */}
          {activeTab === 'fishing' && (
            <div className="space-y-4">
              {/* STATUS 1: IDLE / READY TO CAST */}
              {status === 'idle' && (
                <div className="space-y-4">
                  {/* Fjord Water Stage Illustration */}
                  <div className="relative rounded-2xl overflow-hidden border border-sky-500/40 bg-gradient-to-b from-sky-950 via-slate-900 to-sky-950 p-6 text-center space-y-3 shadow-inner">
                    <div className="flex justify-center items-center gap-3">
                      <span className="text-4xl animate-bounce">🎣</span>
                      <Waves className="w-8 h-8 text-sky-400 animate-pulse" />
                      <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>
                        🐟
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white font-['Cinzel',serif]">
                        Midgard Fjord Waters
                      </h4>
                      <p className="text-xs text-sky-200 max-w-md mx-auto">
                        Cast your line into the icy fjord from the Katfjord docks to catch Golden Salmon,
                        Ancient Runic Trout, and the mythical Baby Kraken!
                      </p>
                    </div>

                    {/* Lure Selector */}
                    <div className="pt-2">
                      <div className="text-[11px] font-bold text-sky-300 mb-2 uppercase tracking-wider">
                        Choose Your Norse Bait &amp; Lure:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                        <button
                          type="button"
                          onClick={() => setSelectedLure('standard')}
                          className={`p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                            selectedLure === 'standard'
                              ? 'bg-sky-900/80 border-sky-400 text-white shadow-md ring-1 ring-sky-300'
                              : 'bg-neutral-900/80 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1">
                            <span>🪱 Earthworm Bait</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Balanced bite chance for Salmon, Char &amp; Bass.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedLure('speed')}
                          className={`p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                            selectedLure === 'speed'
                              ? 'bg-amber-950/80 border-amber-400 text-white shadow-md ring-1 ring-amber-300'
                              : 'bg-neutral-900/80 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1 text-amber-300">
                            <span>⚡ Silver Herring</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Rapid-strike lure: -50% wait time for hungry fish!
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedLure('rare')}
                          className={`p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                            selectedLure === 'rare'
                              ? 'bg-purple-950/80 border-purple-400 text-white shadow-md ring-1 ring-purple-300'
                              : 'bg-neutral-900/80 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1 text-purple-300">
                            <span>✨ Runic Glow Lure</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Attracts Legendary Runic Trout &amp; Baby Kraken!
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => onCastLine(selectedLure)}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(56,189,248,0.4)] active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Fish className="w-5 h-5" />
                        <span>Cast Line into Katfjord</span>
                      </button>

                      <button
                        onClick={onTeleportToPier}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        title="Fast-travel character right onto the scenic Katfjord Fishing Pier"
                      >
                        <Anchor className="w-4 h-4 text-amber-400" />
                        <span>Warp to Fishing Pier</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Guide Card */}
                  <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      How Fishing Works in 4 Steps:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                      <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800">
                        <span className="font-bold text-sky-300">1. Cast Line:</span> Hit Cast Line or press{' '}
                        <kbd className="px-1 py-0.5 bg-neutral-800 rounded font-mono text-[10px]">E</kbd> near
                        water with rod in hand.
                      </div>
                      <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800">
                        <span className="font-bold text-sky-300">2. Watch Float:</span> The red bobber floats on
                        the waves. Wait 2-5 seconds for a bite.
                      </div>
                      <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800">
                        <span className="font-bold text-amber-300">3. Strike:</span> When the bobber dives and
                        horn sounds, tap <span className="text-red-400 font-bold">STRIKE [SPACE]</span>!
                      </div>
                      <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800">
                        <span className="font-bold text-emerald-300">4. Reeling Tug-of-War:</span> Reel in while
                        keeping tension in the green sweet spot (35-75%)!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS 2: CASTING */}
              {status === 'casting' && (
                <div className="p-8 rounded-2xl bg-sky-950/40 border border-sky-500/40 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center mx-auto animate-pulse">
                    <Waves className="w-8 h-8 text-sky-400 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Casting Line Outward...</h4>
                    <p className="text-xs text-sky-300">
                      Line flying across the Katfjord waters! Bobber landing in deep waters.
                    </p>
                  </div>
                </div>
              )}

              {/* STATUS 3: WAITING FOR BITE */}
              {status === 'waiting' && (
                <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-950/50 to-neutral-900 border border-sky-500/40 text-center space-y-4">
                  {/* Floating Bobber Animation */}
                  <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-sky-400/40 animate-ping" />
                    <div
                      className="absolute inset-3 rounded-full border border-sky-300/30 animate-ping"
                      style={{ animationDelay: '0.4s' }}
                    />
                    <div className="w-14 h-14 rounded-full bg-gradient-to-b from-red-500 to-white shadow-xl flex items-center justify-center border border-white animate-bounce">
                      <div className="w-2 h-5 bg-amber-400 rounded-full -mt-4 shadow" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      Line in Water · Watching the Float
                    </h4>
                    <p className="text-xs text-sky-300 mt-1">
                      Fish are circling your bait in the deep currents. Be ready to strike when the bobber dips!
                    </p>
                  </div>

                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={onReset}
                      className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reel In Early / Cancel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STATUS 4: BITE! STRIKE ACTION */}
              {status === 'bite' && (
                <div className="p-6 rounded-2xl bg-gradient-to-b from-red-950/80 via-amber-950/70 to-neutral-900 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.6)] text-center space-y-4 animate-pulse">
                  <div className="space-y-1">
                    <div className="text-2xl font-black text-amber-300 tracking-wider">
                      ⚡ FISH BITE DETECTED!
                    </div>
                    <p className="text-xs text-amber-200">
                      The bobber submerged! Strike immediately before the fish shakes loose!
                    </p>
                  </div>

                  {/* Massive Strike Button */}
                  <button
                    onClick={onHookBite}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 text-neutral-950 font-black text-lg uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.8)] active:scale-95 transition cursor-pointer flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-7 h-7 text-neutral-950 animate-spin" />
                    <span>HOOK FISH / STRIKE! [SPACE]</span>
                  </button>

                  <div className="text-[11px] text-amber-300 font-mono">
                    Window: 3.5 seconds reaction time
                  </div>
                </div>
              )}

              {/* STATUS 5: ACTIVE REELING TUG-OF-WAR */}
              {status === 'reeling' && (
                <div className="p-5 rounded-2xl bg-sky-950/40 border border-sky-500/50 space-y-4">
                  <div className="flex items-center justify-between border-b border-sky-900/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl animate-spin">🎣</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">Fish on the Hook! Tug of War</h4>
                        <p className="text-[11px] text-sky-300">
                          Keep tension in the green sweet spot (35-75%) while reeling!
                        </p>
                      </div>
                    </div>
                    {targetFish && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/40 font-bold">
                        {targetFish.name}
                      </span>
                    )}
                  </div>

                  {/* Reel Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-neutral-300">Distance to Landing Net</span>
                      <span className="text-sky-300 font-mono font-bold">{Math.round(reelProgress)}%</span>
                    </div>
                    <div className="w-full h-4 bg-neutral-900 rounded-full overflow-hidden border border-neutral-700">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 transition-all duration-75"
                        style={{ width: `${reelProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Tension Meter with Safe Sweet Spot */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-neutral-300 flex items-center gap-1.5">
                        Line Tension
                        {isHighTension ? (
                          <span className="text-red-400 font-bold animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            DANGER: LINE SNAPPING!
                          </span>
                        ) : isSweetSpot ? (
                          <span className="text-emerald-400 font-bold">OPTIMAL SWEET SPOT</span>
                        ) : (
                          <span className="text-amber-400">SLACK: REEL HARDER</span>
                        )}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          isHighTension
                            ? 'text-red-400 font-black animate-pulse'
                            : isSweetSpot
                            ? 'text-emerald-400'
                            : 'text-amber-300'
                        }`}
                      >
                        {Math.round(tension)}%
                      </span>
                    </div>

                    <div className="relative w-full h-4 bg-neutral-900 rounded-full overflow-hidden border border-neutral-700">
                      {/* Sweet Spot 35% - 75% Visual Marker */}
                      <div className="absolute left-[35%] w-[40%] h-full bg-emerald-500/30 border-x border-emerald-400/50 pointer-events-none" />
                      <div
                        className={`h-full transition-all duration-75 ${
                          isHighTension
                            ? 'bg-red-500 shadow-[0_0_15px_red]'
                            : isSweetSpot
                            ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${tension}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-neutral-400 pt-1">
                      <span>0% Slack</span>
                      <span className="text-emerald-400 font-bold">35%-75% Sweet Spot (2x Reel Speed)</span>
                      <span className="text-red-400 font-bold">100% Snap</span>
                    </div>
                  </div>

                  {/* Reeling Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={onReelPull}
                      className="col-span-2 py-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-400 hover:to-blue-500 active:scale-95 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      <span>HOLD / TAP TO REEL!</span>
                    </button>

                    <button
                      onClick={onReleaseTension}
                      className="py-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 border border-neutral-700 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
                      title="Release tension if meter is red"
                    >
                      <span>RELEASE SLACK</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STATUS 6: CAUGHT CELEBRATION */}
              {status === 'caught' && targetFish && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-neutral-900 to-neutral-900 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] text-center space-y-4">
                  <div className="inline-block p-4 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-5xl animate-bounce">
                    {targetFish.icon}
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <h4 className="text-xl font-bold text-white font-['Cinzel',serif]">
                        {targetFish.name}
                      </h4>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          targetFish.rarity === 'mythic'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : targetFish.rarity === 'legendary'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : targetFish.rarity === 'epic'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {targetFish.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1 italic">{targetFish.description}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-md mx-auto text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
                      <span className="block text-[10px] text-neutral-400">Specimen Weight</span>
                      <span className="font-bold font-mono text-amber-300 text-sm">
                        {targetFishWeight} kg
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
                      <span className="block text-[10px] text-neutral-400">Market Value</span>
                      <span className="font-bold font-mono text-emerald-300 text-sm">
                        +{targetFish.silverValue} Silver
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 col-span-2 sm:col-span-1">
                      <span className="block text-[10px] text-neutral-400">Feast Energy</span>
                      <span className="font-bold font-mono text-sky-300 text-sm">
                        +{targetFish.staminaBoost} Stamina
                      </span>
                    </div>
                  </div>

                  {/* Actions for this Catch */}
                  <div className="pt-2 flex flex-wrap justify-center gap-2.5">
                    <button
                      onClick={() =>
                        onCookFish({
                          species: targetFish,
                          weight: targetFishWeight,
                          caughtAt: 'Just now',
                        })
                      }
                      className="px-4 py-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Smoke &amp; Feast (+35 HP)</span>
                    </button>

                    <button
                      onClick={() =>
                        onSellFish({
                          species: targetFish,
                          weight: targetFishWeight,
                          caughtAt: 'Just now',
                        })
                      }
                      className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <span>Sell to Merchant (+Silver &amp; Valor)</span>
                    </button>

                    <button
                      onClick={() => onCastLine(selectedLure)}
                      className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Fish className="w-4 h-4" />
                      <span>Cast Again</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FISH CREEL & HEARTH */}
          {activeTab === 'creel' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-sky-400" />
                    <span>Caught Fish Creel ({caughtLog.length})</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Smoke fish at the hearth for healing or sell to merchants for Silver &amp; Valor.
                  </p>
                </div>

                {caughtLog.length > 0 && (
                  <div className="flex gap-2">
                    {onCookAllFish && (
                      <button
                        onClick={onCookAllFish}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                      >
                        Smoke All
                      </button>
                    )}
                    {onSellAllFish && (
                      <button
                        onClick={onSellAllFish}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
                      >
                        Sell All
                      </button>
                    )}
                  </div>
                )}
              </div>

              {caughtLog.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-3">
                  <span className="text-4xl">🐟</span>
                  <div className="text-sm font-bold text-neutral-300">Your Fish Creel is Empty</div>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Head over to the Katfjord pier, choose your bait, and cast your line to start stocking
                    your Nordic pantry!
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('fishing');
                      onCastLine(selectedLure);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Start Fishing Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {caughtLog.map((c, i) => (
                    <div
                      key={`${c.species.id}_${i}`}
                      className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-3 text-xs hover:border-neutral-700 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{c.species.icon}</span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{c.species.name}</span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              ({c.weight} kg)
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            +{c.species.staminaBoost} Stamina · {c.caughtAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onCookFish(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          title="Cook and Eat for +35 HP"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Smoke</span>
                        </button>

                        <button
                          onClick={() => onSellFish(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          title="Sell to Merchant"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>+{c.species.silverValue}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NORSE BESTIARY */}
          {activeTab === 'bestiary' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>The Katfjord Fish Bestiary</span>
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Six unique aquatic species populate the icy fjords, glacial rivers, and deep seas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {NORSE_FISH_SPECIES.map((species) => {
                  const caughtCount = speciesCounts[species.id] || 0;
                  const isDiscovered = caughtCount > 0;

                  return (
                    <div
                      key={species.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition ${
                        isDiscovered
                          ? 'bg-neutral-900/90 border-neutral-700'
                          : 'bg-neutral-950/60 border-neutral-800/80 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{species.icon}</span>
                          <div>
                            <div className="font-bold text-xs text-white flex items-center gap-1.5">
                              <span>{species.name}</span>
                              {isDiscovered && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                                species.rarity === 'mythic'
                                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                  : species.rarity === 'legendary'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : species.rarity === 'epic'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              {species.rarity}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-neutral-400 font-bold">
                          {caughtCount} Caught
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400">{species.description}</p>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-800">
                        <span>
                          Weight: {species.minWeight} - {species.maxWeight} kg
                        </span>
                        <span className="text-amber-400 font-bold">+{species.silverValue} Silver</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: HOW TO PLAY GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-3.5 text-xs text-neutral-300">
              <div className="border-b border-neutral-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-400" />
                  <span>Mastering Katfjord Fishing</span>
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Step-by-step instructions on gear, bait, ballistics, and reeling physics.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <h5 className="font-bold text-sky-300 flex items-center gap-1">
                  <span>1. Getting to Water &amp; Casting</span>
                </h5>
                <p>
                  You can fish anywhere near the Katfjord waters (the Docks, the Coastal Ocean, or the River).
                  Press the <strong className="text-amber-300">"Warp to Pier"</strong> button in this modal to
                  instantly travel to the best fishing spot right next to the longship.
                </p>
                <p>
                  Equip your <strong className="text-sky-300">Fishing Rod (Hotbar Slot 7)</strong> and press{' '}
                  <kbd className="px-1 py-0.5 bg-neutral-800 rounded font-mono text-[10px]">K</kbd> or click{' '}
                  <strong className="text-sky-300">"Cast Line"</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <h5 className="font-bold text-amber-300 flex items-center gap-1">
                  <span>2. Detecting Bites &amp; Striking</span>
                </h5>
                <p>
                  Once the bobber is in the water, watch it bob with the dynamic ocean waves. A bite will occur
                  in 2 to 5 seconds.
                </p>
                <p>
                  When you see the water splash and hear the Norse horn, hit{' '}
                  <kbd className="px-1 py-0.5 bg-neutral-800 rounded font-mono text-[10px]">Space</kbd> or tap the
                  large <strong className="text-red-400">STRIKE!</strong> button within 3.5 seconds.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <h5 className="font-bold text-emerald-300 flex items-center gap-1">
                  <span>3. Reeling &amp; Line Tension</span>
                </h5>
                <p>
                  During the reeling phase, the fish will fight back! Hold or tap{' '}
                  <strong className="text-sky-300">REEL IN</strong> to draw the fish closer (0% to 100%).
                </p>
                <p>
                  Keep tension in the <strong className="text-emerald-400">Green Sweet Spot (35-75%)</strong> for
                  maximum speed. If tension reaches 80-100%, hit{' '}
                  <strong className="text-neutral-300">Release Slack</strong> to avoid snapping the line!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <h5 className="font-bold text-purple-300 flex items-center gap-1">
                  <span>4. Hearth Cooking &amp; Trading</span>
                </h5>
                <p>
                  Cooked fish restores up to <strong className="text-emerald-400">+35 HP</strong> and gives
                  full instant stamina recharge. Selling fish grants bonus Silver and Clan Valor!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
