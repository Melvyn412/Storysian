import React, { useState } from 'react';
import {
  X,
  Users,
  Swords,
  Flame,
  Copy,
  Check,
  Navigation,
  Sparkles,
  Flag,
  Radio,
  Shield,
  RefreshCw,
  Ship,
  Skull,
  Crosshair,
} from 'lucide-react';
import {
  NiflheimDungeonBoss,
  RemotePlayerState,
  SeaSerpentState,
  SharedWorldBoss,
  SupplyDropEvent,
  TerritoryHolderState,
} from '../types';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  roomId: string;
  selfId: string | null;
  playerName: string;
  playerClan: string;
  playerLevel: number;
  remotePlayers: RemotePlayerState[];
  worldBoss: SharedWorldBoss | null;
  seaSerpent: SeaSerpentState | null;
  dungeonBoss: NiflheimDungeonBoss | null;
  supplyDrop: SupplyDropEvent | null;
  territoryHolder: TerritoryHolderState | null;
  onSwitchRoom: (newRoomId: string) => void;
  onUpdatePlayerName: (newName: string) => void;
  onTeleportToCoords: (x: number, z: number, label: string) => void;
  onStrikeWorldBoss: (damage: number) => void;
  onRespawnWorldBoss: () => void;
  onFireNavalBallista: () => void;
  onRespawnSeaSerpent: () => void;
  onBoardDrakkarNaval: () => void;
  onStrikeDungeonBoss: (damage: number) => void;
  onRespawnDungeonBoss: () => void;
  onOpenTacticalWheel: () => void;
  onSpawnSupplyDrop: () => void;
  onClaimSupplyDrop: () => void;
  onPvPAttackPlayer: (targetId: string, targetName: string) => void;
}

