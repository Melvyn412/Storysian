import React, { useState, useEffect } from 'react';
import {
  Ship,
  Wind,
  Compass,
  Shield,
  Crosshair,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Footprints,
  Play,
  Navigation,
  Eye,
  Waves,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { WindSailingStats } from '../types';

interface DrakkarOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardDrakkar: () => void;
  onOpenArmory: () => void;
  onTrackPierWaypoint: () => void;
  onCameraAngleChange?: (step: number) => void;
  windStats?: WindSailingStats | null;
}

export const DrakkarOnboardingModal: React.FC<DrakkarOnboardingModalProps> = ({
  isOpen,
  onClose,
  onBoardDrakkar,
  onOpenArmory,
  onTrackPierWaypoint,
  onCameraAngleChange,
  windStats,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // When step changes, notify parent to smoothly reposition 3D cinematic camera
  useEffect(() => {
    if (isOpen) {
      onCameraAngleChange?.(currentStep);
    }
  }, [currentStep, isOpen, onCameraAngleChange]);

  // Initial trigger sound
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      sound.playWaveSplash();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      sound.playWhoosh();
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      sound.playWhoosh();
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleBoard = () => {
    sound.playWarHorn();
    onBoardDrakkar();
    onClose();
  };

  const handleOpenArmory = () => {
    sound.playFanfare();
    onOpenArmory();
    onClose();
  };

  const handleTrackWaypoint = () => {
    sound.playVictoryTriumph();
    onTrackPierWaypoint();
    onClose();
  };

  const currentKnots = windStats?.windSpeedKnots || 18;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between pointer-events-none select-none">
      {/* Top Cinematic Letterbox Bar */}
      <div className="w-full bg-gradient-to-b from-black via-black/90 to-transparent pt-3 pb-8 px-4 sm:px-8 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Ship className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                KATFJORD ROYAL DOCKS · PIER (X:22, Z:85)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                FEATURE SHOWCASE
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-extrabold text-white font-['Cinzel',serif] tracking-wider drop-shadow-md">
              THE DRAKKAR WARSHIP
            </h1>
          </div>
        </div>

        {/* Step Indicator & Skip Button */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => {
                  sound.playWhoosh();
                  setCurrentStep(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'w-6 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                }`}
                title={`Jump to Step ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold transition cursor-pointer shadow"
            title="Skip Onboarding"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Cinematic Focus Target Crosshair Marker */}
      <div className="self-center flex flex-col items-center pointer-events-none opacity-80">
        <div className="w-16 h-16 rounded-full border border-amber-400/40 flex items-center justify-center animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24]" />
        </div>
        <div className="mt-2 px-2.5 py-0.5 rounded bg-black/75 border border-amber-500/40 text-[10px] font-mono text-amber-300 uppercase tracking-widest backdrop-blur-sm">
          {currentStep === 0 && 'Target: Longship Pier Berth'}
          {currentStep === 1 && 'Target: Square Canvas & Wind Rigging'}
          {currentStep === 2 && 'Target: Helm & Runic Ballistas'}
        </div>
      </div>

      {/* Bottom Interactive Content Card & Actions */}
      <div className="w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-4 sm:pb-6 px-4 sm:px-8 pointer-events-auto flex justify-center">
        <div className="w-full max-w-4xl bg-neutral-950/95 border-2 border-amber-500/70 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Decorative Corner Runes */}
          <div className="absolute top-2 right-2 text-amber-500/20 text-3xl font-serif select-none pointer-events-none">
            ᚱᚢᚾ
          </div>

          {/* STEP 1: WELCOME & THE PIER */}
          {currentStep === 0 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
                  STEP 1 OF 3 · VESSEL BERTH
                </span>
                <span className="text-xs text-neutral-400">Moored at Katfjord Pier</span>
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white font-['Cinzel',serif] tracking-wide">
                  HAIL, WARRIOR! YOUR DRAKKAR WARSHIP AWAITS
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  Moored at Katfjord Dock <strong className="text-amber-300">(X: 22, Z: 85)</strong>, this majestic
                  longship is carved from ancient Nordic pine and trimmed with iron clan shields. Board the helm to carve
                  the waters of the fjord or lay siege to foreign outposts!
                </p>
              </div>

              {/* Highlights Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-950 border border-red-700/60 text-red-400 shrink-0">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Carved Bow Figurehead</h3>
                    <p className="text-[11px] text-neutral-400">Intimidate sea monsters & rivals</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-950 border border-amber-700/60 text-amber-400 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Hull Gunwale Shields</h3>
                    <p className="text-[11px] text-neutral-400">28 reinforced round shields</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-950 border border-sky-700/60 text-sky-400 shrink-0">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Multi-Crew Deck Helm</h3>
                    <p className="text-[11px] text-neutral-400">Captain steering & ballista seats</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: WIND IN THE SAILS & BILLOWING PHYSICS */}
          {currentStep === 1 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono">
                  STEP 2 OF 3 · AERODYNAMICS & PHYSICS
                </span>
                <span className="text-xs text-neutral-400">Live WebGL Canvas Deformation</span>
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white font-['Cinzel',serif] tracking-wide">
                  REAL-TIME WIND &amp; DYNAMIC BILLOWING SAILS
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  The longship features realistic nautical aerodynamics! The yard arm automatically tacks to catch crosswinds,
                  and the square sail visibly billows in 3D WebGL. Align your ship with the breeze for massive speed bonuses:
                </p>
              </div>

              {/* Point of Sail Multipliers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 flex flex-col justify-between gap-1 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 font-mono">Running</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Downwind Gale</h3>
                  <div className="text-emerald-300 font-extrabold text-sm font-mono">+35% Speed</div>
                  <p className="text-[10px] text-neutral-400">Deep 3.5m billowing belly</p>
                </div>

                <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/60 flex flex-col justify-between gap-1 shadow-[0_0_12px_rgba(56,189,248,0.15)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-sky-400 font-mono">Broad Reach</span>
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Crosswind Breeze</h3>
                  <div className="text-sky-300 font-extrabold text-sm font-mono">+25% Speed</div>
                  <p className="text-[10px] text-neutral-400">Yard trims ~23° tack angle</p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/60 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400 font-mono">Close-Hauled</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Quartering Wind</h3>
                  <div className="text-amber-300 font-extrabold text-sm font-mono">-25% Speed</div>
                  <p className="text-[10px] text-neutral-400">Yard hauled tight ~36°</p>
                </div>

                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/60 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-red-400 font-mono">In Irons</span>
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Headwind Stall</h3>
                  <div className="text-red-300 font-extrabold text-sm font-mono">-65% Drag</div>
                  <p className="text-[10px] text-neutral-400">Sail deflates &amp; luffs violently</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: NAVAL ARMORY & COMBAT */}
          {currentStep === 2 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono">
                  STEP 3 OF 3 · ARMORY &amp; SEA COMBAT
                </span>
                <span className="text-xs text-neutral-400">Customization &amp; Ballistas</span>
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white font-['Cinzel',serif] tracking-wide">
                  NAVAL ARMORY &amp; JÖRMUNGANDR HUNT
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  Spend Silver earned from battles, fishing, and foraging in the new <strong className="text-amber-300">Naval Armory [H]</strong> to
                  customize your Drakkar! Fire dual <strong className="text-sky-300">Frost-Ballistas [R]</strong> at the 1,800 HP Jörmungandr Sea Serpent:
                </p>
              </div>

              {/* Combat & Customization Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-950 border border-amber-600/60 text-amber-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">7 Custom Sail Patterns</h3>
                    <p className="text-[11px] text-neutral-400">Odin's Raven, Lightning, Ice-Loom</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-950 border border-purple-600/60 text-purple-400 shrink-0">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">6 Sculpted Figureheads</h3>
                    <p className="text-[11px] text-neutral-400">Dragon, Fenrir, Ram, Valkyrie</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-950 border border-sky-600/60 text-sky-400 shrink-0">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Dual Frost-Ballistas [R]</h3>
                    <p className="text-[11px] text-neutral-400">Broadside harpoons dealing -95 DMG</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Navigation Bar */}
          <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            {/* Step navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                disabled={currentStep === 0}
                onClick={handlePrev}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  currentStep === 0
                    ? 'opacity-40 cursor-not-allowed bg-neutral-900 text-neutral-500'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentStep < totalSteps - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <span>Next Feature</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleOpenArmory}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Naval Armory</span>
                </button>
              )}
            </div>

            {/* Quick Interactive Launch Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTrackWaypoint}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
                title="Keep exploring and follow the golden light beacon to the pier"
              >
                <Footprints className="w-4 h-4 text-amber-400" />
                <span>Walk to Pier (Track Beacon)</span>
              </button>

              <button
                onClick={handleBoard}
                className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer ring-1 ring-amber-300/50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Board Drakkar Now (Warp to Helm)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
