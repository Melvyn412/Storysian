import React from 'react';
import { FloatingCombatNumber } from '../types';

interface FloatingCombatTextHUDProps {
  floatingNumbers: FloatingCombatNumber[];
}

export const FloatingCombatTextHUD: React.FC<FloatingCombatTextHUDProps> = ({ floatingNumbers }) => {
  if (!floatingNumbers || floatingNumbers.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-35 overflow-hidden">
      {floatingNumbers
        .filter((num): num is FloatingCombatNumber => Boolean(num && typeof num === 'object'))
        .map((num) => {
          const age = (Date.now() - (num.createdAt || Date.now())) / 1000;
          const opacity = Math.max(0, 1 - age / 1.1);
          const yOffset = age * 65; // Floats upwards

          return (
            <div
              key={num.id || `f_${Math.random()}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 font-black tracking-wider transition-opacity drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              style={{
                left: `${num.x ?? 50}%`,
                top: `calc(${num.y ?? 50}% - ${yOffset}px)`,
                opacity,
                color: num.color || '#fbbf24',
                fontSize: num.isCrit ? '22px' : num.isBlock ? '15px' : '17px',
                fontFamily: 'system-ui, sans-serif',
                transform: `scale(${num.isCrit ? 1.25 : 1})`,
              }}
            >
              {num.text || ''}
            </div>
          );
        })}
    </div>
  );
};
