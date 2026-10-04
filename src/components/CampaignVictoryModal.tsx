import React from 'react';
import { Trophy, Coins, ShieldAlert, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { ActiveCampaignState } from '../types';

interface CampaignVictoryModalProps {
  campaign: ActiveCampaignState;
  onClaimAndClose: () => void;
  onReturnToKatfjord: () => void;
}

export const CampaignVictoryModal: React.FC<CampaignVictoryModalProps> = ({
  campaign,
  onClaimAndClose,
  onReturnToKatfjord,
}) => {
  const durationSeconds = Math.round((Date.now() - campaign.startTime) / 1000);
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  // Calculate battle performance grade
  let rank = 'S';
  let rankTitle = 'Einherjar Legend';
  if (durationSeconds > 180) {
    rank = 'A';
    rankTitle = 'Viking Vanguard';
  } else if (durationSeconds > 300) {
    rank = 'B';
    rankTitle = 'Stalwart Raider';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-neutral-950 rounded-3xl border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden relative">
        {/* Glow accents */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-6 text-center border-b border-amber-500/40 relative">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 mb-3 shadow-lg animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>

          <span className="block text-xs font-black tracking-widest text-amber-400 uppercase font-mono mb-1">
            CAMPAIGN CONQUERED
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-wide font-serif drop-shadow-md">
            {campaign.scenario.title}
          </h2>
          <p className="text-xs text-amber-200/80 mt-1 max-w-sm mx-auto">
            {campaign.scenario.subtitle}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Performance Grade & Rank Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-neutral-950 font-black text-2xl shadow-md">
                {rank}
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                  Battle Performance
                </p>
                <h4 className="text-sm font-bold text-amber-300">
                  {rankTitle}
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block font-bold">Campaign Time</span>
              <span className="text-sm font-mono font-bold text-neutral-200">
                {minutes}m {seconds}s
              </span>
            </div>
          </div>

          {/* Spoils of War Rewards */}
          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Spoils of War Claimed</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-950/40 border border-amber-600/40">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold">Silver Spoils</span>
                  <span className="text-lg font-black text-amber-300 font-mono">
                    +{campaign.scenario.rewardSilver}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-950/40 border border-blue-600/40">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold">Valor Honor</span>
                  <span className="text-lg font-black text-cyan-300 font-mono">
                    +{campaign.scenario.rewardValor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Statistics */}
          <div className="grid grid-cols-3 gap-2 text-center py-2 px-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-500 text-[10px] block">Barricades Smashed</span>
              <span className="font-bold text-neutral-200 font-mono text-sm">
                {campaign.barricadesDestroyed}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">Enemies Slayed</span>
              <span className="font-bold text-neutral-200 font-mono text-sm">
                {campaign.enemiesDefeated}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">Total Damage</span>
              <span className="font-bold text-neutral-200 font-mono text-sm">
                {campaign.damageDealt}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              onClick={onReturnToKatfjord}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-neutral-950 font-black text-sm tracking-wide shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Claim & Return to Katfjord</span>
            </button>

            <button
              onClick={onClaimAndClose}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Stay Here</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
