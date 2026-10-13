import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Cpu } from 'lucide-react';

interface RobloxPerfStatsProps {
  isVisible: boolean;
}

export const RobloxPerfStats: React.FC<RobloxPerfStatsProps> = ({ isVisible }) => {
  const [fps, setFps] = useState(60);
  const [ping, setPing] = useState(24);
  const [memMb, setMemMb] = useState(142);

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.min(60, Math.round((frameCount * 1000) / (now - lastTime))));
        frameCount = 0;
        lastTime = now;
        // Jitter ping slightly for realism
        setPing(Math.round(22 + Math.random() * 8));
        // Rough memory stat
        const perf = window.performance as unknown as { memory?: { usedJSHeapSize: number } };
        if (perf?.memory) {
          setMemMb(Math.round(perf.memory.usedJSHeapSize / (1024 * 1024)));
        } else {
          setMemMb(Math.round(135 + Math.sin(now * 0.001) * 10));
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-12 right-3 z-30 pointer-events-none flex items-center gap-2 px-2.5 py-1 bg-neutral-950/85 backdrop-blur-md rounded-lg border border-neutral-800 text-[10px] font-mono shadow-md select-none">
      <div className="flex items-center gap-1">
        <Cpu className="w-3 h-3 text-sky-400" />
        <span className="text-neutral-400">FPS:</span>
        <span className={`font-bold ${fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
          {fps}
        </span>
      </div>
      <span className="text-neutral-600">|</span>
      <div className="flex items-center gap-1">
        <Wifi className="w-3 h-3 text-emerald-400" />
        <span className="text-neutral-400">Ping:</span>
        <span className="font-bold text-neutral-200">{ping}ms</span>
      </div>
      <span className="text-neutral-600">|</span>
      <div className="flex items-center gap-1">
        <Activity className="w-3 h-3 text-purple-400" />
        <span className="text-neutral-400">Mem:</span>
        <span className="font-bold text-neutral-200">{memMb}MB</span>
      </div>
    </div>
  );
};
