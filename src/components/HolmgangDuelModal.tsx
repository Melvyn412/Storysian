import React, { useState } from 'react';
import { X, Swords, Shield, Zap, Flame, Trophy, Award, RotateCcw } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Challenger {
  id: string;
  name: string;
  title: string;
  style: string;
  maxHp: number;
  avatarColor: string;
  attackPower: number;
}

const CHALLENGERS: Challenger[] = [
  {
    id: 'einar',
    name: 'Einar Bonebreaker',
    title: 'Katfjord Great-Axe Berserker',
    style: 'Crushing Heavy Cleaves & Unstoppable Rage',
    maxHp: 280,
    avatarColor: 'from-amber-600 to-red-700',
    attackPower: 45,
  },
  {
    id: 'astrid',
    name: 'Astrid Shieldmaiden',
    title: 'Frostfang Shield-Wall Veteran',
    style: 'Impenetrable Iron Blocks & Counter Thrusts',
    maxHp: 260,
    avatarColor: 'from-sky-600 to-indigo-700',
    attackPower: 38,
  },
  {
    id: 'thorald',
    name: 'Thorald Bloodaxe',
    title: 'Ironside Dual-Hatchet Champion',
    style: 'Flurry Strikes & Whirlwind Feints',
    maxHp: 240,
    avatarColor: 'from-purple-600 to-red-800',
    attackPower: 42,
  },
];

interface HolmgangDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  silver: number;
  valor: number;
  onDuelVictory: (silverReward: number, valorReward: number, opponentName: string) => void;
}