const PRESET_REALMS = [
  {
    id: 'katfjord-main',
    name: 'Katfjord Main Realm',
    subtitle: 'Open-World Social, Sailing, Tycoon & Co-Op Raids',
  },
  {
    id: 'valhalla-pvp',
    name: 'Valhalla Holmgang PvP',
    subtitle: 'High-Stakes 1v1 & Free-For-All Viking Arena Combat',
  },
  {
    id: 'ragnarok-raid',
    name: 'Ragnarok Boss Server',
    subtitle: 'Dedicated Co-Op World Boss, Sea Serpent & Niflheim Dungeon',
  },
  {
    id: 'young-viking-meadow',
    name: '🌿 Young Viking Forager Meadow',
    subtitle: 'Peaceful Sunlit Sanctuary — Wander Around Gathering Berries, Herbs, Amber & Golden Apples',
  },
  {
    id: 'valhalla-gvg',
    name: '🚩 Thor’s Pass — 3-Tower Clan Conquest',
    subtitle: 'Guild vs Guild Battlefield: Capture Spire, Central Bastion & Redoubt for Clan Dividends',
  },
];

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  roomId,
  playerName,
  playerClan,
  playerLevel,
  remotePlayers,
  worldBoss,
  seaSerpent,
  dungeonBoss,
  supplyDrop,
  territoryHolder,
  onSwitchRoom,
  onUpdatePlayerName,
  onTeleportToCoords,
  onStrikeWorldBoss,
  onRespawnWorldBoss,
  onFireNavalBallista,
  onRespawnSeaSerpent,
  onBoardDrakkarNaval,
  onStrikeDungeonBoss,
  onRespawnDungeonBoss,
  onOpenTacticalWheel,
  onSpawnSupplyDrop,
  onClaimSupplyDrop,
  onPvPAttackPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'realms' | 'worldboss' | 'dungeon_naval' | 'events'>('realms');
  const [nameInput, setNameInput] = useState(playerName);
  const [customRoomInput, setCustomRoomInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [customDomain, setCustomDomain] = useState<string>(() => {
    try {
      return localStorage.getItem('storysian_custom_domain') || 'storysian.com';
    } catch {
      return 'storysian.com';
    }
  });
  const [showDomainGuide, setShowDomainGuide] = useState(false);

  if (!isOpen) return null;

  const totalOnline = remotePlayers.length + 1;
  const shareUrl = `${window.location.origin}/STORYSIAN-VIKING-WAR-COUNCIL.AI.STUDIO?room=${encodeURIComponent(roomId)}`;
  const cleanCustomHost = customDomain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
  const customDomainUrl = cleanCustomHost
    ? `https://${cleanCustomHost}/?room=${encodeURIComponent(roomId)}`
    : shareUrl;

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const bossContributors = worldBoss
    ? Object.entries(worldBoss.contributors).sort((a, b) => b[1].damage - a[1].damage)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/70">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-400 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="font-bold text-amber-400 tracking-wide">
                STORYSIAN VIKING WAR COUNCIL.AI.STUDIO
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {isConnected ? 'WebSocket Server Connected' : 'Reconnecting to Realm...'}
              </span>
              <span aria-hidden="true">·</span>
              <span>Realm: {roomId.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span>
                {totalOnline} {totalOnline === 1 ? 'Warrior' : 'Warriors'} Online
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              Live Multiplayer Realms, Naval Crew, Niflheim Dungeon & PvP
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
            title="Close Multiplayer Hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-3 border-b border-neutral-800 bg-neutral-950">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
            <button
              onClick={() => setActiveTab('realms')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'realms'
                  ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Realms & Players ({totalOnline})</span>
            </button>
            <button
              onClick={() => setActiveTab('dungeon_naval')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dungeon_naval'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              <span>Niflheim Dungeon & Naval Crew</span>
            </button>
            <button
              onClick={() => setActiveTab('worldboss')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'worldboss'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>World Boss Raid</span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-sky-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>PvP, Meteor & Command Wheel</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDomainGuide((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-semibold text-amber-300 transition cursor-pointer"
            >
              {showDomainGuide ? 'Hide Custom Domain Setup' : 'Connect Custom Domain'}
            </button>
            <button
              onClick={handleCopyInvite}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Room Invite URL!' : 'Copy Multiplayer Invite Link'}</span>
            </button>
          </div>
        </div>

        {/* Custom Domain & DNS Mapping Assistant Drawer */}
        {showDomainGuide && (
          <div className="px-6 py-4 bg-neutral-900/95 border-b border-amber-500/40 space-y-3 text-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-amber-300 text-sm">
                  Custom Domain &amp; Google Cloud Run DNS Mapping
                </div>
                <p className="text-neutral-300 mt-0.5">
                  Set your custom domain below to format all Multiplayer Invite Links, and add these DNS
                  records at your registrar (Cloudflare, Namecheap, GoDaddy, or Google Domains).
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => {
                    setCustomDomain(e.target.value);
                    try {
                      localStorage.setItem('storysian_custom_domain', e.target.value);
                    } catch {
                      // ignore storage error
                    }
                  }}
                  placeholder="e.g. storysian-viking-war-council.com"
                  className="w-64 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="font-bold text-emerald-400">Step 1: Deploy to Cloud Run</div>
                <p className="text-neutral-400 mt-1">
                  Click <span className="text-white font-semibold">Deploy</span> in the top-right of AI Studio,
                  then open <span className="text-white font-semibold">Google Cloud Console → Cloud Run</span>.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="font-bold text-amber-400">Step 2: Map Custom Domain</div>
                <p className="text-neutral-400 mt-1">
                  Click <span className="text-white font-semibold">Manage Custom Domains → Add Mapping</span>,
                  select this service, and enter your domain name.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="font-bold text-sky-400">Step 3: Add DNS Record</div>
                <p className="text-neutral-400 mt-1">
                  For subdomains (<span className="text-white font-mono">www</span> or{' '}
                  <span className="text-white font-mono">play</span>), add a{' '}
                  <span className="text-amber-300 font-mono font-bold">CNAME</span> pointing to{' '}
                  <span className="text-emerald-300 font-mono font-bold">ghs.googlehosted.com.</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/50 border border-neutral-800 font-mono text-[11px] text-emerald-300">
              <span className="truncate">Active Share URL: {shareUrl}</span>
              <button
                onClick={handleCopyInvite}
                className="ml-3 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-sans font-bold text-xs shrink-0 cursor-pointer"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'realms' && (
            <div className="space-y-6">
              {/* Warrior Identity & Custom Room Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-neutral-800">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Your Multiplayer Viking Handle
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={22}
                      placeholder="Enter Viking Name..."
                      className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => {
                        if (nameInput.trim()) {
                          onUpdatePlayerName(nameInput.trim());
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs transition cursor-pointer"
                    >
                      Save Name
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Join or Create Private Clan Room Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customRoomInput}
                      onChange={(e) => setCustomRoomInput(e.target.value)}
                      maxLength={24}
                      placeholder="e.g. clan-thor-1"
                      className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => {
                        if (customRoomInput.trim()) {
                          onSwitchRoom(customRoomInput.trim().toLowerCase());
                          setCustomRoomInput('');
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 transition cursor-pointer"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              </div>

              {/* Server Realm Selector */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  01. Select Active Multiplayer Realm Server
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PRESET_REALMS.map((r) => {
                    const isCurrent = roomId === r.id;
                    return (
                      <div
                        key={r.id}
                        className={`p-4 rounded-lg border transition flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-emerald-950/25 border-emerald-500/70'
                            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs text-neutral-400 mb-1">
                            <span>Server ID: {r.id}</span>
                            <span aria-hidden="true"> · </span>
                            <span className={isCurrent ? 'text-emerald-400 font-semibold' : ''}>
                              {isCurrent ? 'Connected' : 'Available'}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white">{r.name}</h4>
                          <p className="text-xs text-neutral-400 mt-1">{r.subtitle}</p>
                        </div>

                        <button
                          onClick={() => onSwitchRoom(r.id)}
                          disabled={isCurrent}
                          className={`mt-4 w-full py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                          }`}
                        >
                          {isCurrent ? 'Active Realm' : 'Switch to Realm'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Connected Players Roster */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    02. Live Warriors in {roomId.toUpperCase()} ({totalOnline})
                  </h3>
                  <span className="text-xs text-neutral-400">
                    Open a second browser tab or share the invite link to see live 3D avatars sync in real time
                  </span>
                </div>

                <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg bg-neutral-900/40">
                  {/* Local Player Row */}
                  <div className="p-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-emerald-400">
                        <span>You (Local Jarl)</span>
                        <span aria-hidden="true"> · </span>
                        <span>{playerClan}</span>
                        <span aria-hidden="true"> · </span>
                        <span>Level {playerLevel}</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">{playerName}</div>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">
                      Broadcasting 3D Position & Combat
                    </div>
                  </div>

                  {/* Remote Players */}
                  {remotePlayers.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-400">
                      No other warriors are in <strong className="text-white">{roomId}</strong> yet. Click{' '}
                      <strong className="text-emerald-400">Copy Multiplayer Invite Link</strong> above or open this URL in a second tab to test instant 3D avatar & PvP synchronization!
                    </div>
                  ) : (
                    remotePlayers.map((rp) => (
                      <div
                        key={rp.id}
                        className="p-3.5 flex items-center justify-between flex-wrap gap-3"
                      >
                        <div>
                          <div className="text-xs text-neutral-400">
                            <span className="text-emerald-400 font-medium">Live Peer</span>
                            <span aria-hidden="true"> · </span>
                            <span>{rp.clan}</span>
                            <span aria-hidden="true"> · </span>
                            <span>Level {rp.level}</span>
                            <span aria-hidden="true"> · </span>
                            <span>
                              HP {rp.health}/{rp.maxHealth}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <span>
                              Pos ({Math.round(rp.x)}, {Math.round(rp.z)})
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white mt-0.5">{rp.name}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onTeleportToCoords(rp.x + 2.5, rp.z + 2.5, rp.name);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-sky-300 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Teleport to Player</span>
                          </button>

                          <button
                            onClick={() => onPvPAttackPlayer(rp.id, rp.name)}
                            className="px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900/80 border border-red-800/70 text-xs font-semibold text-red-200 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            <span>Holmgang Strike</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dungeon_naval' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Niflheim Underworld Dungeon Raid (Níðhöggr the Underworld Dragon) */}
              <div className="p-5 rounded-xl bg-neutral-900/70 border border-purple-500/40 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-xs text-purple-300 font-medium">
                    <span>Co-Op Dungeon Instance</span>
                    <span aria-hidden="true"> · </span>
                    <span>Portal (X:-28, Z:26)</span>
                    <span aria-hidden="true"> · </span>
                    <span>Cavern (X:-115, Z:26)</span>
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Skull className="w-5 h-5 text-purple-400" />
                    <span>{dungeonBoss?.name || 'Níðhöggr the Underworld Dragon'}</span>
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Step through the spinning purple Niflheim Portal in Katfjord Village to enter the obsidian underworld cavern, dodge swinging Soul-Scythe traps, and slay the winged dragon boss for{' '}
                    <strong className="text-purple-300">+600 Silver & +750 Valor</strong>!
                  </p>

                  {dungeonBoss && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-neutral-300">
                          {dungeonBoss.isAlive ? `Phase ${dungeonBoss.phase} Active` : 'SLAIN — SPOILS AWARDED'}
                        </span>
                        <span className="text-purple-300 font-bold">
                          {dungeonBoss.health} / {dungeonBoss.maxHealth} HP
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 transition-all duration-300"
                          style={{
                            width: `${Math.max(0, Math.min(100, (dungeonBoss.health / dungeonBoss.maxHealth) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onTeleportToCoords(-115, 36, 'Niflheim Underworld Cavern');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Enter Niflheim Cavern
                    </button>
                    <button
                      onClick={() => {
                        onTeleportToCoords(-28, 32, 'Niflheim Village Portal');
                        onClose();
                      }}
                      className="py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-purple-200 text-xs font-semibold transition cursor-pointer"
                    >
                      Village Portal
                    </button>
                  </div>

                  {dungeonBoss?.isAlive ? (
                    <button
                      onClick={() => onStrikeDungeonBoss(85)}
                      className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Strike Níðhöggr Dragon (-85 HP)</span>
                    </button>
                  ) : (
                    <button
                      onClick={onRespawnDungeonBoss}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Awaken Níðhöggr Dragon (Respawn)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Multi-Crew Longship Naval Battles & Broadside Frost-Ballistas */}
              <div className="p-5 rounded-xl bg-neutral-900/70 border border-sky-500/40 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-xs text-sky-300 font-medium">
                    <span>Multi-Crew Naval Combat</span>
                    <span aria-hidden="true"> · </span>
                    <span>Drakkar (X:22, Z:85)</span>
                    <span aria-hidden="true"> · </span>
                    <span>Serpent (X:38, Z:125)</span>
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Ship className="w-5 h-5 text-sky-400" />
                    <span>{seaSerpent?.name || 'Jörmungandr’s Fjord Leviathan'}</span>
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Board the Drakkar Warship as <strong className="text-white">Helm Captain</strong> or{' '}
                    <strong className="text-white">Ballista Gunner</strong>. Press <code className="text-sky-300">[R]</code> to fire 3D Frost-Harpoon bolts into Jörmungandr’s coils for{' '}
                    <strong className="text-sky-300">+350 Silver & +450 Valor</strong>!
                  </p>

                  {seaSerpent && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-neutral-300">
                          {seaSerpent.isAlive ? 'SURFACED IN FJORD' : 'SUNK — SPOILS AWARDED'}
                        </span>
                        <span className="text-sky-300 font-bold">
                          {seaSerpent.health} / {seaSerpent.maxHealth} HP
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-300"
                          style={{
                            width: `${Math.max(0, Math.min(100, (seaSerpent.health / seaSerpent.maxHealth) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      onBoardDrakkarNaval();
                      onClose();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Ship className="w-3.5 h-3.5" />
                    <span>Board Drakkar & Man Frost-Ballistas</span>
                  </button>

                  {seaSerpent?.isAlive ? (
                    <button
                      onClick={onFireNavalBallista}
                      className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Fire Broadside Frost-Ballista (-95 HP)</span>
                    </button>
                  ) : (
                    <button
                      onClick={onRespawnSeaSerpent}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Summon Jörmungandr Leviathan</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'worldboss' && (
            <div className="space-y-6">
              {worldBoss ? (
                <div className="p-5 rounded-lg bg-neutral-900/70 border border-neutral-800 space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-xs text-amber-400 font-medium">
                        <span>{worldBoss.title}</span>
                        <span aria-hidden="true"> · </span>
                        <span>Phase {worldBoss.phase}</span>
                        <span aria-hidden="true"> · </span>
                        <span>
                          Coordinates (X:{worldBoss.x}, Z:{worldBoss.z})
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-0.5">{worldBoss.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        Shared server-authoritative Raid Boss. Every axe blow and weapon skill from any player in{' '}
                        <strong className="text-white">{roomId}</strong> depletes its health bar in real time!
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onTeleportToCoords(worldBoss.x, worldBoss.z - 8, worldBoss.name);
                          onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Teleport to World Boss</span>
                      </button>

                      {worldBoss.isAlive ? (
                        <button
                          onClick={() => onStrikeWorldBoss(65)}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>Co-Op Raid Strike (-65 HP)</span>
                        </button>
                      ) : (
                        <button
                          onClick={onRespawnWorldBoss}
                          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Sound Ragnarok Horn (Respawn Boss)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Shared Health Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="text-neutral-300">
                        Status: {worldBoss.isAlive ? 'ALIVE & RAGING' : 'SLAIN — SPOILS AWARDED'}
                      </span>
                      <span className="text-amber-400 font-bold">
                        {worldBoss.health} / {worldBoss.maxHealth} HP
                      </span>
                    </div>
                    <div className="w-full h-3.5 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                        style={{
                          width: `${Math.max(0, Math.min(100, (worldBoss.health / worldBoss.maxHealth) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Raid Damage Leaderboard */}
                  <div className="pt-3 border-t border-neutral-800">
                    <h4 className="text-xs font-semibold text-neutral-300 mb-2">
                      Live Co-Op Raid Damage Contributors (+400 Silver & +500 Valor on Defeat)
                    </h4>
                    {bossContributors.length === 0 ? (
                      <p className="text-xs text-neutral-500">
                        No damage dealt yet. Teleport to the boss or click Co-Op Raid Strike to lead the assault!
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {bossContributors.map(([pid, entry], idx) => (
                          <div
                            key={pid}
                            className="flex items-center justify-between text-xs py-1.5 px-3 rounded bg-neutral-950/80"
                          >
                            <span className="font-medium text-white">
                              0{idx + 1}. {entry.name}
                            </span>
                            <span className="font-mono text-amber-400">{entry.damage} DMG</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Holmgang PvP Ring */}
              <div className="p-5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-red-400 font-medium">
                    <span>3D Arena Ring</span>
                    <span aria-hidden="true"> · </span>
                    <span>Coords (X:-16, Z:-10)</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                    <Swords className="w-4 h-4 text-red-400" />
                    <span>Holmgang PvP Duel Ring</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    Step inside the stone pillars of the Holmgang Ring in Katfjord Village. Swing your Battle Axe or unleash Z/X/F skills near other live players to engage in real-time PvP combat (+120 Silver per kill).
                  </p>
                </div>

                <button
                  onClick={() => {
                    onTeleportToCoords(-16, -10, 'Holmgang PvP Duel Ring');
                    onClose();
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Teleport to Holmgang PvP Ring
                </button>
              </div>

              {/* 2. Starfall Runic Meteor Drop */}
              <div className="p-5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-sky-400 font-medium">
                    <span>Server Supply Event</span>
                    <span aria-hidden="true"> · </span>
                    <span>
                      {supplyDrop?.active
                        ? `Active at (X:${supplyDrop.x}, Z:${supplyDrop.z})`
                        : `Claimed by ${supplyDrop?.claimedBy || 'Warrior'}`}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Starfall Runic Meteor Chest</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    A glowing runic meteor crashes into the realm with a sky-beam beacon. The first multiplayer warrior to reach and claim it earns{' '}
                    <strong className="text-white">+250 Silver & +300 Valor</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  {supplyDrop?.active ? (
                    <>
                      <button
                        onClick={() => {
                          onTeleportToCoords(supplyDrop.x, supplyDrop.z - 3, 'Starfall Meteor Chest');
                          onClose();
                        }}
                        className="w-full py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-semibold transition cursor-pointer"
                      >
                        Teleport to Meteor Chest
                      </button>
                      <button
                        onClick={onClaimSupplyDrop}
                        className="w-full py-2 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sky-300 text-xs font-semibold border border-sky-500/40 transition cursor-pointer"
                      >
                        Claim Meteor Spoils (+250 Silver)
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={onSpawnSupplyDrop}
                      className="w-full py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-semibold transition cursor-pointer"
                    >
                      Call Down New Starfall Meteor
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Tactical War-Command Wheel & Frostfang Territory */}
              <div className="p-5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-amber-400 font-medium">
                    <span>3D Sky-Beacons & Territory</span>
                    <span aria-hidden="true"> · </span>
                    <span>Hotkey [T]</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-amber-400" />
                    <span>Tactical Wheel & Territory</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    Outpost held by{' '}
                    <strong className="text-white">
                      {territoryHolder?.playerName || 'Jarl Erik'} ({territoryHolder?.clan || 'Katfjord'})
                    </strong>
                    . Use the <strong className="text-amber-300">Tactical Command Wheel [T]</strong> to ping 3D sky-beacons & radar markers for all allies!
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTacticalWheel();
                    }}
                    className="w-full py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Open Tactical Command Wheel [T]</span>
                  </button>
                  <button
                    onClick={() => {
                      onTeleportToCoords(24, 208, 'Frostfang Territory Banner');
                      onClose();
                    }}
                    className="w-full py-2 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Teleport to Frostfang Banner</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
