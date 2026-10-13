import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  LogOut,
  Play,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  Crosshair,
  Activity,
  Sliders,
  Shield,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface RobloxEscMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onResetCharacter: () => void;
  onLeaveGame: () => void;
  isShiftLocked: boolean;
  onToggleShiftLock: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onChangeVolume: (val: number) => void;
  mouseSensitivity: number;
  onChangeSensitivity: (val: number) => void;
  showPerfStats: boolean;
  onTogglePerfStats: () => void;
  currentCheckpointName: string;
}

export const RobloxEscMenu: React.FC<RobloxEscMenuProps> = ({
  isOpen,
  onClose,
  onResetCharacter,
  onLeaveGame,
  isShiftLocked,
  onToggleShiftLock,
  isMuted,
  onToggleMute,
  volume,
  onChangeVolume,
  mouseSensitivity,
  onChangeSensitivity,
  showPerfStats,
  onTogglePerfStats,
  currentCheckpointName,
}) => {
  const [activeTab, setActiveTab] = useState<'game' | 'settings' | 'help'>('game');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Esc key listener to toggle menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Escape') {
        if (showResetConfirm) {
          setShowResetConfirm(false);
        } else if (showLeaveConfirm) {
          setShowLeaveConfirm(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showResetConfirm, showLeaveConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none font-sans animate-in fade-in duration-150">
      {/* Reset Character Confirmation Modal */}
      {showResetConfirm && (
        <div className="absolute z-60 w-full max-w-sm bg-[#1e2024] border border-neutral-700 rounded-xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-950/80 border border-red-700/80 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Reset Character?
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Your Viking will ragdoll break-apart and respawn at{' '}
              <span className="text-amber-400 font-semibold">{currentCheckpointName}</span> with full health.
            </p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => {
                setShowResetConfirm(false);
                onResetCharacter();
                onClose();
              }}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-lg text-sm shadow transition cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-neutral-300 font-bold rounded-lg text-sm transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Leave Game Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="absolute z-60 w-full max-w-sm bg-[#1e2024] border border-neutral-700 rounded-xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
          <div className="w-12 h-12 mx-auto rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Leave Game?
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Are you sure you want to exit to the Viking Landing Page? All your Katfjord progress and coins are saved.
            </p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => {
                setShowLeaveConfirm(false);
                onLeaveGame();
                onClose();
              }}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-sm shadow transition cursor-pointer"
            >
              Leave
            </button>
            <button
              onClick={() => setShowLeaveConfirm(false)}
              className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-lg text-sm transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Roblox Esc Window */}
      <div className="w-full max-w-md bg-[#191b1d]/95 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header / Tabs */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111214] border-b border-neutral-800">
          <div className="flex items-center gap-1">
            {/* Classic Roblox Tilted Logo */}
            <div className="w-6 h-6 rounded bg-neutral-800 border border-neutral-600 flex items-center justify-center transform -rotate-12 mr-2">
              <div className="w-2.5 h-2.5 bg-white rounded-xs transform rotate-12" />
            </div>

            <button
              onClick={() => setActiveTab('game')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'game'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              Game
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'help'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              Help
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Resume Game (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 space-y-4">
          {/* TAB 1: GAME (Classic Resume, Reset Character, Leave Game) */}
          {activeTab === 'game' && (
            <div className="space-y-3">
              {/* Checkpoint status */}
              <div className="px-3.5 py-2.5 bg-[#23262a] rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-neutral-400">Current Spawn:</span>
                </div>
                <span className="font-bold text-amber-400">{currentCheckpointName}</span>
              </div>

              {/* Resume Game */}
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume Game
              </button>

              {/* Reset Character */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 px-4 bg-[#282c30] hover:bg-[#343a40] active:bg-[#1e2024] text-red-400 hover:text-red-300 font-bold rounded-xl text-sm border border-red-900/40 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Character (Oof!)
              </button>

              {/* Leave Game */}
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="w-full py-3 px-4 bg-[#23262a] hover:bg-[#2e3238] active:bg-[#1c1e21] text-neutral-300 hover:text-white font-bold rounded-xl text-sm border border-neutral-800 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Leave Game
              </button>
            </div>
          )}

          {/* TAB 2: SETTINGS (Shift Lock, Sensitivity, Audio, Performance) */}
          {activeTab === 'settings' && (
            <div className="space-y-4 text-xs">
              {/* Shift Lock Switch */}
              <div className="flex items-center justify-between p-3 bg-[#23262a] rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold text-white">Shift Lock Switch</div>
                    <div className="text-[10px] text-neutral-400">
                      Over-the-shoulder camera & mouse aim lock
                    </div>
                  </div>
                </div>
                <button
                  onClick={onToggleShiftLock}
                  className={`px-3 py-1 rounded-full font-bold text-xs transition cursor-pointer ${
                    isShiftLocked
                      ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {isShiftLocked ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Mouse Camera Sensitivity */}
              <div className="p-3 bg-[#23262a] rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Camera Sensitivity</span>
                  </div>
                  <span className="font-mono text-amber-400">
                    {Math.round(mouseSensitivity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={mouseSensitivity}
                  onChange={(e) => onChangeSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Sound & Master Volume */}
              <div className="p-3 bg-[#23262a] rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-2">
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Sound Volume</span>
                  </div>
                  <button
                    onClick={onToggleMute}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  >
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  disabled={isMuted}
                  onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Performance Stats HUD Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#23262a] rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="font-bold text-white">Performance Stats HUD</div>
                    <div className="text-[10px] text-neutral-400">
                      Show FPS, Ping, and Memory bar in top-right
                    </div>
                  </div>
                </div>
                <button
                  onClick={onTogglePerfStats}
                  className={`px-3 py-1 rounded-full font-bold text-xs transition cursor-pointer ${
                    showPerfStats
                      ? 'bg-sky-500 text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {showPerfStats ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: HELP & CONTROLS */}
          {activeTab === 'help' && (
            <div className="space-y-3 text-xs max-h-64 overflow-y-auto pr-1">
              <div className="p-3 bg-[#23262a] rounded-xl border border-neutral-800 space-y-1.5">
                <div className="font-bold text-amber-400">Movement & Combat</div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-300">
                  <div><kbd className="bg-neutral-800 px-1 rounded">W A S D</kbd> : Walk</div>
                  <div><kbd className="bg-neutral-800 px-1 rounded">Shift</kbd> : Sprint / Lock</div>
                  <div><kbd className="bg-neutral-800 px-1 rounded">Space</kbd> : Jump / Double Leap</div>
                  <div><kbd className="bg-neutral-800 px-1 rounded">Click</kbd> : Attack</div>
                  <div><kbd className="bg-neutral-800 px-1 rounded">Right Click</kbd> : Block</div>
                  <div><kbd className="bg-neutral-800 px-1 rounded">Q</kbd> : Whirlwind</div>
                  <div><kbd className="bg-neutral-800 px-1 rounded">E</kbd> : Interact / Mount</div>
                  <div><kbd className="bg-neutral-800 px-1 rounded">1 - 9</kbd> : Equip Tool</div>
                  <div><kbd className="bg-neutral-800 px-1 rounded">~</kbd> : Backpack</div>
                  <div><kbd className="bg-neutral-800 px-1 rounded">Esc</kbd> : Roblox Menu</div>
                </div>
              </div>

              <div className="p-3 bg-[#23262a] rounded-xl border border-neutral-800 space-y-1.5">
                <div className="font-bold text-cyan-400">Chat Slash Commands</div>
                <div className="space-y-1 text-[11px] text-neutral-300 font-mono">
                  <div><span className="text-amber-400">/e dance</span> - Perform Viking dance</div>
                  <div><span className="text-amber-400">/e wave</span> - Wave hello</div>
                  <div><span className="text-amber-400">/e cheer</span> - Raise horn & cheer</div>
                  <div><span className="text-amber-400">/e roar</span> - Berserker roar</div>
                  <div><span className="text-amber-400">/re</span> or <span className="text-amber-400">/reset</span> - Quick Reset</div>
                  <div><span className="text-amber-400">/help</span> - List all chat commands</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#111214] border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Press <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">Esc</kbd> to resume</span>
          <span className="font-semibold text-neutral-300">Storysian: Katfjord Realm</span>
        </div>
      </div>
    </div>
  );
};
