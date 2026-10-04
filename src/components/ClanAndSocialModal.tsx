import React, { useState } from 'react';
import {
  X,
  Users,
  Flag,
  ArrowLeftRight,
  Award,
  Coins,
  Trophy,
  Check,
  Shield,
} from 'lucide-react';
import { AchievementBadge, TradeOffer } from '../types';

interface ClanAndSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  clanName: string;
  clanMotto: string;
  clanTreasury: number;
  territoryCaptured: boolean;
  silver: number;
  valor: number;
  wood: number;
  iron: number;
  onUpdateClanProfile: (name: string, motto: string) => void;
  onDonateToClan: (amount: number) => void;
  trades: TradeOffer[];
  onExecuteTrade: (tradeId: string) => void;
  badges: AchievementBadge[];
}

export const ClanAndSocialModal: React.FC<ClanAndSocialModalProps> = ({
  isOpen,
  onClose,
  playerName,
  clanName,
  clanMotto,
  clanTreasury,
  territoryCaptured,
  silver,
  valor,
  wood,
  iron,
  onUpdateClanProfile,
  onDonateToClan,
  trades,
  onExecuteTrade,
  badges,
}) => {
  const [activeTab, setActiveTab] = useState<'clan' | 'trading' | 'badges'>('clan');
  const [draftClanName, setDraftClanName] = useState(clanName);
  const [draftMotto, setDraftMotto] = useState(clanMotto);

  if (!isOpen) return null;

  const clanDamageBonus = Math.min(50, Math.floor(clanTreasury / 150) * 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-amber-400 font-['Cinzel',serif] flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Clan Stronghold, Player Trading & Achievement Badges</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Customize your Viking Clan · Barter with realm traders · Inspect unlocked badges
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-neutral-200">
              <span className="flex items-center gap-1 text-amber-300">
                <Coins className="w-4 h-4 text-amber-400" />
                {silver} Silver
              </span>
              <span className="text-neutral-600">·</span>
              <span className="flex items-center gap-1 text-sky-300">
                <Trophy className="w-4 h-4 text-sky-400" />
                {valor} Valor
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-neutral-900/50 border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('clan')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'clan'
                ? 'bg-amber-500 text-neutral-950'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            Clan & Territory Control
          </button>
          <button
            onClick={() => setActiveTab('trading')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'trading'
                ? 'bg-amber-500 text-neutral-950'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            Player Trading Post
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-amber-500 text-neutral-950'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            Badges & Profile ({badges.filter((b) => b.unlocked).length}/{badges.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'clan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clan Customization */}
              <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-4">
                <h3 className="text-base font-semibold text-white">
                  01. Clan Identity & Banner
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Clan Name</label>
                    <input
                      type="text"
                      value={draftClanName}
                      onChange={(e) => setDraftClanName(e.target.value)}
                      maxLength={24}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Clan War Motto</label>
                    <input
                      type="text"
                      value={draftMotto}
                      onChange={(e) => setDraftMotto(e.target.value)}
                      maxLength={48}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    onClick={() => onUpdateClanProfile(draftClanName.trim() || clanName, draftMotto.trim() || clanMotto)}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold transition cursor-pointer"
                  >
                    Save Clan Banner
                  </button>
                </div>
              </div>

              {/* Clan Treasury & Territory Flag Status */}
              <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-white">
                    02. Clan Treasury & Outpost Territory
                  </h3>
                  <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Clan Treasury Hoard:</span>
                      <span className="font-mono font-semibold text-amber-300">
                        {clanTreasury.toLocaleString()} Silver
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Clan Attack Buff:</span>
                      <span className="font-mono font-semibold text-emerald-400">
                        +{clanDamageBonus} Bonus Axe Damage
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flag
                        className={`w-4 h-4 ${
                          territoryCaptured ? 'text-amber-400' : 'text-red-400'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">
                          Frostfang Outpost Territory
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {territoryCaptured
                            ? `Held by ${clanName} (+5 Silver/s Tribute)`
                            : 'Held by Frostfang Raiders — Sail across & press [E] at flag'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDonateToClan(150)}
                  disabled={silver < 150}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    silver >= 150
                      ? 'bg-sky-500 hover:bg-sky-400 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Donate 150 Silver to Clan Treasury (+5 Clan DMG)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'trading' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-300 bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                <span>
                  Your Inventory: <strong className="text-amber-300 font-mono">{silver} Silver</strong> ·{' '}
                  <strong className="text-emerald-300 font-mono">{wood} Timber</strong> ·{' '}
                  <strong className="text-sky-300 font-mono">{iron} Iron Ore</strong>
                </span>
                <span className="text-neutral-400">Instant verified clan barter</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trades.map((tr) => {
                  const canAfford =
                    (tr.giveType === 'wood' && wood >= tr.giveAmount) ||
                    (tr.giveType === 'iron' && iron >= tr.giveAmount) ||
                    (tr.giveType === 'silver' && silver >= tr.giveAmount);

                  return (
                    <div
                      key={tr.id}
                      className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-400">
                          <span className="font-semibold text-white">{tr.traderName}</span>
                          <span>{tr.traderClan}</span>
                        </div>

                        <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="text-neutral-500 block">You Give</span>
                            <span className="font-semibold text-red-300">{tr.giveLabel}</span>
                          </div>
                          <ArrowLeftRight className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="text-right">
                            <span className="text-neutral-500 block">You Receive</span>
                            <span className="font-semibold text-emerald-300">{tr.receiveLabel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => onExecuteTrade(tr.id)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          Accept Trade
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-bold">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{playerName}</h3>
                    <p className="text-xs text-neutral-400">
                      {clanName} · &ldquo;{clanMotto}&rdquo;
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono text-amber-300">
                  Unlocked Badges: {badges.filter((b) => b.unlocked).length} / {badges.length}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                      b.unlocked
                        ? 'bg-amber-950/25 border-amber-500/60'
                        : 'bg-neutral-900/50 border-neutral-800 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Award
                        className={`w-5 h-5 mt-0.5 shrink-0 ${
                          b.unlocked ? 'text-amber-400' : 'text-neutral-600'
                        }`}
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{b.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1">{b.description}</p>
                        <p className="text-xs font-mono text-amber-300/90 mt-1.5">
                          Reward: +{b.rewardSilver} Silver
                        </p>
                      </div>
                    </div>
                    {b.unlocked && (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
                        <Check className="w-4 h-4" /> Earned
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
