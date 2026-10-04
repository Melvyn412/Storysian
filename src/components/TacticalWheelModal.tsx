import React from 'react';
import {
  X,
  Flame,
  Ship,
  Skull,
  Flag,
  Sparkles,
  Shield,
  Radio,
  Navigation,
} from 'lucide-react';

export interface TacticalCommandOption {
  id: string;
  label: string;
  subtitle: string;
  color: string;
  x: number;
  z: number;
}

interface TacticalWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerX: number;
  playerZ: number;
  meteorX: number;
  meteorZ: number;
  onSendTacticalPing: (cmd: TacticalCommandOption) => void;
  onTeleportToPing: (x: number, z: number, label: string) => void;
}

export const TacticalWheelModal: React.FC<TacticalWheelModalProps> = ({
  isOpen,
  onClose,
  playerX,
  playerZ,
  meteorX,
  meteorZ,
  onSendTacticalPing,
  onTeleportToPing,
}) => {
  if (!isOpen) return null;

  const commands: TacticalCommandOption[] = [
    {
      id: 'attack_world_boss',
      label: 'Attack Co-Op World Boss!',
      subtitle: 'Surtr’s Colossus (X:8, Z:95)',
      color: '#f97316',
      x: 8,
      z: 95,
    },
    {
      id: 'board_drakkar_ballista',
      label: 'Board Drakkar & Man Ballistas!',
      subtitle: 'Hunt Jörmungandr Sea Serpent (X:22, Z:85)',
      color: '#38bdf8',
      x: 22,
      z: 85,
    },
    {
      id: 'raid_niflheim_dungeon',
      label: 'Enter Niflheim Underworld Portal!',
      subtitle: 'Slay Níðhöggr the Dragon (X:-28, Z:26)',
      color: '#a855f7',
      x: -28,
      z: 26,
    },
    {
      id: 'defend_frostfang_banner',
      label: 'Capture Frostfang Banner!',
      subtitle: 'Outpost King-of-the-Hill (X:24, Z:214)',
      color: '#facc15',
      x: 24,
      z: 214,
    },
    {
      id: 'claim_starfall_meteor',
      label: 'Secure Starfall Meteor Chest!',
      subtitle: `Supply Drop (X:${Math.round(meteorX)}, Z:${Math.round(meteorZ)})`,
      color: '#06b6d4',
      x: meteorX,
      z: meteorZ,
    },
    {
      id: 'rally_on_me',
      label: 'Shield-Wall Rally on Me!',
      subtitle: `Your Position (X:${Math.round(playerX)}, Z:${Math.round(playerZ)})`,
      color: '#10b981',
      x: playerX,
      z: playerZ,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Server-Wide 3D Sky-Beacon & Radar Ping</span>
              <span aria-hidden="true">·</span>
              <span>Hotkey [T]</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Tactical War-Command Wheel
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Radial / Tactical Command Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
          {commands.map((cmd) => (
            <div
              key={cmd.id}
              className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-600 transition flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0"
                  style={{ color: cmd.color }}
                >
                  {cmd.id === 'attack_world_boss' && <Flame className="w-5 h-5" />}
                  {cmd.id === 'board_drakkar_ballista' && <Ship className="w-5 h-5" />}
                  {cmd.id === 'raid_niflheim_dungeon' && <Skull className="w-5 h-5" />}
                  {cmd.id === 'defend_frostfang_banner' && <Flag className="w-5 h-5" />}
                  {cmd.id === 'claim_starfall_meteor' && <Sparkles className="w-5 h-5" />}
                  {cmd.id === 'rally_on_me' && <Shield className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{cmd.label}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{cmd.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSendTacticalPing(cmd);
                    onClose();
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition cursor-pointer"
                >
                  Ping 3D Beacon & Radar
                </button>

                {cmd.id !== 'rally_on_me' && (
                  <button
                    onClick={() => {
                      onSendTacticalPing(cmd);
                      onTeleportToPing(cmd.x, cmd.z, cmd.label);
                      onClose();
                    }}
                    className="py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sky-300 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                    title="Ping & Teleport to Objective"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Ping & Go</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
