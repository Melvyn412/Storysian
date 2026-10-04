import React, { useState } from 'react';
import { Swords, CheckCircle2, Circle, ChevronDown, ChevronUp, Flag, Sparkles } from 'lucide-react';
import { ActiveCampaignState } from '../types';

interface CampaignTrackerHUDProps {
  campaign: ActiveCampaignState;
  onAbandonCampaign: () => void;
}

export const CampaignTrackerHUD: React.FC<CampaignTrackerHUDProps> = ({
  campaign,
  onAbandonCampaign,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeStep = campaign.steps[campaign.currentStepIndex];
  const completedStepsCount = campaign.steps.filter((s) => s.completed).length;
  const totalSteps = campaign.steps.length;

  return (
    <div className="fixed top-12 right-2 sm:right-4 z-20 pointer-events-auto select-none w-72 sm:w-80 font-sans transition-all duration-300">
      <div className="bg-neutral-950/90 backdrop-blur-md rounded-2xl border border-amber-500/50 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-950/90 via-neutral-900 to-amber-950/90 p-2.5 sm:p-3 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <Swords className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600/40">
                  {campaign.scenario.badge}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {completedStepsCount}/{totalSteps}
                </span>
              </div>
              <h3 className="font-extrabold text-xs sm:text-sm text-neutral-100 truncate tracking-wide mt-0.5">
                {campaign.scenario.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition shrink-0 cursor-pointer"
            title={isCollapsed ? 'Expand objectives' : 'Collapse objectives'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Content Body */}
        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {/* Step Checkpoints List */}
            <div className="space-y-1.5">
              {campaign.steps.map((step, idx) => {
                const isCurrent = idx === campaign.currentStepIndex;
                const isDone = step.completed;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-2 p-1.5 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-amber-950/40 border border-amber-500/40 shadow-sm'
                        : isDone
                        ? 'opacity-65'
                        : 'opacity-40'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center animate-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        </div>
                      ) : (
                        <Circle className="w-4 h-4 text-neutral-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold truncate ${
                            isDone
                              ? 'line-through text-neutral-400'
                              : isCurrent
                              ? 'text-amber-200 font-bold'
                              : 'text-neutral-400'
                          }`}
                        >
                          {step.label}
                        </span>

                        {step.targetCount > 1 && !isDone && (
                          <span className="font-mono text-[10px] text-amber-300 ml-1 shrink-0 font-bold">
                            {step.currentCount}/{step.targetCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Objective Callout & Tactical Hint */}
            {activeStep && !campaign.isCompleted && (
              <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-amber-500/30 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Current Task</span>
                </div>
                <p className="text-neutral-200 text-xs leading-relaxed font-medium">
                  {activeStep.description}
                </p>
                {activeStep.hint && (
                  <p className="text-[11px] text-amber-300/80 italic bg-amber-950/30 p-1.5 rounded border border-amber-800/30">
                    💡 {activeStep.hint}
                  </p>
                )}
              </div>
            )}

            {/* Campaign Controls */}
            <div className="pt-1 flex items-center justify-between text-[11px] border-t border-neutral-800">
              <span className="text-neutral-400 text-[10px]">
                {campaign.isCompleted ? '🎉 Complete!' : 'In Progress'}
              </span>
              <button
                onClick={onAbandonCampaign}
                className="text-[11px] text-red-400 hover:text-red-300 transition flex items-center gap-1 cursor-pointer font-medium"
              >
                <Flag className="w-3 h-3" />
                Retreat to Katfjord
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
