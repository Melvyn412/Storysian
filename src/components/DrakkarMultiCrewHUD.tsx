import React, { useState, useEffect, useRef } from 'react';
import {
  Ship,
  Users,
  Compass,
  Zap,
  Target,
  Volume2,
  X,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { CrewStation, MultiCrewDrakkarState } from '../types';
import { sound } from '../audio/soundEngine';

interface DrakkarMultiCrewHUDProps {
  isSailing: boolean;
  multiCrewState: MultiCrewDrakkarState;
  onUpdateCrewStation: (station: CrewStation) => void;
  onRowerStroke: (precision: 'perfect' | 'good' | 'miss') => void;
  onDrumBeat: () => void;
  onGunnerFire: () => void;
  onAutoFillCrew: () => void;
  onClose: () => void;
}

export const DrakkarMultiCrewHUD: React.FC<DrakkarMultiCrewHUDProps> = ({
  isSailing,
  multiCrewState,
  onUpdateCrewStation,
  onRowerStroke,
  onDrumBeat,
  onGunnerFire,
  onAutoFillCrew,
  onClose,
}) => {
  const [activeStation, setActiveStation] = useState<CrewStation>('helmsman');
  const [beatPhase, setBeatPhase] = useState<number>(0);
  const [recentHitFeedback, setRecentHitFeedback] = useState<string | null>(null);

  // Cadence beat loop (every 1.2 seconds = 50 BPM Viking rowing drum cadence)
  useEffect(() => {
    let animationFrameId: number;
    let startTime = performance.now();

    const loop = (currentTime: number) => {
      const elapsed = (currentTime - startTime) % 1200;
      setBeatPhase(elapsed / 1200); // 0.0 to 1.0
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Keyboard shortcut listener for rowing stroke
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && isSailing) {
        if (activeStation === 'port_rower' || activeStation === 'starboard_rower') {
          handleStrokeAttempt();
        } else if (activeStation === 'war_drummer') {
          sound.playWarHorn();
          onDrumBeat();
          setRecentHitFeedback('🥁 WAR DRUM! +Crew Morale');
          setTimeout(() => setRecentHitFeedback(null), 800);
        } else if (activeStation === 'ballista_gunner') {
          onGunnerFire();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStation, beatPhase, isSailing]);

  const handleStrokeAttempt = () => {
    // Perfect window is between 0.85 and 1.0 or 0.0 and 0.15 (near the drum hit beat at 1.0 / 0.0)
    const distFromBeat = Math.min(beatPhase, 1.0 - beatPhase);
    if (distFromBeat < 0.10) {
      sound.playSwordHit();
      onRowerStroke('perfect');
      setRecentHitFeedback('⚡ PERFECT STROKE! +Cadence');
    } else if (distFromBeat < 0.22) {
      sound.playWoodHit();
      onRowerStroke('good');
      setRecentHitFeedback('✨ GOOD CADENCE!');
    } else {
      onRowerStroke('miss');
      setRecentHitFeedback('❌ OFF-BEAT');
    }

    setTimeout(() => setRecentHitFeedback(null), 700);
  };

  if (!isSailing) return null;

  const currentStationData = multiCrewState.activeCrew[activeStation];

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-3 select-none font-sans pointer-events-auto animate-fade-in">
      <div className="bg-neutral-950/90 backdrop-blur-md border-2 border-amber-500/60 rounded-2xl shadow-2xl p-4 text-white overflow-hidden relative">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-['Cinzel',serif] text-amber-300 flex items-center gap-1.5">
                Drakkar Multi-Crew Warship
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {multiCrewState.rowingSpeedMultiplier.toFixed(1)}x Speed Boost
                </span>
              </div>
              <div className="text-[10px] text-neutral-400">
                Cadence Combo: <span className="text-amber-400 font-bold">{multiCrewState.cadenceCombo}x</span> · 
                War Drum Morale: <span className={multiCrewState.drumBuffActive ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>{multiCrewState.drumBuffActive ? 'ACTIVE (+30%)' : 'IDLE'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAutoFillCrew}
              className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition border border-neutral-700"
              title="Summon Clan Astrid, Floki & Torstein to fill empty rowing benches"
            >
              <Users className="w-3 h-3 text-sky-400" />
              Summon Clan Crew
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Station Selector Bar */}
        <div className="grid grid-cols-5 gap-1.5 mb-3 text-center text-[10px] font-bold">
          {(
            [
              { id: 'helmsman', label: 'Helmsman', icon: Compass },
              { id: 'port_rower', label: 'Port Oar', icon: Zap },
              { id: 'starboard_rower', label: 'Starb. Oar', icon: Zap },
              { id: 'ballista_gunner', label: 'Gunner', icon: Target },
              { id: 'war_drummer', label: 'War Drum', icon: Volume2 },
            ] as const
          ).map((st) => {
            const isCurrent = activeStation === st.id;
            const Icon = st.icon;
            const crewMate = multiCrewState.activeCrew[st.id]?.assignedTo || 'Unmanned';
            return (
              <button
                key={st.id}
                onClick={() => {
                  setActiveStation(st.id);
                  onUpdateCrewStation(st.id);
                  sound.playButtonClick();
                }}
                className={`p-2 rounded-xl border transition flex flex-col items-center gap-1 cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate w-full">{st.label}</span>
                <span className="text-[8px] text-neutral-400 font-normal truncate max-w-full">
                  {crewMate === 'player' ? 'YOU' : crewMate}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Station Interactive Controls */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-4">
          {/* Station 1: Helmsman */}
          {activeStation === 'helmsman' && (
            <div className="w-full flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
                <div>
                  <div className="font-bold text-white">Station: Master Helmsman</div>
                  <div className="text-[10px] text-neutral-400">
                    Use <kbd className="px-1 bg-neutral-800 rounded text-amber-300 font-mono">W A S D</kbd> to steer the Drakkar through currents
                  </div>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-emerald-400">
                Crew Synchronization: 100%
              </div>
            </div>
          )}

          {/* Station 2 & 3: Rower Stations (Rhythm Rowing Mini-Game) */}
          {(activeStation === 'port_rower' || activeStation === 'starboard_rower') && (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Rhythmic Beat Pulse Indicator */}
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <div
                    className="absolute inset-0 rounded-full border-2 border-amber-500/40 transition-transform duration-75"
                    style={{
                      transform: `scale(${0.6 + beatPhase * 0.8})`,
                      opacity: 1.0 - beatPhase * 0.7,
                    }}
                  />
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xs font-bold text-amber-300">
                    🥁
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Oar Cadence Rhythm
                    {recentHitFeedback && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold animate-pulse">
                        {recentHitFeedback}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Hit on the drum beat ring for +2.5x Maximum Ship Speed!
                  </div>
                </div>
              </div>

              <button
                onClick={handleStrokeAttempt}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                STROKE OAR [SPACE]
              </button>
            </div>
          )}

          {/* Station 4: Ballista Gunner */}
          {activeStation === 'ballista_gunner' && (
            <div className="w-full flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-400" />
                <div>
                  <div className="font-bold text-white">Station: Frost Ballista Gunner</div>
                  <div className="text-[10px] text-neutral-400">
                    Aimed at enemy ships &amp; Saxon fortress gates
                  </div>
                </div>
              </div>
              <button
                onClick={onGunnerFire}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" />
                FIRE HARPOON [SPACE]
              </button>
            </div>
          )}

          {/* Station 5: War Drummer / Skald */}
          {activeStation === 'war_drummer' && (
            <div className="w-full flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-amber-400 animate-bounce-once" />
                <div>
                  <div className="font-bold text-white">Station: Skald War Drummer</div>
                  <div className="text-[10px] text-neutral-400">
                    Strike the war drums to inspire rowers and grant stamina regen
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playWarHorn();
                  onDrumBeat();
                  setRecentHitFeedback('🥁 WAR DRUM! +Morale');
                  setTimeout(() => setRecentHitFeedback(null), 800);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                🥁 BEAT DRUM [SPACE]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
