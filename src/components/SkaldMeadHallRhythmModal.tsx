import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Music,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { NorseInstrumentType, SkaldSongTrack } from '../types';
import { sound } from '../audio/soundEngine';

interface SkaldMeadHallRhythmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongCompleted: (buffName: string, buffDesc: string) => void;
}

interface RuneNote {
  id: number;
  lane: number; // 0, 1, 2, 3 (D, F, J, K)
  targetTime: number; // in milliseconds from song start
  hit?: boolean;
}

const SONG_TRACKS: SkaldSongTrack[] = [
  {
    id: 'valkyrie_lament',
    title: 'Hymn of the Valkyries',
    subtitle: 'Norse Folk Tagelharpa & Bowed Strings',
    instrument: 'tagelharpa',
    bpm: 75,
    difficulty: 'Thrall (Easy)',
    durationSeconds: 25,
    buffDescription: '+30% Attack Speed & 0 Stamina Drain for 15 Min',
  },
  {
    id: 'siege_drums',
    title: "Thor's Thunder Siege Beats",
    subtitle: 'Bodhrán War Drums & Chanted Cadence',
    instrument: 'bodhran_drum',
    bpm: 90,
    difficulty: 'Drengr (Medium)',
    durationSeconds: 30,
    buffDescription: '+45 Melee Damage & +50% Ballista Velocity for 15 Min',
  },
  {
    id: 'heimdall_call',
    title: 'Gjallarhorn of the Bifrost',
    subtitle: 'Ancient Bronze Lur Horn Call',
    instrument: 'lur_horn',
    bpm: 110,
    difficulty: 'Berserker (Hard)',
    durationSeconds: 35,
    buffDescription: '+50% All Silver & Valor Bounty Drops for 20 Min',
  },
];

const LANE_KEYS = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
const LANE_LABELS = ['D', 'F', 'J', 'K'];
const LANE_RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ'];

