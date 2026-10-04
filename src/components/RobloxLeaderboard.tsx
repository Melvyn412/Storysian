import React from 'react';
import { LeaderboardPlayer } from '../types';
import { Shield, Trophy, Wifi } from 'lucide-react';

interface RobloxLeaderboardProps {
  players: LeaderboardPlayer[];
  isOpen: boolean;
  onClose: () => void;
}

export const RobloxLeaderboard: React.FC<RobloxLeaderboardProps> = ({
  players,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-14 right-3 z-30 w-72 sm:w-80 bg-neutral-900/90 backdrop-blur-md rounded-lg border border-neutral-700 shadow-2xl overflow-hidden text-white font-sans select-none animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-800/90 border-b border-neutral-700">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-400">
          <Trophy className="w-3.5 h-3.5" />
          <span>Realm Warriors</span>
          <span className="text-neutral-400 font-normal">({players.length})</span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white text-xs px-1 rounded hover:bg-neutral-700"
        >
          ✕
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-950/40 border-b border-neutral-800">
        <span className="col-span-5">Player</span>
        <span className="col-span-3 text-center">Clan</span>
        <span className="col-span-2 text-center">Level</span>
        <span className="col-span-2 text-right">Kills</span>
      </div>

      {/* Player Rows */}
      <div className="max-h-64 overflow-y-auto divide-y divide-neutral-800/50">
        {players.map((p, idx) => (
          <div
            key={p.id}
            className={`grid grid-cols-12 items-center px-3 py-2 text-xs transition ${
              p.isSelf
                ? 'bg-amber-500/20 text-amber-200 font-semibold'
                : 'hover:bg-neutral-800/50 text-neutral-300'
            }`}
          >
            {/* Name with rank badge */}
            <div className="col-span-5 flex items-center gap-1.5 truncate">
              <span className="text-[10px] font-mono text-neutral-500 w-3.5">
                {idx + 1}
              </span>
              <span className="truncate">{p.name}</span>
              {p.isSelf && (
                <span className="text-[9px] bg-amber-500 text-neutral-950 px-1 rounded font-bold">
                  YOU
                </span>
              )}
            </div>

            {/* Clan */}
            <div className="col-span-3 text-center text-[11px] text-neutral-400 truncate">
              {p.clan}
            </div>

            {/* Level */}
            <div className="col-span-2 text-center font-bold text-amber-400">
              {p.level}
            </div>

            {/* Kills */}
            <div className="col-span-2 text-right font-mono font-medium text-red-400">
              {p.kills}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-neutral-400 bg-neutral-950/60 border-t border-neutral-800">
        <span className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-emerald-400" /> Ping: 24ms
        </span>
        <span>Server: North-Katfjord #1</span>
      </div>
    </div>
  );
};
