import React from 'react';
import { Crosshair, Zap, Snowflake, Compass, Radio, Skull, TreePine, HelpCircle, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { WEAPON_SKILLS } from '../game/robloxFeaturesConfig';

interface RadarBlip {
  id: string;
  x: number;
  z: number;
  type: 'enemy' | 'boss' | 'ally' | 'ship' | 'obby' | 'tycoon' | 'flag';
}

interface RadarMinimapHUDProps {
  playerX: number;
  playerZ: number;
  cameraYaw: number;
  blips: RadarBlip[];
  isShiftLocked: boolean;
  onToggleShiftLock: () => void;
  skillCooldowns: Record<'whirlwind' | 'thunder_leap' | 'frost_nova', number>;
  onTriggerSkill: (skillId: 'whirlwind' | 'thunder_leap' | 'frost_nova') => void;
  onOpenTacticalWheel?: () => void;
  onEnterNiflheimDungeon?: () => void;
  onOpenYoungVikingRealm?: () => void;
  onOpenHowToPlay?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  cameraMode?: 'third_person' | 'close_look' | 'first_person';
  onCycleCameraMode?: () => void;
}

export const RadarMinimapHUD: React.FC<RadarMinimapHUDProps> = ({
  playerX,
  playerZ,
  cameraYaw,
  blips,
  isShiftLocked,
  onToggleShiftLock,
  skillCooldowns,
  onTriggerSkill,
  onOpenTacticalWheel,
  onEnterNiflheimDungeon,
  onOpenYoungVikingRealm,
  onOpenHowToPlay,
  onZoomIn,
  onZoomOut,
  cameraMode = 'third_person',
  onCycleCameraMode,
}) => {
  const RADAR_RANGE = 140;
  const RADAR_RADIUS_PX = 46;

  return (
    <>
      {/* 1. Top-Right Interactive Radar Minimap & Shift-Lock Toggle */}
      <div className="absolute top-14 right-3 z-25 hidden sm:flex flex-col items-end gap-2 select-none pointer-events-auto">
        <div className="relative w-28 h-28 rounded-full bg-neutral-950/85 backdrop-blur-md border-2 border-neutral-700/90 shadow-2xl overflow-hidden flex items-center justify-center">
          {/* Concentric Radar Rings */}
          <div className="w-18 h-18 rounded-full border border-neutral-800/80 pointer-events-none" />
          <div className="w-9 h-9 rounded-full border border-neutral-800/80 pointer-events-none" />

          {/* Cardinal N Label */}
          <span className="absolute top-1 text-[9px] font-mono font-bold text-amber-400">N</span>

          {/* Camera Gaze Cone */}
          <div
            className="absolute w-full h-full flex items-center justify-center pointer-events-none"
            style={{
              transform: `rotate(${(-cameraYaw * 180) / Math.PI}deg)`,
            }}
          >
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400/25 -translate-y-4" />
          </div>

          {/* Radar Blips */}
          {blips.map((b) => {
            const dx = b.x - playerX;
            const dz = b.z - playerZ;
            const normX = Math.max(-1, Math.min(1, dx / RADAR_RANGE));
            const normZ = Math.max(-1, Math.min(1, dz / RADAR_RANGE));
            const px = normX * RADAR_RADIUS_PX;
            const py = normZ * RADAR_RADIUS_PX;

            let colorClass = 'bg-emerald-400 w-1.5 h-1.5';
            if (b.type === 'boss') colorClass = 'bg-amber-400 w-2.5 h-2.5 ring-2 ring-red-500';
            else if (b.type === 'enemy') colorClass = 'bg-red-500 w-2 h-2';
            else if (b.type === 'ship') colorClass = 'bg-sky-400 w-2 h-2';
            else if (b.type === 'obby') colorClass = 'bg-purple-400 w-2 h-2';
            else if (b.type === 'tycoon') colorClass = 'bg-emerald-300 w-2 h-2';
            else if (b.type === 'flag') colorClass = 'bg-yellow-300 w-2 h-2';

            return (
              <div
                key={b.id}
                className={`absolute rounded-full ${colorClass}`}
                style={{
                  transform: `translate(${px}px, ${py}px)`,
                }}
              />
            );
          })}

          {/* Center Player Dot */}
          <div className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-950 z-10 shadow" />
        </div>

        {/* Shift-Lock Switch Button */}
        <button
          onClick={onToggleShiftLock}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg ${
            isShiftLocked
              ? 'bg-sky-500 border-sky-200 text-neutral-950'
              : 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
          }`}
          title="Toggle Roblox Shift-Lock Over-Shoulder Combat Aim"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>{isShiftLocked ? 'Shift-Lock: ON' : 'Shift-Lock: OFF'}</span>
        </button>

        {/* Camera Zoom & Preset View Controls */}
        <div className="flex items-center gap-1.5 bg-neutral-950/90 border border-neutral-700/80 rounded-lg px-2 py-1 shadow-lg">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-0.5">Zoom</span>
          <button
            onClick={onZoomIn}
            className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-sky-300 font-extrabold text-xs flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Zoom Camera In (Mouse Scroll Up, [ key, or - key)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onZoomOut}
            className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-sky-300 font-extrabold text-xs flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Zoom Camera Out (Mouse Scroll Down, ] key, or + key)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          {onCycleCameraMode && (
            <button
              onClick={onCycleCameraMode}
              className={`px-2 h-6 rounded border text-[9px] font-black uppercase flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                cameraMode === 'first_person'
                  ? 'bg-sky-500 border-sky-300 text-neutral-950 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                  : cameraMode === 'close_look'
                  ? 'bg-amber-500 border-amber-300 text-neutral-950'
                  : 'bg-neutral-800 border-neutral-600 text-amber-300 hover:bg-neutral-700'
              }`}
              title="Cycle Camera View Mode [C]"
            >
              <Eye className="w-2.5 h-2.5" />
              <span>{cameraMode === 'first_person' ? '1ST' : cameraMode === 'close_look' ? 'CLOSE' : '3RD'}</span>
            </button>
          )}
        </div>

        {/* Radial Tactical War-Command Wheel [T] */}
        {onOpenTacticalWheel && (
          <button
            onClick={onOpenTacticalWheel}
            className="px-3 py-1.5 rounded-lg border border-amber-500/60 bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg"
            title="Open Tactical War-Command Wheel [T]"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Command Wheel [T]</span>
          </button>
        )}

        {/* Quick-Warp to Niflheim Dungeon Portal */}
        {onEnterNiflheimDungeon && (
          <button
            onClick={onEnterNiflheimDungeon}
            className="px-3 py-1.5 rounded-lg border border-purple-500/60 bg-purple-950/85 hover:bg-purple-900 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg"
            title="Enter Niflheim Underworld Dungeon Raid"
          >
            <Skull className="w-3.5 h-3.5 text-purple-300" />
            <span>Niflheim Dungeon</span>
          </button>
        )}

        {/* Quick-Warp to Young Viking Meadow Realm */}
        {onOpenYoungVikingRealm && (
          <button
            onClick={onOpenYoungVikingRealm}
            className="px-3 py-1.5 rounded-lg border border-emerald-500/60 bg-emerald-950/85 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg"
            title="Enter Young Viking Forager Meadow Realm [Y]"
          >
            <TreePine className="w-3.5 h-3.5 text-emerald-300" />
            <span>Young Viking [Y]</span>
          </button>
        )}

        {/* How to Play & Keyboard Shortcuts Guide [?] */}
        {onOpenHowToPlay && (
          <button
            onClick={onOpenHowToPlay}
            className="px-3 py-1.5 rounded-lg border border-amber-500/60 bg-amber-950/85 hover:bg-amber-900 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg"
            title="How to Play, WASD & Keyboard Shortcuts [?]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>How to Play [?]</span>
          </button>
        )}
      </div>

      {/* 1b. Mobile Quick Action Pills (Visible on small screens < 640px) */}
      <div className="absolute top-12.5 right-2 z-25 sm:hidden flex items-center gap-1 pointer-events-auto select-none">
        {onOpenYoungVikingRealm && (
          <button
            onClick={onOpenYoungVikingRealm}
            className="px-2 py-1 rounded-lg bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 text-[11px] font-bold flex items-center gap-1 shadow-md active:scale-95 transition"
            title="Young Viking Meadow Realm [Y]"
          >
            <TreePine className="w-3.5 h-3.5 text-emerald-400" />
            <span>Meadow</span>
          </button>
        )}
        {onOpenTacticalWheel && (
          <button
            onClick={onOpenTacticalWheel}
            className="px-2 py-1 rounded-lg bg-amber-950/95 border border-amber-500/60 text-amber-200 text-[11px] font-bold flex items-center gap-1 shadow-md active:scale-95 transition"
            title="Tactical Commands [T]"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Command</span>
          </button>
        )}
        {onOpenHowToPlay && (
          <button
            onClick={onOpenHowToPlay}
            className="px-2 py-1 rounded-lg bg-neutral-900/95 border border-amber-500/50 text-amber-300 text-[11px] font-bold flex items-center gap-1 shadow-md active:scale-95 transition"
            title="How to Play & Controls Guide [?]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Guide</span>
          </button>
        )}
      </div>

      {/* 2. Special Weapon Skills Bar (Z / X / F Abilities above the Hotbar) */}
      <div className="absolute bottom-22 sm:bottom-24 left-1/2 -translate-x-1/2 z-25 flex items-center gap-2 pointer-events-auto select-none">
        {WEAPON_SKILLS.map((sk) => {
          const cd = skillCooldowns[sk.id] || 0;
          const isReady = cd <= 0;

          return (
            <button
              key={sk.id}
              onClick={() => onTriggerSkill(sk.id)}
              onTouchStart={(e) => {
                e.preventDefault();
                onTriggerSkill(sk.id);
              }}
              disabled={!isReady}
              className={`relative px-3 py-1.5 rounded-xl border flex items-center gap-2 transition cursor-pointer shadow-xl ${
                isReady
                  ? 'bg-neutral-900/90 hover:bg-neutral-800 border-amber-500/60 text-white active:scale-95'
                  : 'bg-neutral-950/80 border-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
              title={`${sk.name}: ${sk.description} [${sk.key}]`}
            >
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-amber-300 font-mono text-[10px] font-bold">
                {sk.key}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold">
                {sk.id === 'whirlwind' && <Compass className="w-3.5 h-3.5 text-amber-400" />}
                {sk.id === 'thunder_leap' && <Zap className="w-3.5 h-3.5 text-sky-400" />}
                {sk.id === 'frost_nova' && <Snowflake className="w-3.5 h-3.5 text-cyan-300" />}
                <span className="hidden sm:inline">{sk.name}</span>
                <span className="sm:hidden">{sk.name.split(' ')[0]}</span>
              </div>
              {!isReady && (
                <span className="text-[10px] font-mono tabular-nums text-amber-400">
                  {cd.toFixed(1)}s
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
