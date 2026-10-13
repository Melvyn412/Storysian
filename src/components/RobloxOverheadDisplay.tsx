import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

export interface OverheadBubble {
  id: string;
  sender: string;
  text: string;
  createdAt: number;
}

export interface FloatingDamageNumber {
  id: string;
  text: string;
  color: string;
  worldPos: { x: number; y: number; z: number };
  createdAt: number;
}

interface RobloxOverheadDisplayProps {
  camera: THREE.Camera | null;
  playerPos: { x: number; y: number; z: number };
  playerName: string;
  playerRank: string;
  playerLevel: number;
  health: number;
  maxHealth: number;
  hasSpawnShield: boolean;
  activeBubbles: OverheadBubble[];
  floatingTexts: FloatingDamageNumber[];
}

export const RobloxOverheadDisplay: React.FC<RobloxOverheadDisplayProps> = ({
  camera,
  playerPos,
  playerName,
  playerRank,
  playerLevel,
  health,
  maxHealth,
  hasSpawnShield,
  activeBubbles,
  floatingTexts,
}) => {
  const [screenCoords, setScreenCoords] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Calculate 2D screen coordinates from 3D player position every frame
  useEffect(() => {
    let animId: number;
    const tempVec = new THREE.Vector3();

    const updateProjection = () => {
      if (camera) {
        // Target is directly above the Viking's head (height ~4.2 in world units)
        tempVec.set(playerPos.x, playerPos.y + 4.2, playerPos.z);
        tempVec.project(camera);

        const isBehind = tempVec.z > 1;
        const x = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-tempVec.y * 0.5 + 0.5) * window.innerHeight;

        setScreenCoords({
          x,
          y,
          visible: !isBehind && x >= -50 && x <= window.innerWidth + 50 && y >= -50 && y <= window.innerHeight + 50,
        });
      }
      animId = requestAnimationFrame(updateProjection);
    };

    animId = requestAnimationFrame(updateProjection);
    return () => cancelAnimationFrame(animId);
  }, [camera, playerPos]);

  if (!screenCoords.visible) return null;

  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const healthColor =
    healthPercent > 50
      ? 'bg-emerald-500'
      : healthPercent > 25
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div
      className="fixed pointer-events-none z-20 select-none flex flex-col items-center transform -translate-x-1/2 -translate-y-full"
      style={{
        left: `${screenCoords.x}px`,
        top: `${screenCoords.y}px`,
      }}
    >
      {/* 1. Floating Combat / Event Text (Damage, Healing, OOF!) */}
      <div className="relative w-0 h-0 flex items-center justify-center">
        {floatingTexts.map((ft) => {
          const age = (Date.now() - ft.createdAt) / 1000;
          if (age > 1.8) return null;
          const translateY = -age * 40;
          const opacity = Math.max(0, 1 - age / 1.8);

          return (
            <div
              key={ft.id}
              className="absolute font-black text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap"
              style={{
                color: ft.color,
                transform: `translateY(${translateY}px) scale(${1 + age * 0.2})`,
                opacity,
              }}
            >
              {ft.text}
            </div>
          );
        })}
      </div>

      {/* 2. Classic Cartoon Overhead Speech Bubbles */}
      <div className="flex flex-col items-center space-y-1 mb-2">
        {activeBubbles.map((bubble) => {
          const age = (Date.now() - bubble.createdAt) / 1000;
          if (age > 6) return null;
          const opacity = age > 5 ? 1 - (age - 5) : 1;

          return (
            <div
              key={bubble.id}
              className="relative bg-white text-neutral-900 px-3.5 py-1.5 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.35)] border border-neutral-300 max-w-[220px] sm:max-w-xs text-center transition-opacity duration-300 animate-in zoom-in-95"
              style={{ opacity }}
            >
              <div className="text-xs sm:text-sm font-bold leading-tight break-words font-sans">
                {bubble.text}
              </div>
              {/* Downward triangle pointing towards nametag */}
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-white" />
            </div>
          );
        })}
      </div>

      {/* 3. Roblox Overhead Billboard NameTag */}
      <div className="flex flex-col items-center bg-neutral-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-neutral-700/60 shadow-lg min-w-[110px]">
        {/* Rank & Level Badge */}
        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider leading-none mb-0.5">
          <span className="text-amber-400 drop-shadow">[{playerRank}]</span>
          <span className="text-neutral-400">·</span>
          <span className="text-sky-400 font-mono">Lvl {playerLevel}</span>
        </div>

        {/* Username */}
        <div className="text-xs sm:text-sm font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight flex items-center gap-1">
          <span>{playerName}</span>
          {hasSpawnShield && (
            <span
              className="text-[9px] bg-sky-500/80 text-white px-1 py-0.2 rounded font-bold uppercase tracking-tight animate-pulse"
              title="Spawn Protection Active"
            >
              Shield
            </span>
          )}
        </div>

        {/* Segmented Roblox Health Bar */}
        <div className="w-24 sm:w-28 h-2 bg-neutral-900 rounded-full border border-neutral-600/80 p-0.5 mt-1 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-200 ${healthColor}`}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
