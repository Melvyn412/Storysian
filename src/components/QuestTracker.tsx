import React from 'react';
import { Quest } from '../types';
import { Scroll, CheckCircle2, Coins, Flame, Award } from 'lucide-react';

interface QuestTrackerProps {
  quests: Quest[];
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (questId: string) => void;
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({
  quests,
  isOpen,
  onClose,
  onClaimReward,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-14 right-3 sm:right-84 z-30 w-80 bg-neutral-950/95 backdrop-blur-md rounded-xl border border-amber-600/60 shadow-2xl overflow-hidden text-white font-sans select-none animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-900 border-b border-amber-900/60">
        <div className="flex items-center gap-2">
          <Scroll className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold text-sm text-amber-300 font-['Cinzel',serif] tracking-wider">
            Trials of the Jarl
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-neutral-800"
        >
          ✕
        </button>
      </div>

      {/* Quest Items */}
      <div className="p-3 max-h-96 overflow-y-auto space-y-2.5">
        {quests.map((q) => {
          const isDone = q.currentCount >= q.targetCount;
          const progressPercent = Math.min(100, (q.currentCount / q.targetCount) * 100);

          return (
            <div
              key={q.id}
              className={`p-2.5 rounded-lg border transition ${
                q.completed
                  ? 'bg-neutral-900/50 border-neutral-800 opacity-60'
                  : isDone
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-900/20'
                  : 'bg-neutral-900/90 border-neutral-700/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-amber-200">{q.title}</h4>
                  <p className="text-[11px] text-neutral-300 mt-0.5 leading-tight">
                    {q.description}
                  </p>
                </div>
                {q.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0">
                    {q.currentCount} / {q.targetCount}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {!q.completed && (
                <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Reward & Claim */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-800/80 text-[10px]">
                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Coins className="w-3 h-3" /> +{q.rewardSilver}
                  </span>
                  <span className="flex items-center gap-1 text-blue-300 font-bold">
                    <Flame className="w-3 h-3" /> +{q.rewardValor} XP
                  </span>
                </div>

                {!q.completed && isDone && (
                  <button
                    onClick={() => onClaimReward(q.id)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded uppercase text-[10px] tracking-wider animate-pulse transition shadow"
                  >
                    <Award className="w-3 h-3" /> Claim
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
