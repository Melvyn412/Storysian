import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Keyboard,
  MousePointer,
  Swords,
  Compass,
  Ship,
  TreePine,
  Radio,
  Sparkles,
  Shield,
  Eye,
  Play,
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickAction?: (
    action:
      | 'young_viking'
      | 'multiplayer'
      | 'niflheim'
      | 'drakkar'
      | 'tactical_wheel'
      | 'armory'
      | 'weather'
      | 'camera'
  ) => void;
}

interface ShortcutItem {
  keys: string[];
  action: string;
  description: string;
  quickActionId?:
    | 'young_viking'
    | 'multiplayer'
    | 'niflheim'
    | 'drakkar'
    | 'tactical_wheel'
    | 'armory'
    | 'weather'
    | 'camera';
}

const MOVEMENT_SHORTCUTS: ShortcutItem[] = [
  {
    keys: ['W', 'A', 'S', 'D'],
    action: 'Move / Steer Longship',
    description: 'Walk around the realm, or steer the Drakkar warship when mounted at the helm.',
  },
  {
    keys: ['↑', '↓', '←', '→'],
    action: 'Arrow Key Movement',
    description: 'Alternative movement controls for walking and ship steering.',
  },
  {
    keys: ['SPACE'],
    action: 'Jump / Vault',
    description: 'Jump over obstacles, climb Valhalla Sky Obby platforms, or leap in combat.',
  },
  {
    keys: ['SHIFT'],
    action: 'Sprint / Rowing Surge',
    description: 'Hold Shift to run faster on land or boost oar speed on the Drakkar.',
  },
  {
    keys: ['E'],
    action: 'Interact / Gather / Board',
    description:
      'Pick up Meadow items, board the Drakkar helm, enter Niflheim portals, chop trees, or mine iron.',
  },
  {
    keys: ['C'],
    action: 'Cycle Camera View',
    description: 'Switch between 3rd-Person Orbit, Close Over-Shoulder, and 1st-Person Viking Eye View.',
    quickActionId: 'camera',
  },
  {
    keys: ['I', 'J', 'K', 'L'],
    action: 'Keyboard Look Around',
    description: 'Tilt camera up/down (I/K or PageUp/PageDown) and pan left/right (J/L).',
  },
];

const COMBAT_SHORTCUTS: ShortcutItem[] = [
  {
    keys: ['Left Click'],
    action: 'Primary Attack / Use Tool',
    description: 'Swing your equipped weapon, chop timber, mine iron ore, or drink healing mead.',
  },
  {
    keys: ['Right Click'],
    action: 'Raise Shield Block (Hold)',
    description: 'Hold Right-Click to raise your Norse shield and deflect enemy & boss strikes.',
  },
  {
    keys: ['1', '2', '3', '4', '5', '6', '7', '8'],
    action: 'Select Hotbar Slot',
    description:
      '1: Battle Axe · 2: Round Shield · 3: War Horn · 4: Healing Mead · 5: Pine Torch · 6: Builder Hammer · 7: Fjord Fishing Rod · 8: Norse Longbow.',
  },
  {
    keys: ['B'],
    action: 'Fortress Construction Mode',
    description: 'Open the base building palette to place palisades, watchtowers, and ballistas.',
  },
  {
    keys: ['Z'],
    action: 'Whirlwind Cleave (Skill)',
    description: '360° spinning AoE axe strike that damages all nearby enemies and bosses.',
  },
  {
    keys: ['X'],
    action: 'Thunder Leap (Skill)',
    description: "Leap high and slam down with Thor's lightning shockwave.",
  },
  {
    keys: ['F'],
    action: 'Frost Nova (Skill)',
    description: 'Unleash an icy blast that damages and chills surrounding foes.',
  },
  {
    keys: ['R'],
    action: 'Fire Drakkar Frost-Ballista',
    description: 'Launch a 3D runic harpoon broadside at Jörmungandr the Fjord Sea Serpent (-95 HP).',
    quickActionId: 'drakkar',
  },
];

