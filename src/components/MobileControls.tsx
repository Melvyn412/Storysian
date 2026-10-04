import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Swords,
  Shield,
  ChevronsUp,
  Zap,
  Sparkles,
  Compass,
  RotateCcw,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface MobileControlsProps {
  onDirectionChange: (dir: { forward: boolean; backward: boolean; left: boolean; right: boolean }) => void;
  onAnalogChange?: (vector: { x: number; y: number } | null) => void;
  onSprintChange?: (sprint: boolean) => void;
  onJump: () => void;
  onAttack: () => void;
  onBlock: (blocking: boolean) => void;
  onInteract?: () => void;
  interactionPrompt?: string | null;
  onRecenterCamera?: () => void;
  isBlocking?: boolean;
  onLookChange?: (look: { lookUp: boolean; lookDown: boolean; lookLeft: boolean; lookRight: boolean }) => void;
  onCycleCameraMode?: () => void;
  cameraMode?: 'third_person' | 'close_look' | 'first_person';
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onDirectionChange,
  onAnalogChange,
  onSprintChange,
  onJump,
  onAttack,
  onBlock,
  onInteract,
  interactionPrompt,
  onRecenterCamera,
  isBlocking: externalBlocking = false,
  onLookChange,
  onCycleCameraMode,
  cameraMode = 'third_person',
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);
  const [isSprintLocked, setIsSprintLocked] = useState(false);
  const [internalBlocking, setInternalBlocking] = useState(false);
  const touchIdRef = useRef<number | null>(null);
  const isMouseDraggingJoystickRef = useRef<boolean>(false);

  // Active look directional state for visual feedback
  const [lookState, setLookState] = useState({
    lookUp: false,
    lookDown: false,
    lookLeft: false,
    lookRight: false,
  });

  const updateLookDir = useCallback(
    (patch: Partial<typeof lookState>) => {
      setLookState((prev) => {
        const next = { ...prev, ...patch };
        if (onLookChange) onLookChange(next);
        return next;
      });
    },
    [onLookChange]
  );

  const clearLookDir = useCallback(() => {
    const reset = { lookUp: false, lookDown: false, lookLeft: false, lookRight: false };
    setLookState(reset);
    if (onLookChange) onLookChange(reset);
  }, [onLookChange]);

  const effectiveBlocking = externalBlocking || internalBlocking;

  // Max radius for joystick thumb movement (pixels)
  const MAX_RADIUS = 46;
  const SPRINT_THRESHOLD = 34; // past this radius, auto-sprint kicks in

  const applyJoystickCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickBaseRef.current) return;
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist > MAX_RADIUS) {
        dx = (dx / dist) * MAX_RADIUS;
        dy = (dy / dist) * MAX_RADIUS;
      }

      setKnobPos({ x: dx, y: dy });

      const normX = dx / MAX_RADIUS;
      const normY = -dy / MAX_RADIUS; // up is positive Y in game space

      const mag = Math.hypot(normX, normY);
      const isSprint = isSprintLocked || mag > SPRINT_THRESHOLD / MAX_RADIUS;
      if (onSprintChange) onSprintChange(isSprint);

      if (onAnalogChange) onAnalogChange({ x: normX, y: normY });

      // Digital fallback
      const DEADZONE = 0.22;
      onDirectionChange({
        forward: normY > DEADZONE,
        backward: normY < -DEADZONE,
        right: normX > DEADZONE,
        left: normX < -DEADZONE,
      });
    },
    [MAX_RADIUS, SPRINT_THRESHOLD, isSprintLocked, onAnalogChange, onDirectionChange, onSprintChange]
  );

  const resetJoystick = useCallback(() => {
    setIsDraggingJoystick(false);
    setKnobPos({ x: 0, y: 0 });
    if (onAnalogChange) onAnalogChange(null);
    if (onSprintChange && !isSprintLocked) onSprintChange(false);
    onDirectionChange({
      forward: false,
      backward: false,
      left: false,
      right: false,
    });
  }, [isSprintLocked, onAnalogChange, onDirectionChange, onSprintChange]);

  const handleJoystickStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (touchIdRef.current !== null) return; // already tracking a touch
      const touch = e.changedTouches[0];
      touchIdRef.current = touch.identifier;
      setIsDraggingJoystick(true);
      applyJoystickCoords(touch.clientX, touch.clientY);
    },
    [applyJoystickCoords]
  );

  const handleJoystickMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      isMouseDraggingJoystickRef.current = true;
      setIsDraggingJoystick(true);
      applyJoystickCoords(e.clientX, e.clientY);
    },
    [applyJoystickCoords]
  );

  const handleJoystickMove = useCallback(
    (e: TouchEvent) => {
      if (touchIdRef.current === null || !joystickBaseRef.current) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchIdRef.current) {
          applyJoystickCoords(touch.clientX, touch.clientY);
          break;
        }
      }
    },
    [applyJoystickCoords]
  );

  const handleJoystickEnd = useCallback(
    (e: TouchEvent) => {
      if (touchIdRef.current === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchIdRef.current) {
          touchIdRef.current = null;
          resetJoystick();
          break;
        }
      }
    },
    [resetJoystick]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDraggingJoystickRef.current) return;
      applyJoystickCoords(e.clientX, e.clientY);
    };
    const handleMouseUp = () => {
      if (isMouseDraggingJoystickRef.current) {
        isMouseDraggingJoystickRef.current = false;
        resetJoystick();
      }
      clearLookDir();
    };

    window.addEventListener('touchmove', handleJoystickMove, { passive: false });
    window.addEventListener('touchend', handleJoystickEnd);
    window.addEventListener('touchcancel', handleJoystickEnd);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('touchmove', handleJoystickMove);
      window.removeEventListener('touchend', handleJoystickEnd);
      window.removeEventListener('touchcancel', handleJoystickEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleJoystickMove, handleJoystickEnd, applyJoystickCoords, resetJoystick, clearLookDir]);

  // Haptic feedback trigger helper
  const triggerHaptic = (ms = 20) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        // Ignore devices that block vibration
      }
    }
  };

  // Toggle sprint lock
  const handleToggleSprintLock = () => {
    const next = !isSprintLocked;
    setIsSprintLocked(next);
    if (onSprintChange) onSprintChange(next);
    triggerHaptic(25);
  };

  // Extract short action verb for dynamic interact prompt button
  const getPromptLabel = () => {
    if (!interactionPrompt) return 'ACTION';
    const lower = interactionPrompt.toLowerCase();
    if (lower.includes('chop')) return 'CHOP';
    if (lower.includes('mine')) return 'MINE';
    if (lower.includes('board') || lower.includes('sail')) return 'SAIL';
    if (lower.includes('talk')) return 'TALK';
    if (lower.includes('horn') || lower.includes('blow')) return 'HORN';
    if (lower.includes('relic') || lower.includes('loot')) return 'LOOT';
    if (lower.includes('drink')) return 'DRINK';
    if (lower.includes('build')) return 'BUILD';
    return 'INTERACT';
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none select-none touch-none">
      {/* 1. Left Thumb Virtual Analog Joystick */}
      <div className="absolute bottom-6 left-4 sm:bottom-8 sm:left-8 pointer-events-auto flex flex-col items-center">
        {/* Joystick Base */}
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickStart}
          onMouseDown={handleJoystickMouseDown}
          className={`w-32 h-32 rounded-full relative flex items-center justify-center transition-shadow duration-200 border-2 select-none touch-none cursor-grab active:cursor-grabbing ${
            isDraggingJoystick
              ? 'bg-black/50 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.35)] backdrop-blur-md'
              : 'bg-black/35 border-neutral-600/60 shadow-xl backdrop-blur-sm'
          }`}
        >
          {/* Compass & Rune Cardinal Marks */}
          <div className="absolute top-1.5 text-[9px] font-mono font-bold text-amber-400/80 tracking-widest">
            ▲
          </div>
          <div className="absolute bottom-1.5 text-[9px] font-mono font-bold text-neutral-400/60">
            ▼
          </div>
          <div className="absolute left-1.5 text-[9px] font-mono font-bold text-neutral-400/60">
            ◀
          </div>
          <div className="absolute right-1.5 text-[9px] font-mono font-bold text-neutral-400/60">
            ▶
          </div>

          {/* Inner Guidance Ring */}
          <div className="w-16 h-16 rounded-full border border-dashed border-white/20 pointer-events-none" />

          {/* Floating Thumb Knob */}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-75 border-2 shadow-2xl cursor-pointer ${
              isDraggingJoystick
                ? 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-200 text-neutral-950 scale-105 shadow-[0_0_18px_rgba(245,158,11,0.7)]'
                : 'bg-neutral-800/90 border-neutral-500/80 text-neutral-300'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          >
            <Compass
              className={`w-7 h-7 transition-colors duration-150 ${
                isDraggingJoystick ? 'text-neutral-950 animate-spin-slow' : 'text-amber-400/70'
              }`}
            />
          </div>
        </div>

        {/* Joystick Label / Sprint Status */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            {isSprintLocked ? (
              <span className="text-amber-400 font-extrabold flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-amber-400" /> SPRINT LOCKED
              </span>
            ) : isDraggingJoystick && Math.hypot(knobPos.x, knobPos.y) > SPRINT_THRESHOLD ? (
              <span className="text-cyan-300 font-extrabold flex items-center gap-0.5 animate-pulse">
                <Zap className="w-3 h-3 fill-cyan-400" /> RUNNING
              </span>
            ) : (
              'MOVE'
            )}
          </span>
        </div>
      </div>

      {/* 2. Right Thumb Action Arcade Cluster + Look Up & Around Gimbal */}
      <div className="absolute bottom-6 right-4 sm:bottom-8 sm:right-8 pointer-events-auto flex flex-col items-end gap-2.5 select-none touch-none">
        {/* Viking Look Up & Around D-Pad (Works with Mouse Hold/Click & Touch) */}
        <div className="flex flex-col items-center bg-neutral-950/75 backdrop-blur-md border border-amber-500/40 rounded-2xl p-1.5 shadow-xl">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300/90 mb-1">
            Look Up & Around
          </span>
          {/* Look Up Button */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              updateLookDir({ lookUp: true });
            }}
            onMouseUp={() => updateLookDir({ lookUp: false })}
            onMouseLeave={() => updateLookDir({ lookUp: false })}
            onTouchStart={(e) => {
              e.preventDefault();
              updateLookDir({ lookUp: true });
              triggerHaptic(12);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              updateLookDir({ lookUp: false });
            }}
            className={`w-9 h-7 rounded-t-lg border flex items-center justify-center transition cursor-pointer ${
              lookState.lookUp
                ? 'bg-amber-500 border-amber-200 text-neutral-950 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                : 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700 text-amber-300'
            }`}
            title="Look Up at Sky & Mountains (Hold or press I)"
          >
            <ChevronUp className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Middle Row: Look Left, Camera View Mode Toggle, Look Right */}
          <div className="flex items-center gap-1 my-0.5">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                updateLookDir({ lookLeft: true });
              }}
              onMouseUp={() => updateLookDir({ lookLeft: false })}
              onMouseLeave={() => updateLookDir({ lookLeft: false })}
              onTouchStart={(e) => {
                e.preventDefault();
                updateLookDir({ lookLeft: true });
                triggerHaptic(12);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                updateLookDir({ lookLeft: false });
              }}
              className={`w-7 h-8 rounded-l-lg border flex items-center justify-center transition cursor-pointer ${
                lookState.lookLeft
                  ? 'bg-amber-500 border-amber-200 text-neutral-950 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                  : 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700 text-amber-300'
              }`}
              title="Look Left Around Setting (Hold or press J)"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Center Button: Cycle Camera View (3rd Person / Close / 1st Person Viking Eye View) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                if (onCycleCameraMode) onCycleCameraMode();
                triggerHaptic(20);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (onCycleCameraMode) onCycleCameraMode();
                triggerHaptic(20);
              }}
              className={`w-9 h-8 rounded-md border flex flex-col items-center justify-center transition cursor-pointer ${
                cameraMode === 'first_person'
                  ? 'bg-sky-500 border-sky-200 text-neutral-950 font-black shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                  : cameraMode === 'close_look'
                  ? 'bg-amber-500/90 border-amber-200 text-neutral-950 font-black'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-600 text-sky-300'
              }`}
              title="Switch Camera View: 3rd Person / Close / Viking Eye View [C]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[7px] font-black uppercase leading-none mt-0.5">
                {cameraMode === 'first_person' ? 'EYE' : cameraMode === 'close_look' ? 'CLOSE' : '3RD'}
              </span>
            </button>

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                updateLookDir({ lookRight: true });
              }}
              onMouseUp={() => updateLookDir({ lookRight: false })}
              onMouseLeave={() => updateLookDir({ lookRight: false })}
              onTouchStart={(e) => {
                e.preventDefault();
                updateLookDir({ lookRight: true });
                triggerHaptic(12);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                updateLookDir({ lookRight: false });
              }}
              className={`w-7 h-8 rounded-r-lg border flex items-center justify-center transition cursor-pointer ${
                lookState.lookRight
                  ? 'bg-amber-500 border-amber-200 text-neutral-950 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                  : 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700 text-amber-300'
              }`}
              title="Look Right Around Setting (Hold or press L)"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Look Down Button */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              updateLookDir({ lookDown: true });
            }}
            onMouseUp={() => updateLookDir({ lookDown: false })}
            onMouseLeave={() => updateLookDir({ lookDown: false })}
            onTouchStart={(e) => {
              e.preventDefault();
              updateLookDir({ lookDown: true });
              triggerHaptic(12);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              updateLookDir({ lookDown: false });
            }}
            className={`w-9 h-7 rounded-b-lg border flex items-center justify-center transition cursor-pointer ${
              lookState.lookDown
                ? 'bg-amber-500 border-amber-200 text-neutral-950 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                : 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700 text-amber-300'
            }`}
            title="Look Down (Hold or press K)"
          >
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Top Action Row: Sprint Lock, Camera Recenter, and Dynamic Interact */}
        <div className="flex items-center gap-2">
          {/* Recenter Camera Button */}
          {onRecenterCamera && (
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onRecenterCamera();
                triggerHaptic(15);
              }}
              onClick={onRecenterCamera}
              className="w-10 h-10 rounded-full bg-neutral-900/80 active:bg-neutral-700 border border-neutral-700 text-neutral-300 flex items-center justify-center shadow-lg active:scale-95 transition"
              title="Recenter Camera Behind Character"
            >
              <RotateCcw className="w-4 h-4 text-neutral-300" />
            </button>
          )}

          {/* Sprint Lock / Boost Toggle Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleToggleSprintLock();
            }}
            onClick={handleToggleSprintLock}
            className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-lg active:scale-95 transition ${
              isSprintLocked
                ? 'bg-amber-500 border-amber-300 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.6)] font-black'
                : 'bg-neutral-900/85 border-neutral-700 text-neutral-300 hover:border-amber-400/50'
            }`}
            title="Lock Sprint on/off"
          >
            <Zap className={`w-5 h-5 ${isSprintLocked ? 'fill-neutral-950 text-neutral-950' : 'text-amber-400'}`} />
          </button>

          {/* Dynamic Interaction Button [E] (Chop, Mine, Sail, Talk, Loot) */}
          {onInteract && (
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onInteract();
                triggerHaptic(30);
              }}
              onClick={onInteract}
              className={`px-3 h-11 rounded-full border-2 flex items-center gap-1.5 shadow-xl active:scale-95 transition ${
                interactionPrompt
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-300 text-neutral-950 animate-pulse font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.7)]'
                  : 'bg-neutral-900/85 border-neutral-700 text-amber-300 hover:border-amber-500/60'
              }`}
              title="Interact with world object or NPC (E)"
            >
              <Sparkles className={`w-4 h-4 ${interactionPrompt ? 'text-neutral-950' : 'text-amber-400'}`} />
              <span className="text-[11px] font-bold tracking-wide">{getPromptLabel()}</span>
            </button>
          )}
        </div>

        {/* Secondary Row: Shield Block & Jump */}
        <div className="flex items-center gap-3">
          {/* Shield Block Button (Touch & Hold or Tap) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              setInternalBlocking(true);
              onBlock(true);
              triggerHaptic(20);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              setInternalBlocking(false);
              onBlock(false);
            }}
            onMouseDown={() => {
              setInternalBlocking(true);
              onBlock(true);
            }}
            onMouseUp={() => {
              setInternalBlocking(false);
              onBlock(false);
            }}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition active:scale-95 shadow-xl ${
              effectiveBlocking
                ? 'bg-cyan-500 border-cyan-200 text-neutral-950 ring-4 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.8)] scale-105'
                : 'bg-cyan-900/80 active:bg-cyan-600 border-cyan-400/60 text-cyan-200'
            }`}
            title="Raise Shield (Hold to Block)"
          >
            <Shield className={`w-6 h-6 ${effectiveBlocking ? 'fill-neutral-950 text-neutral-950' : 'text-cyan-300'}`} />
            <span className="text-[9px] font-extrabold tracking-tight leading-none mt-0.5">
              {effectiveBlocking ? 'BLOCKING' : 'BLOCK'}
            </span>
          </button>

          {/* Jump Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onJump();
              triggerHaptic(15);
            }}
            onClick={onJump}
            className="w-14 h-14 rounded-full bg-neutral-800/90 active:bg-amber-600 border-2 border-neutral-600 active:border-amber-300 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition"
            title="Jump over obstacles (Space)"
          >
            <ChevronsUp className="w-6 h-6 text-amber-300" />
            <span className="text-[9px] font-extrabold tracking-tight leading-none mt-0.5">JUMP</span>
          </button>
        </div>

        {/* Primary Action Button: Big Attack / Strike Weapon Button */}
        <div className="relative">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onAttack();
              triggerHaptic(35);
            }}
            onClick={onAttack}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-amber-700 active:from-red-500 active:to-amber-500 text-white flex flex-col items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] active:shadow-[0_0_40px_rgba(245,158,11,0.8)] border-3 border-amber-400/90 active:scale-90 transition duration-75 cursor-pointer"
            title="Attack / Cleave Weapon (Left Click)"
          >
            <Swords className="w-9 h-9 sm:w-10 sm:h-10 text-amber-100 drop-shadow animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-amber-200 uppercase mt-0.5">
              STRIKE
            </span>
          </button>

          {/* Glowing Weapon Aura */}
          <div className="absolute inset-0 rounded-full border border-amber-300/40 pointer-events-none animate-ping opacity-25" />
        </div>
      </div>
    </div>
  );
};