export const SkaldMeadHallRhythmModal: React.FC<SkaldMeadHallRhythmModalProps> = ({
  isOpen,
  onClose,
  onSongCompleted,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<SkaldSongTrack>(SONG_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songProgress, setSongProgress] = useState(0); // 0 to 1
  const [notes, setNotes] = useState<RuneNote[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hitFeedback, setHitFeedback] = useState<string | null>(null);
  const [songFinished, setSongFinished] = useState(false);

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Generate note map for song
  const startSong = () => {
    sound.playWarHorn();
    const generatedNotes: RuneNote[] = [];
    const intervalMs = (60 / selectedTrack.bpm) * 1000;
    const totalBeats = Math.floor((selectedTrack.durationSeconds * 1000) / intervalMs);

    for (let i = 2; i < totalBeats; i++) {
      const lane = Math.floor(Math.random() * 4);
      generatedNotes.push({
        id: i,
        lane,
        targetTime: i * intervalMs,
      });
    }

    setNotes(generatedNotes);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setSongFinished(false);
    setIsPlaying(true);
    startTimeRef.current = performance.now();
  };

  // Main rhythm game loop
  useEffect(() => {
    if (!isPlaying) return;

    const loop = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(1.0, elapsed / (selectedTrack.durationSeconds * 1000));
      setSongProgress(progress);

      if (progress >= 1.0) {
        // Song finished!
        setIsPlaying(false);
        setSongFinished(true);
        sound.playVictoryTriumph();
        onSongCompleted(selectedTrack.title, selectedTrack.buffDescription);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, selectedTrack]);

  // Keyboard hit detector
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const laneIndex = LANE_KEYS.indexOf(e.code);
      if (laneIndex !== -1 && !e.repeat) {
        checkHitOnLane(laneIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, notes]);

  const checkHitOnLane = (lane: number) => {
    const elapsed = performance.now() - startTimeRef.current;
    // Find closest unhit note on this lane within +/- 300ms
    const note = notes.find(
      (n) => !n.hit && n.lane === lane && Math.abs(n.targetTime - elapsed) < 320
    );

    if (note) {
      const delta = Math.abs(note.targetTime - elapsed);
      note.hit = true;

      if (delta < 120) {
        sound.playFanfare();
        setHitFeedback('⚡ SKÁL! PERFECT (+100)');
        setScore((s) => s + 100 * (combo + 1));
        setCombo((c) => {
          const next = c + 1;
          setMaxCombo((m) => Math.max(m, next));
          return next;
        });
      } else {
        sound.playWoodHit();
        setHitFeedback('✨ GOOD (+50)');
        setScore((s) => s + 50);
        setCombo((c) => {
          const next = c + 1;
          setMaxCombo((m) => Math.max(m, next));
          return next;
        });
      }
    } else {
      sound.playPunch();
      setHitFeedback('❌ MISS');
      setCombo(0);
    }

    setTimeout(() => setHitFeedback(null), 600);
  };

  if (!isOpen) return null;

  const elapsedMs = isPlaying ? performance.now() - startTimeRef.current : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Cinzel',serif] flex items-center gap-2">
                Katfjord Mead Hall Skald Rhythm Stage
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Norse Folk Melodies
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Perform legendary ballads to inspire your clan with server-wide buffs!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsPlaying(false);
              onClose();
            }}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Song Selector */}
          {!isPlaying && !songFinished && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Select Skaldic Song to Perform:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SONG_TRACKS.map((trk) => {
                  const isSelected = selectedTrack.id === trk.id;
                  return (
                    <button
                      key={trk.id}
                      onClick={() => {
                        setSelectedTrack(trk);
                        sound.playButtonClick();
                      }}
                      className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50 shadow-lg'
                          : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white font-['Cinzel',serif]">{trk.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-amber-300 border border-neutral-700 font-mono">
                            {trk.bpm} BPM
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-400/80 mb-2">{trk.subtitle}</div>
                        <div className="text-[10px] text-neutral-400">{trk.buffDescription}</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] text-neutral-500 flex items-center justify-between">
                        <span>{trk.durationSeconds}s Duration</span>
                        <span className="text-amber-400 font-semibold">{trk.difficulty}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={startSong}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-sm flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 cursor-pointer transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  BEGIN SKALDIC RECITAL ({selectedTrack.title})
                </button>
              </div>
            </div>
          )}

          {/* RHYTHM PLAYING ARENA */}
          {isPlaying && (
            <div className="space-y-4">
              {/* Score & Combo HUD */}
              <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase">Performing</div>
                  <div className="font-bold text-amber-300">{selectedTrack.title}</div>
                </div>

                <div className="text-center">
                  <div className="text-[10px] text-neutral-400 uppercase">Combo Streak</div>
                  <div className="text-base font-black text-amber-400 font-mono animate-pulse">
                    {combo}x
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-neutral-400 uppercase">Skald Honor Score</div>
                  <div className="text-base font-black text-emerald-400 font-mono">{score}</div>
                </div>
              </div>

              {/* Rhythm Highway (4 Lanes: D, F, J, K) */}
              <div className="relative h-64 bg-neutral-900/90 rounded-2xl border-2 border-amber-500/40 overflow-hidden shadow-inner flex">
                {[0, 1, 2, 3].map((laneIdx) => {
                  return (
                    <div
                      key={laneIdx}
                      className="flex-1 border-r border-neutral-800 last:border-r-0 relative flex flex-col justify-between"
                    >
                      {/* Falling Rune Notes */}
                      {notes
                        .filter((n) => n.lane === laneIdx && !n.hit)
                        .map((note) => {
                          const timeUntilTarget = note.targetTime - elapsedMs;
                          // Notes appear 1500ms before hit target
                          if (timeUntilTarget < -300 || timeUntilTarget > 1500) return null;
                          const topPercent = Math.max(0, Math.min(90, ((1500 - timeUntilTarget) / 1500) * 85));

                          return (
                            <div
                              key={note.id}
                              className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-200 shadow-md shadow-amber-400/40 flex items-center justify-center text-sm font-bold text-neutral-950 font-serif"
                              style={{ top: `${topPercent}%` }}
                            >
                              {LANE_RUNES[laneIdx]}
                            </div>
                          );
                        })}

                      {/* Hit Line Target Zone at Bottom */}
                      <div className="absolute bottom-3 left-1 right-1 h-12 rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-500/10 flex flex-col items-center justify-center">
                        <span className="font-bold text-sm text-white font-mono">{LANE_LABELS[laneIdx]}</span>
                        <span className="text-[9px] text-amber-300 font-serif">{LANE_RUNES[laneIdx]}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Hit Feedback Float */}
                {hitFeedback && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-neutral-950/90 border border-amber-400 text-amber-300 text-xs font-bold tracking-wider animate-bounce-once shadow-xl">
                    {hitFeedback}
                  </div>
                )}
              </div>

              {/* Touch Controls for Mobile / Click */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[0, 1, 2, 3].map((l) => (
                  <button
                    key={l}
                    onClick={() => checkHitOnLane(l)}
                    className="py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-neutral-950 font-black text-sm transition shadow cursor-pointer"
                  >
                    HIT [{LANE_LABELS[l]}] {LANE_RUNES[l]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SONG FINISHED BANNER */}
          {songFinished && (
            <div className="bg-gradient-to-b from-emerald-950 via-neutral-900 to-emerald-950 border-2 border-emerald-400 rounded-2xl p-6 text-center space-y-4 animate-bounce-once">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <div>
                <div className="text-xs uppercase font-mono font-bold text-emerald-300 tracking-wider">
                  SKALD RECITAL TRIUMPH!
                </div>
                <h3 className="text-lg font-bold text-white font-['Cinzel',serif] mt-0.5">
                  The Mead Hall is Spellbound!
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-md mx-auto">
                  Final Honor Score: <strong className="text-emerald-400 font-mono">{score}</strong> · Max Combo:{' '}
                  <strong className="text-amber-400 font-mono">{maxCombo}x</strong>
                </p>
              </div>

              <div className="p-3 bg-neutral-950/80 rounded-xl border border-emerald-500/40 text-xs text-amber-300 font-semibold max-w-sm mx-auto">
                🎉 ACTIVE BUFF APPLIED: {selectedTrack.buffDescription}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={startSong}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Play Again
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow cursor-pointer transition"
                >
                  Return to Tavern
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Keyboard: Press <kbd className="px-1.5 bg-neutral-800 rounded text-amber-300 font-mono">D</kbd>, <kbd className="px-1.5 bg-neutral-800 rounded text-amber-300 font-mono">F</kbd>, <kbd className="px-1.5 bg-neutral-800 rounded text-amber-300 font-mono">J</kbd>, <kbd className="px-1.5 bg-neutral-800 rounded text-amber-300 font-mono">K</kbd> to strike runes on beat</span>
          <button onClick={onClose} className="hover:text-white transition cursor-pointer">
            Close [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