const REALM_SHORTCUTS: ShortcutItem[] = [
  {
    keys: ['Y'],
    action: 'Young Viking Forager Realm',
    description:
      'Enter the peaceful sunlit meadow as a Young Viking to auto-wander, gather berries/herbs/amber, and craft at the campfire.',
    quickActionId: 'young_viking',
  },
  {
    keys: ['K'],
    action: 'Fjord Fishing Mini-Game',
    description:
      'Cast rod into Katfjord waters, monitor float bobber, maintain line tension, and reel in salmon, trout & kraken.',
  },
  {
    keys: ['O'],
    action: 'Norse Archery Range',
    description:
      'Practice marksmanship at the village targets with Bodkin, Fire, and Frost arrows with realistic ballistic arc.',
  },
  {
    keys: ['U'],
    action: 'Fortress Construction & Raids',
    description:
      'Place timber palisade walls, gates, archer towers, automated defense ballistas, and trigger Saxon raid waves.',
  },
  {
    keys: ['J'],
    action: 'Clan Territory Conquest (GvG)',
    description:
      'Contest and capture 3 towering Runic Spires across the battlefield to earn continuous Clan Silver & Valor dividends.',
  },
  {
    keys: ['C'],
    action: 'Draugr Crypt Barrow Tomb',
    description:
      'Enter the ancient barrow mound portal, slay animated Draugr warriors, and loot ancient runic sarcophagi.',
  },
  {
    keys: ['P'],
    action: 'Live Multiplayer & Boss Hub',
    description:
      'Switch realms, copy invite links, fight Surtr Co-Op World Boss, or enter Niflheim & Naval raids.',
    quickActionId: 'multiplayer',
  },
  {
    keys: ['T'],
    action: 'Tactical War-Command Wheel',
    description:
      'Open the 6-command radial wheel to fire 3D Sky-Pillar Beacons and ping allies on the radar.',
    quickActionId: 'tactical_wheel',
  },
  {
    keys: ['G'],
    action: 'Summon / Dismount War Mount',
    description: 'Ride your 3D Sleipnir Stag, Armored Battle Bear, or Frost Wolf for high-speed travel.',
  },
  {
    keys: ['M'],
    action: 'War Council & Campaigns',
    description: 'Open the main War Council menu to launch Siege Campaigns or customize your Viking.',
  },
  {
    keys: ['H'],
    action: 'Warrior Armory',
    description: 'Equip unlocked axes, broadswords,Mjölnir hammers, shields, and horned helmets.',
    quickActionId: 'armory',
  },
  {
    keys: ['V'],
    action: 'Cycle Dynamic Weather',
    description: "Toggle between Odin's Dawn (Sunny), Niflheim Mist (Fog), Fimbulwinter (Snow), and Storm.",
    quickActionId: 'weather',
  },
  {
    keys: ['Q', 'B', 'Tab'],
    action: 'Quests [Q] · Emotes [B] · Leaderboard [Tab]',
    description: 'Track quest rewards, trigger 3D Viking war cries/dances, or view realm rankings.',
  },
  {
    keys: ['?', 'F1'],
    action: 'How to Play & Controls',
    description: 'Open or close this interactive keyboard & gameplay guide at any time.',
  },
];

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  onQuickAction,
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'realms' | 'modes'>('controls');

  if (!isOpen) return null;

  const renderKeycaps = (keys: string[]) => (
    <div className="flex flex-wrap items-center gap-1 shrink-0">
      {keys.map((k) => (
        <kbd
          key={k}
          className="px-2 py-1 min-w-[28px] text-center rounded-md bg-neutral-800 border-b-2 border-neutral-600 text-amber-300 font-mono text-xs font-extrabold shadow-inner"
        >
          {k}
        </kbd>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-950 border border-amber-500/40 text-neutral-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-gradient-to-r from-amber-950/50 via-neutral-900 to-emerald-950/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <HelpCircle className="w-4 h-4" />
              <span>VIKING CODEX &amp; KEYBOARD SHORTCUTS</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Press [?] or [ESC] Anytime</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Cinzel',serif] mt-0.5">
              How to Play &amp; Controls Guide
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
            title="Close [ESC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-neutral-800 bg-neutral-900/50">
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'controls'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            WASD, Mouse &amp; Combat Keys
          </button>

          <button
            onClick={() => setActiveTab('realms')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'realms'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            Realm Shortcuts ([Y] [P] [T] [R])
          </button>

          <button
            onClick={() => setActiveTab('modes')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'modes'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            All Game Modes &amp; Quick Teleport
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'controls' && (
            <>
              {/* Visual WASD + Mouse Quick-Start Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Visual WASD Card */}
                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col items-center justify-center text-center gap-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    1. Move &amp; Steer
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <kbd className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-800 border-b-4 border-neutral-600 text-amber-300 font-mono font-extrabold text-sm shadow">
                      W
                    </kbd>
                    <div className="flex items-center gap-1.5">
                      <kbd className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-800 border-b-4 border-neutral-600 text-amber-300 font-mono font-extrabold text-sm shadow">
                        A
                      </kbd>
                      <kbd className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-800 border-b-4 border-neutral-600 text-amber-300 font-mono font-extrabold text-sm shadow">
                        S
                      </kbd>
                      <kbd className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-800 border-b-4 border-neutral-600 text-amber-300 font-mono font-extrabold text-sm shadow">
                        D
                      </kbd>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Use <span className="text-white font-semibold">WASD</span> or{' '}
                    <span className="text-white font-semibold">Arrow Keys</span> to walk, or hold{' '}
                    <span className="text-amber-300 font-semibold">SHIFT</span> to sprint. Press{' '}
                    <span className="text-amber-300 font-semibold">SPACE</span> to jump.
                  </p>
                </div>

                {/* Visual Mouse Card */}
                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col items-center justify-center text-center gap-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <MousePointer className="w-3.5 h-3.5" />
                    2. Mouse Attack, Block &amp; Look
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-2 rounded-lg bg-neutral-800 border border-amber-500/40 text-xs font-bold text-amber-300">
                      Left-Click: Swing / Drag Look
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-neutral-800 border border-sky-500/40 text-xs font-bold text-sky-300">
                      Right-Click: Shield Block
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Click &amp; drag anywhere to orbit the 360° camera. Use the{' '}
                    <span className="text-white font-semibold">Scroll Wheel</span> to zoom in/out or press{' '}
                    <span className="text-amber-300 font-semibold">[C]</span> for 1st-Person View.
                  </p>
                </div>

                {/* Visual Interact & Gather Card */}
                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col items-center justify-center text-center gap-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    3. Interact, Gather &amp; Skills
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-3 py-2 rounded-lg bg-emerald-950 border-b-4 border-emerald-600 text-emerald-300 font-mono font-extrabold text-sm">
                      E
                    </kbd>
                    <kbd className="px-3 py-2 rounded-lg bg-neutral-800 border-b-4 border-neutral-600 text-amber-300 font-mono font-extrabold text-sm">
                      Z
                    </kbd>
                    <kbd className="px-3 py-2 rounded-lg bg-neutral-800 border-b-4 border-neutral-600 text-sky-300 font-mono font-extrabold text-sm">
                      X
                    </kbd>
                    <kbd className="px-3 py-2 rounded-lg bg-neutral-800 border-b-4 border-neutral-600 text-cyan-300 font-mono font-extrabold text-sm">
                      F
                    </kbd>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Press <span className="text-emerald-300 font-semibold">[E]</span> to board ships, enter
                    portals, or gather resources. Press{' '}
                    <span className="text-amber-300 font-semibold">Z / X / F</span> for special abilities!
                  </p>
                </div>
              </div>

              {/* Movement & Camera Table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Movement &amp; Camera Controls
                  </h3>
                  <div className="space-y-2">
                    {MOVEMENT_SHORTCUTS.map((item) => (
                      <div
                        key={item.action}
                        className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold text-white">{item.action}</div>
                          <div className="text-xs text-neutral-400">{item.description}</div>
                        </div>
                        {renderKeycaps(item.keys)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Combat & Skills Table */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <Swords className="w-4 h-4" />
                    Combat, Hotbar &amp; Weapon Skills
                  </h3>
                  <div className="space-y-2">
                    {COMBAT_SHORTCUTS.map((item) => (
                      <div
                        key={item.action}
                        className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold text-white">{item.action}</div>
                          <div className="text-xs text-neutral-400">{item.description}</div>
                        </div>
                        {renderKeycaps(item.keys)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'realms' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Realms, Multiplayer, Naval &amp; Menu Shortcuts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {REALM_SHORTCUTS.map((item) => (
                  <div
                    key={item.action}
                    className="p-3.5 rounded-xl bg-neutral-900/85 border border-neutral-800 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">{item.action}</div>
                        <p className="text-xs text-neutral-400 mt-1">{item.description}</p>
                      </div>
                      {renderKeycaps(item.keys)}
                    </div>

                    {item.quickActionId && onQuickAction && (
                      <div className="pt-2 border-t border-neutral-800/80 flex justify-end">
                        <button
                          onClick={() => {
                            onClose();
                            onQuickAction(item.quickActionId!);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          Try It Now
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'modes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mode 1: Young Viking Meadow Realm */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/50 via-neutral-900 to-neutral-900 border border-emerald-500/40 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <TreePine className="w-4 h-4" />
                      Peaceful Foraging Realm [Y]
                    </span>
                    <kbd className="px-2 py-0.5 rounded bg-neutral-800 text-emerald-300 font-mono text-xs font-bold">
                      Key: Y
                    </kbd>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    Young Viking Wanderer &amp; Forager Meadow
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Transform into a Young Viking Apprentice with a woven basket on your back. Roam a sunlit
                    meadow with zero hostile enemies, auto-wander from berry bush to glowing mushroom patch,
                    and brew herbal teas at the homestead campfire.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onQuickAction?.('young_viking');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  Enter Young Viking Meadow Realm [Y]
                </button>
              </div>

              {/* Mode 2: Multi-Crew Naval & Sea Serpent */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-sky-950/50 via-neutral-900 to-neutral-900 border border-sky-500/40 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <Ship className="w-4 h-4" />
                      Naval Raid &amp; Sea Monster [R]
                    </span>
                    <kbd className="px-2 py-0.5 rounded bg-neutral-800 text-sky-300 font-mono text-xs font-bold">
                      Key: E / R
                    </kbd>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    Multi-Crew Drakkar &amp; Jörmungandr Leviathan
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Board the Drakkar Longship at Katfjord Dock. Steer with WASD as Helm Captain or switch to
                    Broadside Gunner and press [R] to fire 3D Frost-Ballista harpoons at the 1,800 HP Sea
                    Serpent.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onQuickAction?.('drakkar');
                  }}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  Board Drakkar &amp; Man Ballistas
                </button>
              </div>

              {/* Mode 3: Niflheim Underworld Dungeon */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/50 via-neutral-900 to-neutral-900 border border-purple-500/40 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      Co-Op Underworld Dungeon
                    </span>
                    <kbd className="px-2 py-0.5 rounded bg-neutral-800 text-purple-300 font-mono text-xs font-bold">
                      Portal [E]
                    </kbd>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    Niflheim Obsidian Cavern &amp; Níðhöggr Dragon
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Teleport into the underground crystal cavern, dodge swinging pendulum soul-scythes, and
                    battle the 2,200 HP underworld dragon Níðhöggr with your party.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onQuickAction?.('niflheim');
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  Teleport to Niflheim Dungeon
                </button>
              </div>

              {/* Mode 4: Live Multiplayer & Tactical Wheel */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/50 via-neutral-900 to-neutral-900 border border-amber-500/40 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Radio className="w-4 h-4" />
                      Live WebSockets &amp; Beacons [P / T]
                    </span>
                    <kbd className="px-2 py-0.5 rounded bg-neutral-800 text-amber-300 font-mono text-xs font-bold">
                      Keys: P &amp; T
                    </kbd>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    Co-Op World Boss Surtr &amp; Tactical Wheel
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Open the Multiplayer Hub [P] to join rooms and fight Surtr the Ash Colossus, or press [T]
                    to launch 3D Sky-Pillar Beacons that ping every ally&apos;s radar minimap.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onQuickAction?.('multiplayer');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Multiplayer [P]
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onQuickAction?.('tactical_wheel');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    Command Wheel [T]
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
