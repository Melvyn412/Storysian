import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  X,
  Compass,
  Ship,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CrewStation } from '../types';
import { sound } from '../audio/soundEngine';

interface FriendRallyModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  clan: string;
  isSailing: boolean;
}

export const FriendRallyModal: React.FC<FriendRallyModalProps> = ({
  isOpen,
  onClose,
  playerName,
  clan,
  isSailing,
}) => {
  const [stationPreference, setStationPreference] = useState<CrewStation>('port_rower');
  const [copied, setCopied] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://storysian.com';
  const rallyUrl = `${baseUrl}/?rally=crew&chieftain=${encodeURIComponent(
    playerName
  )}&clan=${encodeURIComponent(clan)}&station=${stationPreference}`;

  const discordText = `⚔️ **JOIN MY VIKING CREW IN VIKING REALM!** 🌊\nChieftain **${playerName}** has rallied a Drakkar armada! Click the link below to instantly spawn directly onto my warship deck (zero install, runs in browser):\n👉 ${rallyUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rallyUrl);
    sound.playButtonClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText(discordText);
    sound.playButtonClick();
    setCopiedDiscord(true);
    setTimeout(() => setCopiedDiscord(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Cinzel',serif] flex items-center gap-2">
                1-Click Crew Rally &amp; Friend Invite
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Instant Web Join
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Share this link on Discord or WhatsApp. Friends spawn directly on your ship deck in 2 seconds!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Station Preference Picker */}
          <div>
            <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-amber-400" />
              Assign Station for Joining Friend:
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {(
                [
                  { id: 'port_rower', label: 'Port Rower', desc: 'Boosts ship speed' },
                  { id: 'starboard_rower', label: 'Starb. Rower', desc: 'Boosts ship speed' },
                  { id: 'ballista_gunner', label: 'Harpoon Gunner', desc: 'Fires frost bolts' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStationPreference(st.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    stationPreference === st.id
                      ? 'border-sky-400 bg-sky-950/40 text-white shadow-md ring-1 ring-sky-400/50'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold text-xs">{st.label}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">{st.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generated URL Box */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-400 uppercase tracking-wider">Instant Rally URL</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-md bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <div className="p-2.5 bg-neutral-950 rounded-lg text-xs font-mono text-neutral-300 border border-neutral-800 break-all select-all">
              {rallyUrl}
            </div>
          </div>

          {/* Pre-formatted Discord Message */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-400 uppercase tracking-wider">Discord / Chat Message</span>
              <button
                onClick={handleCopyDiscord}
                className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
              >
                {copiedDiscord ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDiscord ? 'Copied Message!' : 'Copy Discord Post'}
              </button>
            </div>
            <textarea
              readOnly
              rows={3}
              value={discordText}
              className="w-full p-2.5 bg-neutral-950 rounded-lg text-xs font-mono text-neutral-400 border border-neutral-800 resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Zero downloads required — friends join instantly in their phone or browser</span>
          <button onClick={onClose} className="hover:text-white transition cursor-pointer">
            Close [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
