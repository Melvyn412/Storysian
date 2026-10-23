import React from 'react';
import {
  Moon,
  Flame,
  ShieldAlert,
  Skull,
  Award,
  Zap,
  Clock,
  Swords,
  CheckCircle,
} from 'lucide-react';
import { RagnarokEclipseEventState } from '../types';
import { sound } from '../audio/soundEngine';

interface RagnarokEclipseHUDProps {
  eventState: RagnarokEclipseEventState;
  onAttackInvader: () => void;
  onClaimSurvivorBounty: () => void;
  onTriggerEclipseEvent: () => void;
}

export const RagnarokEclipseHUD: React.FC<RagnarokEclipseHUDProps> = ({
  eventState,
  onAttackInvader,
  onClaimSurvivorBounty,
  onTriggerEclipseEvent,
}) => {
  if (!eventState.isActive) {
    return (
      <div className="fixed top-16 right-4 z-30 pointer-events-auto">
        <button
          onClick={() => {
            sound.playThunder();
            onTriggerEclipseEvent();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-bold text-xs flex items-center gap-2 border border-red-500/50 shadow-lg shadow-red-900/40 cursor-pointer transition"
          title="Trigger the Blood Moon Eclipse Cataclysm Server Event"
        >
          <Moon className="w-3.5 h-3.5 text-red-400 fill-red-400 animate-pulse" />
          <span>Summon Ragnarök Eclipse</span>
        </button>
      </div>
    );
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCompleted = eventState.currentWave > eventState.maxWaves || eventState.bossHp <= 0;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-3 pointer-events-auto select-none font-sans animate-bounce-once">
      <div className="bg-gradient-to-b from-red-950/95 via-neutral-950/95 to-black/95 backdrop-blur-md border-2 border-red-500/80 rounded-2xl shadow-2xl shadow-red-950/60 p-4 text-white">
        {/* Event Header */}
        <div className="flex items-center justify-between border-b border-red-500/30 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400">
              <Moon className="w-4 h-4 fill-red-500 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider uppercase text-red-400 font-['Cinzel',serif] flex items-center gap-2">
                RAGNARÖK BLOOD MOON ECLIPSE
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-600/40 text-red-200 border border-red-400 animate-pulse font-mono">
                  GLOBAL WORLD EVENT
                </span>
              </div>
              <div className="text-[10px] text-neutral-300">
                Fenrir's Shadow Horde is storming Katfjord! Rally at the Mead Hall!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-300 bg-red-950/80 px-2.5 py-1 rounded-lg border border-red-500/40">
            <Clock className="w-3.5 h-3.5" />
            {formatSeconds(eventState.timeRemainingSeconds)}
          </div>
        </div>

        {/* Wave & Boss Status */}
        {!isCompleted ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-neutral-900/80 border border-red-900/40">
                <div className="text-[10px] text-neutral-400 uppercase">Defense Wave</div>
                <div className="text-sm font-black text-amber-400">
                  {eventState.currentWave} / {eventState.maxWaves}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900/80 border border-red-900/40">
                <div className="text-[10px] text-neutral-400 uppercase">Shadow Invaders</div>
                <div className="text-sm font-black text-red-400 flex items-center justify-center gap-1">
                  <Skull className="w-3.5 h-3.5" />
                  {eventState.enemiesRemaining}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900/80 border border-red-900/40">
                <div className="text-[10px] text-neutral-400 uppercase">Your Damage</div>
                <div className="text-sm font-black text-emerald-400 font-mono">
                  {eventState.totalDamageDealt} HP
                </div>
              </div>
            </div>

            {/* Boss Bar (Wave 10 / Climax) */}
            {eventState.currentWave >= 8 && (
              <div className="bg-neutral-900/90 border border-red-500/40 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                    World Boss: Fenrir the Star-Devourer
                  </span>
                  <span className="font-mono text-red-300">
                    {eventState.bossHp} / {eventState.bossMaxHp} HP
                  </span>
                </div>
                <div className="w-full bg-neutral-950 rounded-full h-3 overflow-hidden border border-red-900">
                  <div
                    className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.max(0, (eventState.bossHp / eventState.bossMaxHp) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Action Rally Strike Button */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-neutral-300">
                Protect Katfjord villagers &amp; the Mead Hall hearth fire!
              </span>
              <button
                onClick={() => {
                  sound.playSwordHit();
                  onAttackInvader();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-red-600/30 cursor-pointer active:scale-95"
              >
                <Swords className="w-3.5 h-3.5" />
                STRIKE SHADOW BEAST
              </button>
            </div>
          </div>
        ) : (
          /* Victory & Bounty Claim */
          <div className="space-y-3 py-1">
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-300 font-['Cinzel',serif]">
                  RAGNARÖK THREAT DEFEATED! KATFJORD PRESERVED!
                </div>
                <div className="text-[11px] text-neutral-300">
                  The blood eclipse has broken. Valhalla honors your courage with heroic spoils!
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-amber-300 font-semibold">
                Bounty: +1,500 Silver, +1,200 Valor &amp; Eclipse Rune
              </span>
              {!eventState.survivorBountyClaimed ? (
                <button
                  onClick={() => {
                    sound.playFanfare();
                    onClaimSurvivorBounty();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  CLAIM RAGNARÖK BOUNTY
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-bold">✓ Spoils Claimed</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
