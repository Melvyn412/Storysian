import React from 'react';

interface RobloxShiftLockReticleProps {
  isShiftLocked: boolean;
}

export const RobloxShiftLockReticle: React.FC<RobloxShiftLockReticleProps> = ({
  isShiftLocked,
}) => {
  if (!isShiftLocked) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center select-none">
      {/* Classic Roblox Shift-Lock Reticle (Small circle with center dot) */}
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="w-5 h-5 rounded-full border border-white/70 shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-in zoom-in-75 duration-100" />
        {/* Center Dot */}
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.9)]" />
      </div>

      {/* Floating Mode indicator in corner */}
      <div className="absolute bottom-16 right-4 px-2 py-0.5 rounded bg-neutral-900/80 border border-neutral-700/80 text-[10px] font-bold text-emerald-400">
        Shift-Lock: Active
      </div>
    </div>
  );
};