export const HolmgangDuelModal: React.FC<HolmgangDuelModalProps> = ({
  isOpen,
  onClose,
  silver,
  valor,
  onDuelVictory,
}) => {
  const [selectedChallenger, setSelectedChallenger] = useState<Challenger>(CHALLENGERS[0]);
  const [inFight, setInFight] = useState(false);
  const [playerHp, setPlayerHp] = useState(250);
  const [opponentHp, setOpponentHp] = useState(280);
  const [playerWins, setPlayerWins] = useState(0);
  const [opponentWins, setOpponentWins] = useState(0);
  const [round, setRound] = useState(1);
  const [isBerserkBuffed, setIsBerserkBuffed] = useState(false);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [matchOver, setMatchOver] = useState<'victory' | 'defeat' | null>(null);

  if (!isOpen) return null;

  const startDuel = (challenger: Challenger) => {
    setSelectedChallenger(challenger);
    setPlayerHp(250);
    setOpponentHp(challenger.maxHp);
    setPlayerWins(0);
    setOpponentWins(0);
    setRound(1);
    setInFight(true);
    setMatchOver(null);
    setIsBerserkBuffed(false);
    setCombatLogs([
      `⚔️ Holmgang commences! The consecrated hazel ring is sealed against ${challenger.name}.`,
    ]);
    sound.playWarHorn();
  };

  const handlePlayerMove = (move: 'heavy' | 'bash' | 'berserk' | 'feint') => {
    if (!inFight || matchOver) return;

    let pDmg = 0;
    let logMsg = '';

    if (move === 'heavy') {
      pDmg = Math.round((42 + Math.random() * 24) * (isBerserkBuffed ? 1.4 : 1));
      logMsg = `🗡️ You delivered a Mighty Cleave for ${pDmg} DMG!`;
      sound.playAxeSwing();
      sound.playHitImpact(true);
    } else if (move === 'bash') {
      pDmg = Math.round(28 + Math.random() * 16);
      logMsg = `🛡️ You bashed with your boss-shield for ${pDmg} DMG, disrupting their guard!`;
      sound.playShieldBlock();
    } else if (move === 'berserk') {
      setIsBerserkBuffed(true);
      setPlayerHp((prev) => Math.min(250, prev + 25));
      logMsg = `🔥 You roared a Berserker Battle Cry! (+25 HP & +40% next strike DMG)`;
      sound.playFanfare();
    } else if (move === 'feint') {
      pDmg = Math.round(35 + Math.random() * 18);
      logMsg = `⚡ You feinted low and slashed high for ${pDmg} DMG!`;
      sound.playAxeSwing();
    }

    if (move !== 'berserk') {
      setIsBerserkBuffed(false);
    }

    const nextOppHp = Math.max(0, opponentHp - pDmg);
    setOpponentHp(nextOppHp);

    if (nextOppHp <= 0) {
      // Player won this round
      sound.playCrowdCheer();
      const nextPWins = playerWins + 1;
      setPlayerWins(nextPWins);

      if (nextPWins >= 2) {
        // Match victory!
        setMatchOver('victory');
        setInFight(false);
        setCombatLogs((prev) => [
          `🏆 VICTORY! You vanquished ${selectedChallenger.name} in the Holmgang!`,
          logMsg,
          ...prev,
        ]);
        onDuelVictory(400, 300, selectedChallenger.name);
        return;
      } else {
        // Next round
        setRound((prev) => prev + 1);
        setPlayerHp(250);
        setOpponentHp(selectedChallenger.maxHp);
        setCombatLogs((prev) => [
          `👑 Round ${round} won! Prepare for Round ${round + 1}!`,
          logMsg,
          ...prev,
        ]);
        return;
      }
    }

    // Opponent counter-attack
    const isStunned = move === 'bash' && Math.random() < 0.45;
    if (isStunned) {
      setCombatLogs((prev) => [
        `💫 ${selectedChallenger.name} was stunned by your shield bash and missed their strike!`,
        logMsg,
        ...prev,
      ]);
    } else {
      const oDmg = Math.round(selectedChallenger.attackPower * (0.8 + Math.random() * 0.4));
      const nextPlayerHp = Math.max(0, playerHp - oDmg);
      setPlayerHp(nextPlayerHp);

      if (nextPlayerHp <= 0) {
        // Opponent won round
        const nextOWins = opponentWins + 1;
        setOpponentWins(nextOWins);

        if (nextOWins >= 2) {
          setMatchOver('defeat');
          setInFight(false);
          setCombatLogs((prev) => [
            `💀 DEFEAT! ${selectedChallenger.name} drove you from the sacred hazel ring.`,
            `💥 ${selectedChallenger.name} struck you for ${oDmg} DMG!`,
            logMsg,
            ...prev,
          ]);
          return;
        } else {
          setRound((prev) => prev + 1);
          setPlayerHp(250);
          setOpponentHp(selectedChallenger.maxHp);
          setCombatLogs((prev) => [
            `⚠️ Round ${round} lost! Brace for Round ${round + 1}!`,
            `💥 ${selectedChallenger.name} struck for ${oDmg} DMG!`,
            logMsg,
            ...prev,
          ]);
          return;
        }
      } else {
        setCombatLogs((prev) => [
          `💥 ${selectedChallenger.name} retaliated for ${oDmg} DMG!`,
          logMsg,
          ...prev,
        ]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-3xl bg-neutral-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-amber-300 font-['Cinzel',serif] flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <span>Holmgang 1v1 Consecrated Dueling Ring</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Sacred Norse duel on the coastal bluff ringed by ancient runestones and hazel cords
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!inFight && !matchOver ? (
            // Select Challenger
            <div className="space-y-4">
              <div className="text-sm font-bold text-amber-200">
                Choose a Rival Clan Champion to Challenge:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {CHALLENGERS.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 transition flex flex-col justify-between gap-3 shadow-md"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.avatarColor} flex items-center justify-center shadow-lg mb-2`}>
                        <Swords className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-white font-['Cinzel',serif]">{c.name}</h4>
                      <p className="text-xs text-amber-400/90">{c.title}</p>
                      <p className="text-[11px] text-neutral-400 mt-1">{c.style}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-neutral-800">
                      <div className="flex justify-between text-xs text-neutral-300">
                        <span>Max Stamina/HP:</span>
                        <span className="font-mono text-white font-bold">{c.maxHp} HP</span>
                      </div>
                      <button
                        onClick={() => startDuel(c)}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Issue Holmgang Challenge</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                <div className="font-bold text-neutral-300 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Holmgang Rules of Norse Honor:</span>
                </div>
                <p>• Best 2 out of 3 rounds inside the consecrated circle.</p>
                <p>• Yielding or leaving the ring forfeits honor and silver wagers.</p>
                <p>• Victor receives +400 Silver, +300 Valor, and the Holmgang Honor Laurel.</p>
              </div>
            </div>
          ) : (
            // Active Fight Arena
            <div className="space-y-5">
              {/* Score & Round Indicator */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Round {round} of 3
                </div>
                <div className="flex items-center gap-3 font-mono text-base font-bold">
                  <span className="text-emerald-400">You: {playerWins}</span>
                  <span className="text-neutral-500">-</span>
                  <span className="text-red-400">{selectedChallenger.name}: {opponentWins}</span>
                </div>
                <div className="text-xs text-amber-300 font-semibold">
                  Best of 3 Rounds
                </div>
              </div>

              {/* Combatants Dual HP Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Player Health */}
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">Your Viking Champion</span>
                    <span className="font-mono text-emerald-400 tabular-nums">{playerHp} / 250 HP</span>
                  </div>
                  <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (playerHp / 250) * 100))}%` }}
                    />
                  </div>
                  {isBerserkBuffed && (
                    <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span>Berserk Aura Active (+40% next strike!)</span>
                    </div>
                  )}
                </div>

                {/* Opponent Health */}
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{selectedChallenger.name}</span>
                    <span className="font-mono text-red-400 tabular-nums">
                      {opponentHp} / {selectedChallenger.maxHp} HP
                    </span>
                  </div>
                  <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (opponentHp / selectedChallenger.maxHp) * 100))}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-neutral-400">{selectedChallenger.title}</div>
                </div>
              </div>

              {/* Duel Actions or Result */}
              {!matchOver ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => handlePlayerMove('heavy')}
                    className="p-3 rounded-xl bg-gradient-to-br from-amber-950 to-neutral-900 border border-amber-500/50 hover:border-amber-400 text-left transition shadow-md cursor-pointer flex flex-col justify-between gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Mighty Cleave</span>
                      <Swords className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-[10px] text-neutral-400">Heavy greataxe chop · 42-66 DMG</span>
                  </button>

                  <button
                    onClick={() => handlePlayerMove('bash')}
                    className="p-3 rounded-xl bg-gradient-to-br from-sky-950 to-neutral-900 border border-sky-500/50 hover:border-sky-400 text-left transition shadow-md cursor-pointer flex flex-col justify-between gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Shield Bash</span>
                      <Shield className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-[10px] text-neutral-400">Boss strike · Stuns opponent</span>
                  </button>

                  <button
                    onClick={() => handlePlayerMove('feint')}
                    className="p-3 rounded-xl bg-gradient-to-br from-orange-950 to-neutral-900 border border-orange-500/50 hover:border-orange-400 text-left transition shadow-md cursor-pointer flex flex-col justify-between gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Quick Feint</span>
                      <Zap className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-[10px] text-neutral-400">Rapid low slash · 35-53 DMG</span>
                  </button>

                  <button
                    onClick={() => handlePlayerMove('berserk')}
                    className="p-3 rounded-xl bg-gradient-to-br from-red-950 to-neutral-900 border border-red-500/50 hover:border-red-400 text-left transition shadow-md cursor-pointer flex flex-col justify-between gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Battle Roar</span>
                      <Flame className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-[10px] text-neutral-400">+25 HP &amp; +40% next strike DMG</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-neutral-900 border border-amber-500/50 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-base font-bold text-amber-300">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>
                      {matchOver === 'victory'
                        ? 'Holmgang Conquered! Honor Laurel Claimed!'
                        : 'Defeated in the Hazel Ring! Train & Return!'}
                    </span>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => startDuel(selectedChallenger)}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rematch</span>
                    </button>
                    <button
                      onClick={() => setInFight(false)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      <span>Choose Another Challenger</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Combat Log */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 max-h-36 overflow-y-auto space-y-1 font-mono text-[11px]">
                {combatLogs.map((log, i) => (
                  <div key={i} className="text-neutral-300">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
