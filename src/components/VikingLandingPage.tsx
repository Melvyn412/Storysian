import React, { useState, useMemo } from 'react';
import {
  Compass,
  Swords,
  Shield,
  Coins,
  Sparkles,
  ChevronRight,
  Flame,
  Ship,
  Skull,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  MapPin,
  Target,
  CloudSnow,
  Sun,
  CloudFog,
  Crosshair,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Trophy,
  Lock,
  Check,
  Sword,
  Crown,
  ShieldCheck,
  Zap,
  Snowflake,
  Hammer,
  Flag,
  PoundSterling,
  Radio,
  TreePine,
  HelpCircle,
  Fish,
} from 'lucide-react';
import {
  BattleScenario,
  BattleId,
  AvatarSkin,
  WeatherCondition,
  ArmoryCategory,
  EquippedGear,
  ArmoryItem,
} from '../types';
import { BATTLE_SCENARIOS } from '../game/battleScenarios';
import { ARMORY_ITEMS, DEFAULT_EQUIPPED_GEAR, getNextArmoryUnlock } from '../game/armoryConfig';
import { sound } from '../audio/soundEngine';

interface VikingLandingPageProps {
  isOpen: boolean;
  onClose: () => void;
  onDeployBattle: (scenario: BattleScenario, selectedSkinId?: string) => void;
  onBoardDrakkarSiege: () => void;
  currentSilver: number;
  currentValor?: number;
  currentGbpBalance?: number;
  currentLevel: number;
  availableSkins: AvatarSkin[];
  activeSkinId: string;
  onSelectSkin: (skin: AvatarSkin) => void;
  equippedGear?: EquippedGear;
  onEquipGear?: (category: ArmoryCategory, itemId: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenGamepasses?: () => void;
  onOpenPets?: () => void;
  onOpenTycoon?: () => void;
  onOpenClanHub?: () => void;
  onOpenMultiplayer?: () => void;
  onOpenYoungVikingRealm?: () => void;
  onOpenHowToPlay?: () => void;
  onOpenFishing?: () => void;
  onOpenArchery?: () => void;
  onOpenBuilding?: () => void;
  onOpenConquest?: () => void;
  onEnterCrypt?: () => void;
  onOpenDrakkarTour?: () => void;
  onlinePlayerCount?: number;
}

type CampaignCategory = 'all' | 'siege' | 'defense' | 'raid';

export const VikingLandingPage: React.FC<VikingLandingPageProps> = ({
  isOpen,
  onClose,
  onDeployBattle,
  onBoardDrakkarSiege,
  currentSilver,
  currentValor = 0,
  currentGbpBalance = 25.0,
  currentLevel,
  availableSkins,
  activeSkinId,
  onSelectSkin,
  equippedGear = DEFAULT_EQUIPPED_GEAR,
  onEquipGear,
  isMuted,
  onToggleMute,
  onOpenGamepasses,
  onOpenPets,
  onOpenTycoon,
  onOpenClanHub,
  onOpenMultiplayer,
  onOpenYoungVikingRealm,
  onOpenHowToPlay,
  onOpenFishing,
  onOpenArchery,
  onOpenBuilding,
  onOpenConquest,
  onEnterCrypt,
  onOpenDrakkarTour,
  onlinePlayerCount = 1,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<BattleId>('frostfang_siege');
  const [activeTab, setActiveTab] = useState<'campaigns' | 'armory' | 'intel'>('campaigns');
  const [categoryFilter, setCategoryFilter] = useState<CampaignCategory>('all');
  const [armoryMode, setArmoryMode] = useState<'points_gear' | 'skins'>('points_gear');
  const [gearCategory, setGearCategory] = useState<'all' | ArmoryCategory>('all');

  if (!isOpen) return null;

  const selectedScenario =
    BATTLE_SCENARIOS.find((b) => b.id === selectedScenarioId) || BATTLE_SCENARIOS[0];

  const handleSelectScenario = (scenarioId: BattleId) => {
    sound.playAxeSwing();
    setSelectedScenarioId(scenarioId);
  };

  const handleLaunchScenario = (scenario: BattleScenario) => {
    sound.playWarHorn();
    onDeployBattle(scenario, activeSkinId);
  };

  const handleQuickBoardShip = () => {
    sound.playWarHorn();
    onBoardDrakkarSiege();
  };

  const getWeatherIcon = (weather?: WeatherCondition) => {
    switch (weather) {
      case 'stormy':
        return <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />;
      case 'snowy':
        return <CloudSnow className="w-3.5 h-3.5 text-sky-300" />;
      case 'foggy':
        return <CloudFog className="w-3.5 h-3.5 text-slate-300" />;
      case 'sunny':
      default:
        return <Sun className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  const getWeatherLabel = (weather?: WeatherCondition) => {
    switch (weather) {
      case 'stormy':
        return "Thor's Tempest (Rough Sea)";
      case 'snowy':
        return 'Fimbulwinter Snow';
      case 'foggy':
        return 'Niflheim Mist';
      case 'sunny':
      default:
        return "Odin's Dawn";
    }
  };

  // Filter campaigns
  const filteredScenarios = BATTLE_SCENARIOS.filter((sc) => {
    if (categoryFilter === 'siege') return sc.mountShipOnStart;
    if (categoryFilter === 'defense') return sc.id === 'katfjord_defense';
    if (categoryFilter === 'raid') return sc.id === 'glacial_stronghold' || sc.id === 'rune_ambush';
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="war-council-heading"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/90 backdrop-blur-md p-2 sm:p-4 md:p-6 text-neutral-100 select-none flex flex-col items-center justify-start min-h-screen"
    >
      {/* Outer Grand Norse War Council Frame */}
      <div className="relative w-full max-w-7xl bg-neutral-900 border border-amber-900/60 rounded-xl shadow-2xl flex flex-col my-auto max-h-[min(94vh,940px)] overflow-hidden">
        
        {/* Top Header Bar (Strict 3-Zone Contract) */}
        <header className="flex items-center justify-between px-5 py-3.5 bg-neutral-950 border-b border-amber-900/40 shrink-0 gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-600/50 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <span
                id="war-council-heading"
                className="text-base sm:text-lg font-bold tracking-tight text-amber-400 font-['Cinzel',serif] whitespace-nowrap"
              >
                STORYSIAN VIKING WAR COUNCIL
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-amber-800 text-amber-100 rounded tracking-wider uppercase whitespace-nowrap shrink-0">
                .AI.STUDIO
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Mode Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'campaigns'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Battle Campaigns</span>
            </button>
            <button
              onClick={() => setActiveTab('armory')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'armory'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Warrior Armory</span>
            </button>
            <button
              onClick={() => setActiveTab('intel')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'intel'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tactical Intel</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1 text-amber-300 font-semibold tabular-nums">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {currentValor.toLocaleString()} Valor Pts
              </span>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <span className="flex items-center gap-1 text-amber-300 font-semibold tabular-nums">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {currentSilver.toLocaleString()} Silver
              </span>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <span className="text-neutral-300 font-medium">Rank {currentLevel} Jarl</span>
            </div>

            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition shrink-0 cursor-pointer"
              title={isMuted ? 'Unmute Realm Audio' : 'Mute Realm Audio'}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition text-xs font-semibold shrink-0 cursor-pointer"
              title="Return to World"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </header>

        {/* Mobile Sub-Nav Tab Bar */}
        <div className="flex md:hidden items-center justify-around px-2 py-1.5 bg-neutral-950/70 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1 font-semibold rounded ${
              activeTab === 'campaigns' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('armory')}
            className={`px-3 py-1 font-semibold rounded ${
              activeTab === 'armory' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400'
            }`}
          >
            Armory
          </button>
          <button
            onClick={() => setActiveTab('intel')}
            className={`px-3 py-1 font-semibold rounded ${
              activeTab === 'intel' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400'
            }`}
          >
            Tactical Intel
          </button>
        </div>

        {/* Main Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'campaigns' ? (
            <div className="space-y-6">
              
              {/* Marquee Hero Campaign Showcase (Featured Theater) */}
              <section className="relative rounded-xl overflow-hidden border border-amber-900/50 shadow-2xl bg-neutral-900">
                <div className="relative h-64 sm:h-72 lg:h-80 w-full overflow-hidden">
                  <img
                    src={selectedScenario.image}
                    alt={selectedScenario.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform scale-[1.02] filter brightness-125 contrast-105 saturate-110"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Lighter Gradient Scrim so artwork remains bright and vivid */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/20 to-transparent" />

                  {/* Hero Information Overlay */}
                  <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between">
                    {/* Top Row: Theater Tag & Atmospheric Condition */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wide uppercase">
                        <Flame className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                        <span>{selectedScenario.badge} · {selectedScenario.difficulty}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-300 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-700/60 backdrop-blur-sm">
                        {getWeatherIcon(selectedScenario.weather)}
                        <span>{getWeatherLabel(selectedScenario.weather)}</span>
                      </div>
                    </div>

                    {/* Middle / Bottom Content */}
                    <div className="max-w-2xl space-y-2">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-['Cinzel',serif] tracking-tight leading-snug">
                        {selectedScenario.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-200 line-clamp-2 leading-relaxed">
                        {selectedScenario.tagline}
                      </p>

                      {/* Clean Unboxed Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300 pt-1">
                        <span className="flex items-center gap-1 text-amber-300 font-semibold tabular-nums">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          +{selectedScenario.rewardSilver} Silver
                        </span>
                        <span aria-hidden="true" className="text-neutral-600">·</span>
                        <span className="flex items-center gap-1 text-sky-300 font-semibold tabular-nums">
                          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                          +{selectedScenario.rewardValor} Valor
                        </span>
                        <span aria-hidden="true" className="text-neutral-600">·</span>
                        <span className="text-neutral-300 font-medium">
                          {selectedScenario.objectives.length} Tactical Stages
                        </span>
                        {selectedScenario.bossName && (
                          <>
                            <span aria-hidden="true" className="text-neutral-600">·</span>
                            <span className="text-red-300 font-medium flex items-center gap-1">
                              <Skull className="w-3.5 h-3.5 text-red-400" />
                              {selectedScenario.bossName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => handleLaunchScenario(selectedScenario)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-sm rounded-lg shadow-lg hover:shadow-amber-500/25 transition-all duration-200 cursor-pointer active:scale-[0.98] whitespace-nowrap"
                      >
                        {selectedScenario.mountShipOnStart ? (
                          <>
                            <Ship className="w-4 h-4" />
                            <span>Board Drakkar &amp; Launch Siege</span>
                          </>
                        ) : (
                          <>
                            <Swords className="w-4 h-4" />
                            <span>Deploy into Battle</span>
                          </>
                        )}
                        <ChevronRight className="w-4 h-4 opacity-80" />
                      </button>

                      <button
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800/90 hover:bg-neutral-700/90 border border-neutral-700 text-neutral-200 text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer"
                      >
                        <span>Free Roam Katfjord Village</span>
                      </button>

                      {onOpenDrakkarTour && (
                        <button
                          onClick={onOpenDrakkarTour}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-950 via-neutral-900 to-sky-950 hover:bg-sky-900/60 border border-sky-500/60 text-sky-300 text-sm font-bold rounded-lg transition whitespace-nowrap cursor-pointer shadow-md"
                          title="Interactive 3D cinematic tour of the Drakkar Longship at Katfjord Pier"
                        >
                          <Ship className="w-4 h-4 text-sky-400 animate-pulse" />
                          <span>Drakkar Pier Tour</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Norse Realms, Game Modes & Activities Quick-Launch Section (Fully Visible & Scrollable on Mobile) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white font-['Cinzel',serif] uppercase tracking-wider">
                      Viking Realms, Minigames &amp; Systems
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-400 hidden sm:inline">Tap any activity to launch</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Live Multiplayer & Co-Op Boss */}
                  {onOpenMultiplayer && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenMultiplayer();
                      }}
                      className="group p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/70 via-neutral-900 to-neutral-900 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all shadow-md hover:shadow-emerald-500/10 cursor-pointer flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          {onlinePlayerCount} Online
                        </span>
                        <Radio className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Live Multiplayer Hub [P]
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                          Co-Op World Boss raids, naval sieges &amp; Holmgang PvP battles.
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 2. Young Viking Forager Meadow Realm */}
                  {onOpenYoungVikingRealm && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenYoungVikingRealm();
                      }}
                      className="group p-3.5 rounded-xl bg-gradient-to-br from-teal-950/70 via-neutral-900 to-neutral-900 border border-teal-500/50 hover:border-teal-400 text-left transition-all shadow-md hover:shadow-teal-500/10 cursor-pointer flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider">
                          Peaceful Meadow
                        </span>
                        <TreePine className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-teal-200 transition-colors">
                          Young Viking Realm [Y]
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                          Auto-wander, gather berries, wild herbs &amp; craft at the campfire.
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 3. How to Play & Controls Guide */}
                  {onOpenHowToPlay && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenHowToPlay();
                      }}
                      className="group p-3.5 rounded-xl bg-gradient-to-br from-amber-950/70 via-neutral-900 to-neutral-900 border border-amber-500/50 hover:border-amber-400 text-left transition-all shadow-md hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                          Shortcuts &amp; Guide
                        </span>
                        <HelpCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                          How to Play &amp; Controls [?]
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                          Touch controls, WASD shortcuts, combat skills &amp; tactic guide.
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 4. Fjord Fishing System */}
                  {onOpenFishing && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenFishing();
                      }}
                      className="group p-3.5 rounded-xl bg-gradient-to-br from-sky-950/70 via-neutral-900 to-neutral-900 border border-sky-500/50 hover:border-sky-400 text-left transition-all shadow-md hover:shadow-sky-500/10 cursor-pointer flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] font-extrabold uppercase tracking-wider">
                          Water Minigame
                        </span>
                        <Fish className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-sky-200 transition-colors">
                          Katfjord Fjord Fishing [K]
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                          Hook bites, reel in Salmon &amp; Baby Kraken, smoke or sell fish.
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 5. Norse Archery Range */}
                  {onOpenArchery && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenArchery();
                      }}
                      className="group p-3.5 rounded-xl bg-gradient-to-br from-orange-950/70 via-neutral-900 to-neutral-900 border border-orange-500/50 hover:border-orange-400 text-left transition-all shadow-md hover:shadow-orange-500/10 cursor-pointer flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-400/40 text-orange-300 text-[10px] font-extrabold uppercase tracking-wider">
                          Target Ballistics
                        </span>
                        <Target className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-orange-200 transition-colors">
                          Norse Archery Range [O]
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                          Bodkin, Flame &amp; Frost arrows with gravity drop &amp; bullseyes.
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 6. Fortress Base Building & Saxon Raids */}
                  {onOpenBuilding && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenBuilding();
                      }}
                      className="group p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/70 via-neutral-900 to-neutral-900 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all shadow-md hover:shadow-emerald-500/10 cursor-pointer flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                          Base Construction
                        </span>
                        <Hammer className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Fortress Build &amp; Raids [U]
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                          Place palisades, watchtowers &amp; defend against Saxon waves.
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 7. Clan Conquest Battlefields (GvG) */}
                  {onOpenConquest && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenConquest();
                      }}
                      className="group p-3.5 rounded-xl bg-gradient-to-br from-red-950/70 via-neutral-900 to-neutral-900 border border-red-500/50 hover:border-red-400 text-left transition-all shadow-md hover:shadow-red-500/10 cursor-pointer flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-400/40 text-red-300 text-[10px] font-extrabold uppercase tracking-wider">
                          Territory Wars
                        </span>
                        <Flag className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                          Clan Conquest (GvG) [J]
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                          Capture 3 frontline watchtowers across Midgard for your clan.
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 8. Draugr Barrow Crypt Dungeon */}
                  {onEnterCrypt && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEnterCrypt();
                      }}
                      className="group p-3.5 rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950/50 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all shadow-md hover:shadow-emerald-500/10 cursor-pointer flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                          Subterranean Tomb
                        </span>
                        <Skull className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Draugr Barrow Crypt [C]
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                          Subterranean dungeon with skeletons, Crypt Lord boss &amp; loot.
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </section>

              {/* Roblox Realm Systems & Monetization Quick-Launch Bar */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGamepasses?.();
                  }}
                  className="group p-4 rounded-xl bg-gradient-to-br from-emerald-950/70 via-neutral-900 to-neutral-900 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                      £ GBP PayPal Store
                    </span>
                    <PoundSterling className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      £ GBP Mint, Passes & Wheel
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                      £0.99 – £49.99 GBP Silver Bundles, VIP Gamepasses (£1.99+), Saga Pass & Rune Wheel.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 pt-1">
                    <span>Open £ GBP Store & Wheel</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPets?.();
                  }}
                  className="group p-4 rounded-xl bg-gradient-to-br from-purple-950/60 via-neutral-900 to-neutral-900 border border-purple-500/40 hover:border-purple-400 text-left transition-all shadow-lg hover:shadow-purple-500/10 cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
                      3D Companions & Mounts
                    </span>
                    <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      Norse Pets & War Mounts
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                      Hatch 3D Ravens, Wolf Pups & Frost Dragons, or ride War Bears & Dire Wolves [G].
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1 pt-1">
                    <span>Hatch Eggs & Summon Mount</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTycoon?.();
                  }}
                  className="group p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 via-neutral-900 to-neutral-900 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                      Base Builder & Parkour
                    </span>
                    <Hammer className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Village Tycoon & Sky Obby
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                      Build passive Silver generators in 3D & climb the floating Valhalla Sky Obby!
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 pt-1">
                    <span>Manage Tycoon & Play Obby</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenClanHub?.();
                  }}
                  className="group p-4 rounded-xl bg-gradient-to-br from-sky-950/60 via-neutral-900 to-neutral-900 border border-sky-500/40 hover:border-sky-400 text-left transition-all shadow-lg hover:shadow-sky-500/10 cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] font-extrabold uppercase tracking-wider">
                      Clans, Trade & Badges
                    </span>
                    <Flag className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      Clan Hub, Trading & Badges
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                      Customize Clan banners, capture the Outpost Flag, trade resources & earn Badges.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-sky-400 flex items-center gap-1 pt-1">
                    <span>Open Clan & Trading Post</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              </section>

              {/* Theater Selector Section with Category Filter Tabs */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                      Campaign Theaters of War
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Select a theater to inspect objectives, threat levels, and tactical intelligence
                    </p>
                  </div>

                  {/* Interactive Category Segmented Control */}
                  <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 shrink-0">
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        categoryFilter === 'all'
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      All ({BATTLE_SCENARIOS.length})
                    </button>
                    <button
                      onClick={() => setCategoryFilter('siege')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        categoryFilter === 'siege'
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      Naval Siege
                    </button>
                    <button
                      onClick={() => setCategoryFilter('defense')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        categoryFilter === 'defense'
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      Defense
                    </button>
                    <button
                      onClick={() => setCategoryFilter('raid')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        categoryFilter === 'raid'
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      Assault & Trials
                    </button>
                  </div>
                </div>

                {/* Grid of Campaign Cards and Detailed Selected Briefing Drawer */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Interactive Cards Grid */}
                  <div className="lg:col-span-7 space-y-3.5">
                    {filteredScenarios.map((scenario) => {
                      const isSelected = scenario.id === selectedScenarioId;
                      return (
                        <div
                          key={scenario.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectScenario(scenario.id)}
                          onDoubleClick={() => handleLaunchScenario(scenario)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleLaunchScenario(scenario);
                            }
                          }}
                          aria-pressed={isSelected}
                          aria-label={`Campaign: ${scenario.title}`}
                          className={`group relative p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row gap-4 select-none ${
                            isSelected
                              ? 'bg-neutral-800/95 border-amber-500 shadow-xl ring-2 ring-amber-500/40'
                              : 'bg-neutral-900/80 hover:bg-neutral-850 border-neutral-800 hover:border-amber-700/60 hover:shadow-lg'
                          }`}
                        >
                          {/* 16:9 Aspect Ratio Thumbnail */}
                          <div className="relative w-full sm:w-48 h-32 sm:h-auto rounded-lg overflow-hidden shrink-0 bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                            <img
                              src={scenario.image}
                              alt={scenario.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 filter brightness-125 contrast-105 saturate-110"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            {/* Fallback container */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 p-2 text-center bg-neutral-900">
                              <Swords className="w-5 h-5 text-amber-500/60 mb-1" />
                              <span className="text-[10px] text-neutral-400">{scenario.title}</span>
                            </div>

                            {/* Weather pill overlay */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-neutral-200 rounded border border-white/10 flex items-center gap-1">
                              {getWeatherIcon(scenario.weather)}
                              <span>{getWeatherLabel(scenario.weather)}</span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                                  {scenario.title}
                                </h4>
                                <span className="text-xs font-semibold text-amber-400 whitespace-nowrap">
                                  {scenario.difficulty}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-300 line-clamp-2 mt-1 leading-relaxed">
                                {scenario.tagline}
                              </p>
                            </div>

                            {/* Objectives Preview Checklist */}
                            <div className="space-y-1 py-1">
                              {scenario.objectives.slice(0, 2).map((obj, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                                  <CheckCircle2 className="w-3 h-3 text-amber-400/80 shrink-0" />
                                  <span className="truncate">{obj}</span>
                                </div>
                              ))}
                              {scenario.objectives.length > 2 && (
                                <span className="text-[10px] text-neutral-500">
                                  +{scenario.objectives.length - 2} more objectives
                                </span>
                              )}
                            </div>

                            {/* Card Footer: Clean Metadata & Launch Button */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                              <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <span className="flex items-center gap-1 text-amber-300 font-semibold tabular-nums">
                                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                                  +{scenario.rewardSilver}
                                </span>
                                <span aria-hidden="true" className="text-neutral-700">·</span>
                                <span className="flex items-center gap-1 text-sky-300 font-semibold tabular-nums">
                                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                                  +{scenario.rewardValor}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLaunchScenario(scenario);
                                }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                                  scenario.mountShipOnStart
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                    : isSelected
                                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold'
                                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                                }`}
                              >
                                {scenario.mountShipOnStart ? (
                                  <>
                                    <Ship className="w-3.5 h-3.5" />
                                    <span>Board Drakkar</span>
                                  </>
                                ) : (
                                  <>
                                    <Swords className="w-3.5 h-3.5" />
                                    <span>Deploy</span>
                                  </>
                                )}
                                <ArrowRight className="w-3 h-3 ml-0.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Detailed Selected Theater Briefing Deck */}
                  <div className="lg:col-span-5 bg-neutral-950/90 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      {/* Theater Location & Header */}
                      <div className="space-y-1 pb-3 border-b border-neutral-800">
                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{selectedScenario.location}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-['Cinzel',serif]">
                          {selectedScenario.title}
                        </h4>
                        <p className="text-xs text-neutral-400">
                          {selectedScenario.subtitle} · Recommended: {selectedScenario.recommendedRole}
                        </p>
                      </div>

                      {/* Tactical Lore Briefing */}
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {selectedScenario.description}
                      </p>

                      {/* Full Tactical Objectives Pipeline */}
                      <div className="space-y-2 pt-2">
                        <div className="text-xs uppercase tracking-wider text-amber-400/90 font-bold flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          <span>Sequential Mission Objectives</span>
                        </div>
                        <div className="space-y-2 bg-neutral-900/60 p-3 rounded-lg border border-neutral-800 text-xs">
                          {selectedScenario.objectives.map((obj, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                                {i + 1}
                              </span>
                              <span className="text-neutral-200 leading-snug">{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Boss Threat Intel Warning */}
                      {selectedScenario.bossName && (
                        <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-lg text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-red-300">
                            <Skull className="w-4 h-4 text-red-400 shrink-0" />
                            <span>Warlord Threat: {selectedScenario.bossName}</span>
                          </div>
                          <p className="text-[11px] text-neutral-300 leading-relaxed">
                            Possesses high durability and an earth-shattering <strong className="text-red-300">Ground Stomp Shockwave</strong>. Enters an aggressive berserk state at 50% health. Raise shield with Right-Click to block damage.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Launch Action */}
                    <div className="pt-3 border-t border-neutral-800 space-y-2">
                      <button
                        onClick={() => handleLaunchScenario(selectedScenario)}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 font-extrabold text-sm rounded-lg shadow-lg transition duration-200 cursor-pointer active:scale-[0.99] ${
                          selectedScenario.mountShipOnStart
                            ? 'bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-amber-900/40 ring-1 ring-amber-400/50'
                            : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950'
                        }`}
                      >
                        {selectedScenario.mountShipOnStart ? (
                          <Ship className="w-4 h-4" />
                        ) : (
                          <Swords className="w-4 h-4" />
                        )}
                        <span>
                          {selectedScenario.mountShipOnStart
                            ? 'Board Drakkar & Lay Siege'
                            : `Deploy to ${selectedScenario.title}`}
                        </span>
                      </button>

                      <p className="text-[11px] text-center text-neutral-500">
                        Prepares tactical loadout and deploys warrior to the staging grounds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'armory' ? (
            /* Tab 2: Warrior Armory, Point Milestone Gear & Skins */
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div className="max-w-xl space-y-1">
                  <h3 className="text-base font-bold text-white font-['Cinzel',serif] flex items-center gap-2">
                    <Swords className="w-4 h-4 text-amber-400" />
                    <span>Warrior Armory & Honor Progression</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Unlock exclusive shields, swords, and legendary war helmets as your Valor Points rise in battle!
                  </p>
                </div>

                {/* Valor Points Milestone Status */}
                <div className="flex items-center gap-3 px-4 py-2 bg-neutral-950 rounded-xl border border-amber-600/40 shadow-inner">
                  <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div>
                    <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Your Valor Honor</div>
                    <div className="text-sm font-extrabold font-mono text-amber-300">
                      {currentValor.toLocaleString()} <span className="text-[11px] text-amber-500 font-sans">Points</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode Switcher: Point Milestone Equipment vs Clan Skins */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                  <button
                    onClick={() => setArmoryMode('points_gear')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                      armoryMode === 'points_gear'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-300" />
                    <span>Point Milestone Gear ({ARMORY_ITEMS.length})</span>
                  </button>
                  <button
                    onClick={() => setArmoryMode('skins')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                      armoryMode === 'skins'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Clan Skins & Regalia ({availableSkins.length})</span>
                  </button>
                </div>

                {armoryMode === 'points_gear' && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setGearCategory('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        gearCategory === 'all'
                          ? 'bg-neutral-700 text-white'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      All ({ARMORY_ITEMS.length})
                    </button>
                    <button
                      onClick={() => setGearCategory('shield')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                        gearCategory === 'shield'
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      Shields (6)
                    </button>
                    <button
                      onClick={() => setGearCategory('weapon')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                        gearCategory === 'weapon'
                          ? 'bg-amber-600 text-white'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Sword className="w-3 h-3" />
                      Swords (6)
                    </button>
                    <button
                      onClick={() => setGearCategory('headwear')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                        gearCategory === 'headwear'
                          ? 'bg-purple-600 text-white'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Crown className="w-3 h-3" />
                      Headwear (6)
                    </button>
                  </div>
                )}
              </div>

              {/* Point Milestone Gear Grid */}
              {armoryMode === 'points_gear' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ARMORY_ITEMS.filter(
                    (item) => gearCategory === 'all' || item.category === gearCategory
                  ).map((item) => {
                    const isUnlocked = currentValor >= item.requiredPoints;
                    const isEquipped =
                      (item.category === 'weapon' && equippedGear.weaponId === item.id) ||
                      (item.category === 'shield' && equippedGear.shieldId === item.id) ||
                      (item.category === 'headwear' && equippedGear.headwearId === item.id);

                    const rarityColors: Record<string, string> = {
                      common: 'bg-neutral-800 text-neutral-300 border-neutral-700',
                      uncommon: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
                      rare: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
                      epic: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
                      legendary: 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]',
                      mythic: 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
                    };

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                          isEquipped
                            ? 'bg-neutral-900/90 border-amber-500 ring-1 ring-amber-500/50 shadow-lg'
                            : isUnlocked
                            ? 'bg-neutral-950/80 hover:bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                            : 'bg-neutral-950/50 border-neutral-800/60 opacity-70'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                                rarityColors[item.rarity]
                              }`}
                            >
                              {item.rarity}
                            </span>

                            <div className="flex items-center gap-1 font-mono text-xs">
                              {isUnlocked ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                                  <Check className="w-3.5 h-3.5" />
                                  {item.requiredPoints === 0 ? 'Starter' : `${item.requiredPoints} pts`}
                                </span>
                              ) : (
                                <span className="text-neutral-400 flex items-center gap-1 text-[11px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                                  <Lock className="w-3 h-3 text-amber-500" />
                                  {item.requiredPoints} pts
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Swatch & Identity */}
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-neutral-700 shadow-inner relative overflow-hidden"
                              style={{ backgroundColor: item.primaryColor }}
                            >
                              <div
                                className="w-5 h-5 rounded-full shadow-md flex items-center justify-center z-10"
                                style={{ backgroundColor: item.accentColor }}
                              >
                                {item.specialEffect === 'frost' ? (
                                  <Snowflake className="w-3 h-3 text-cyan-200 animate-pulse" />
                                ) : item.specialEffect === 'lightning' ? (
                                  <Zap className="w-3 h-3 text-amber-300 animate-pulse" />
                                ) : (
                                  <Sparkles className="w-3 h-3 text-amber-200" />
                                )}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-white font-serif truncate">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          {/* Perk Badge */}
                          <div className="p-2 rounded-lg bg-neutral-900/90 border border-neutral-800/80 text-[11px] text-amber-200 flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{item.perkDescription}</span>
                          </div>
                        </div>

                        {/* Equip Action */}
                        <div className="pt-2 border-t border-neutral-800">
                          {isEquipped ? (
                            <div className="w-full py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              EQUIPPED
                            </div>
                          ) : isUnlocked ? (
                            <button
                              onClick={() => {
                                sound.playShieldBlock();
                                onEquipGear?.(item.category, item.id);
                              }}
                              className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow active:scale-95 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              EQUIP ITEM
                            </button>
                          ) : (
                            <div className="w-full py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs flex items-center justify-center gap-1 font-mono">
                              <Lock className="w-3.5 h-3.5 text-neutral-500" />
                              Need {item.requiredPoints - currentValor} more pts
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Clan Skins Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {availableSkins.map((skin) => {
                    const isActive = skin.id === activeSkinId;
                    return (
                      <div
                        key={skin.id}
                        onClick={() => onSelectSkin(skin)}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 cursor-pointer transition select-none ${
                          isActive
                            ? 'bg-neutral-800 border-amber-500 shadow-lg ring-1 ring-amber-500/50'
                            : 'bg-neutral-950/70 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Swatches Visual */}
                          <div className="h-24 rounded-lg flex items-center justify-center p-3 relative overflow-hidden bg-neutral-900 border border-neutral-800">
                            <div
                              className="w-10 h-10 rounded border border-neutral-700 shadow-md transform -rotate-6"
                              style={{ backgroundColor: skin.shirtColor }}
                            />
                            <div
                              className="w-9 h-9 rounded border border-neutral-700 shadow-md transform rotate-12 -ml-2"
                              style={{ backgroundColor: skin.helmetColor }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border border-neutral-700 shadow-md transform rotate-45 -ml-1"
                              style={{ backgroundColor: skin.beardColor }}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-sm font-bold text-white">{skin.name}</h4>
                              {isActive && (
                                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                                  Equipped
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400 mt-0.5">{skin.title}</p>
                          </div>
                        </div>

                        <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-800 flex items-center justify-between">
                          <span>Crest: {skin.shieldCrest}</span>
                          <span className="text-amber-400 font-semibold">
                            {skin.unlocked ? 'Unlocked' : `${skin.price} Silver`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Ready to Deploy Bar */}
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-neutral-300">
                  <span className="font-bold text-amber-400">Battle Arsenal: </span>
                  Standard issue includes Weapon [1], Shield [2], Gjallarhorn [3], and Mead Horn [4]. Equipping shields or weapons physically transforms your 3D warrior in combat.
                </div>
                <button
                  onClick={() => handleLaunchScenario(selectedScenario)}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Deploy with Selected Regalia
                </button>
              </div>
            </div>
          ) : (
            /* Tab 3: Tactical Intel & Lore */
            <div className="space-y-6 max-w-4xl">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-['Cinzel',serif]">
                  Viking Warfare & Tactical Guide
                </h3>
                <p className="text-xs text-neutral-400">
                  Essential field intelligence for conquering enemy fortifications and surviving warlords.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                    <Shield className="w-4 h-4" />
                    <span>Shield Blocking & Deflection</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Holding <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white font-mono text-[10px]">Right-Click</kbd> raises your round shield, reducing incoming melee and shockwave damage by 85%. Look for metallic clang sparks when deflecting heavy hits.
                  </p>
                </div>

                <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Boss Shockwaves & Enrage</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Chieftains slam the earth to generate expanding frost shockwave rings. Either jump with <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white font-mono text-[10px]">Space</kbd> or raise your shield to deflect the brunt of the kinetic force.
                  </p>
                </div>

                <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                    <Ship className="w-4 h-4" />
                    <span>Longship Drakkar Navigation</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Mount the ship helm at Katfjord Harbor. Accelerate with <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white font-mono text-[10px]">W</kbd>, reverse with <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white font-mono text-[10px]">S</kbd>, and steer with <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white font-mono text-[10px]">A/D</kbd> across the open waves.
                  </p>
                </div>

                <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
                    <Crosshair className="w-4 h-4" />
                    <span>Destructible Fortifications</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Enemy beachheads and passes are fortified with wooden palisades and spiked barricades. Equip your Battle Axe [1] to smash them and clear passage for your clan.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-300">
                  Ready to test your mettle in combat? Select your campaign and enter the theater.
                </span>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg transition"
                >
                  View Campaigns
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quiet Footer */}
        <footer className="px-6 py-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span>Katfjord Fjord & North Sea Archipelago</span>
          </div>
          <div className="flex items-center gap-2">
            <span>[WASD] Move · [Space] Jump · [1-6] Tools · [Right-Click] Block · [E] Interact</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
