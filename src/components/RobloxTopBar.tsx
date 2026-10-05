import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Users,
  Scroll,
  Shirt,
  Smile,
  Maximize2,
  Minimize2,
  Coins,
  ShieldAlert,
  Swords,
  Sun,
  CloudFog,
  Snowflake,
  Zap,
  Shield,
  Trophy,
  Menu,
  X,
  RotateCcw,
  Crown,
  Sparkles,
  Hammer,
  Flag,
  PoundSterling,
  Radio,
  TreePine,
  HelpCircle,
  Fish,
  Target,
  Skull,
} from 'lucide-react';
import { WeatherCondition } from '../types';
import { sound } from '../audio/soundEngine';

interface RobloxTopBarProps {
  silver: number;
  valor?: number;
  gbpBalance?: number;
  level: number;
  clan: string;
  isMuted: boolean;
  onToggleMute: () => void;
  showLeaderboard: boolean;
  onToggleLeaderboard: () => void;
  showQuests: boolean;
  onToggleQuests: () => void;
  showCustomizer: boolean;
  onToggleCustomizer: () => void;
  showEmotes: boolean;
  onToggleEmotes: () => void;
  showArmory?: boolean;
  onToggleArmory?: () => void;
  onResetCharacter: () => void;
  showLandingPage: boolean;
  onToggleLandingPage: () => void;
  currentWeather: WeatherCondition;
  onToggleWeather: () => void;
  showGamepasses?: boolean;
  onToggleGamepasses?: () => void;
  showPets?: boolean;
  onTogglePets?: () => void;
  showTycoon?: boolean;
  onToggleTycoon?: () => void;
  showClanHub?: boolean;
  onToggleClanHub?: () => void;
  showMultiplayer?: boolean;
  onToggleMultiplayer?: () => void;
  onlinePlayerCount?: number;
  isMultiplayerConnected?: boolean;
  showYoungVikingRealm?: boolean;
  onToggleYoungVikingRealm?: () => void;
  showHowToPlay?: boolean;
  onToggleHowToPlay?: () => void;
  showFishing?: boolean;
  onToggleFishing?: () => void;
  showArchery?: boolean;
  onToggleArchery?: () => void;
  showBuilding?: boolean;
  onToggleBuilding?: () => void;
  showConquest?: boolean;
  onToggleConquest?: () => void;
  onEnterCrypt?: () => void;
}

export const RobloxTopBar: React.FC<RobloxTopBarProps> = ({
  silver,
  valor = 0,
  gbpBalance = 25.0,
  level,
  clan,
  isMuted,
  onToggleMute,
  showLeaderboard,
  onToggleLeaderboard,
  showQuests,
  onToggleQuests,
  showCustomizer,
  onToggleCustomizer,
  showEmotes,
  onToggleEmotes,
  showArmory,
  onToggleArmory,
  onResetCharacter,
  showLandingPage,
  onToggleLandingPage,
  currentWeather,
  onToggleWeather,
  showGamepasses,
  onToggleGamepasses,
  showPets,
  onTogglePets,
  showTycoon,
  onToggleTycoon,
  showClanHub,
  onToggleClanHub,
  showMultiplayer,
  onToggleMultiplayer,
  onlinePlayerCount = 1,
  isMultiplayerConnected = false,
  showYoungVikingRealm,
  onToggleYoungVikingRealm,
  showHowToPlay,
  onToggleHowToPlay,
  showFishing,
  onToggleFishing,
  showArchery,
  onToggleArchery,
  showBuilding,
  onToggleBuilding,
  showConquest,
  onToggleConquest,
  onEnterCrypt,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-700/60 select-none text-white text-xs sm:text-sm font-sans shadow-lg gap-2">
        {/* Left: Roblox Logo & Game Title */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          {/* Classic Roblox Slanted Square Icon */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-neutral-800 rounded flex items-center justify-center border border-neutral-600 hover:border-neutral-400 cursor-pointer transition shadow-inner shrink-0">
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-white transform -rotate-12 rounded-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-neutral-900 rounded-[1px]" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="font-extrabold tracking-wide text-amber-400 font-['Cinzel',serif] text-xs sm:text-base drop-shadow whitespace-nowrap leading-normal">
              STORYSIAN
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-red-700 text-red-100 rounded tracking-wider uppercase whitespace-nowrap shrink-0">
              RAIDS
            </span>
          </div>

          {/* Compact Mobile Stats Badge (Visible on small screens) */}
          <div className="flex md:hidden items-center gap-1.5 px-2 py-0.5 bg-neutral-800/90 rounded border border-neutral-700/80 text-[11px] font-bold shrink-0">
            <span className="flex items-center gap-0.5 text-sky-300">
              <Trophy className="w-3 h-3 text-sky-400" />
              <span>{valor}</span>
            </span>
            <span className="text-neutral-500">|</span>
            <span className="flex items-center gap-0.5 text-amber-300">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>{silver}</span>
            </span>
          </div>
        </div>

        {/* Center: Clan, Valor Points & Silver Robux Counter (Desktop) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800/90 rounded border border-neutral-700">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-300 font-medium text-xs">{clan}</span>
            <span className="text-[10px] font-bold px-1 bg-amber-500/20 text-amber-300 rounded">
              Lv.{level}
            </span>
          </div>

          {/* Valor Points Honor Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 rounded-full border border-sky-500/40 shadow-inner">
            <Trophy className="w-4 h-4 text-sky-400 animate-pulse" />
            <span className="font-extrabold text-sky-300 tabular-nums text-xs sm:text-sm">
              {valor.toLocaleString()}
            </span>
            <span className="text-[10px] text-sky-200/70 font-semibold uppercase">Valor</span>
          </div>

          {/* Silver Coins / Robux Style Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 rounded-full border border-amber-500/40 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-extrabold text-amber-300 tabular-nums text-xs sm:text-sm">
              {silver.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-200/70 font-semibold uppercase">Silver</span>
          </div>

          {/* UK Sterling (£ GBP) Royal Wallet Balance Button */}
          <button
            onClick={onToggleGamepasses}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/90 hover:bg-emerald-900 rounded-full border border-emerald-500/50 shadow-inner transition cursor-pointer"
            title="Open £ GBP Royal Mint & PayPal Store"
          >
            <PoundSterling className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-extrabold text-emerald-300 tabular-nums text-xs sm:text-sm font-mono">
              £{gbpBalance.toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-200/80 font-bold uppercase">GBP</span>
          </button>
        </div>

        {/* Right Action Icons: War Council, Armory, and Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* War Council / Battles & Siege Map Button */}
          <button
            onClick={onToggleLandingPage}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
              showLandingPage
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md ring-1 ring-amber-400'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-extrabold shadow'
            }`}
            title="War Council: Choose Battles or Board Drakkar Warship"
          >
            <Swords className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">War Council</span>
          </button>

          {/* Mobile Quick Menu Hamburger Button (Always visible on mobile < md right next to War Council) */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-md transition shrink-0 cursor-pointer ${
              showMobileMenu
                ? 'bg-amber-500 text-neutral-950 ring-2 ring-amber-300'
                : 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
            }`}
            title="Open Full Viking Game Menu"
            aria-label="Toggle Mobile Menu"
          >
            {showMobileMenu ? <X className="w-4 h-4 shrink-0" /> : <Menu className="w-4 h-4 shrink-0" />}
            <span className="text-[11px] font-black uppercase tracking-wider">MENU</span>
          </button>

          {/* Live Multiplayer Realms, Co-Op Boss & PvP Button (Desktop) */}
          {onToggleMultiplayer && (
            <button
              onClick={onToggleMultiplayer}
              className={`hidden md:flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showMultiplayer
                  ? 'bg-emerald-500 text-neutral-950 shadow-md ring-1 ring-emerald-300'
                  : 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/60 shadow-sm'
              }`}
              title="Live Multiplayer Realms, Co-Op World Boss Raid & Holmgang PvP [P]"
            >
              <Radio
                className={`w-3.5 h-3.5 shrink-0 ${
                  showMultiplayer
                    ? 'text-neutral-950'
                    : isMultiplayerConnected
                    ? 'text-emerald-400 animate-pulse'
                    : 'text-amber-400'
                }`}
              />
              <span>Multiplayer</span>
              <span className="font-mono text-[10px]">({onlinePlayerCount})</span>
            </button>
          )}

          {/* Young Viking Forager Meadow Realm Button (Desktop) */}
          {onToggleYoungVikingRealm && (
            <button
              onClick={onToggleYoungVikingRealm}
              className={`hidden md:flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showYoungVikingRealm
                  ? 'bg-emerald-500 text-neutral-950 shadow-md ring-1 ring-emerald-300'
                  : 'bg-emerald-950/85 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/60'
              }`}
              title="Young Viking Wanderer & Forager Meadow Realm [Y]"
            >
              <TreePine className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Young Viking</span>
              <span className="hidden xl:inline text-[9px] text-emerald-200 font-mono">[Y]</span>
            </button>
          )}

          {/* How to Play & Keyboard Shortcuts Guide Button [?] (Desktop) */}
          {onToggleHowToPlay && (
            <button
              onClick={onToggleHowToPlay}
              className={`hidden md:flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showHowToPlay
                  ? 'bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-200'
                  : 'bg-amber-950/85 hover:bg-amber-900 text-amber-300 border border-amber-500/60'
              }`}
              title="How to Play, WASD & Keyboard Shortcuts [?]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>How to Play</span>
              <span className="hidden xl:inline text-[9px] text-amber-200 font-mono">[?]</span>
            </button>
          )}

          {/* Armory Button (Desktop & Tablet) */}
          {onToggleArmory && (
            <button
              onClick={onToggleArmory}
              className={`hidden md:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showArmory
                  ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/40'
              }`}
              title="Warrior Armory: Shields, Weapons, Helmets (H)"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Armory</span>
              <span className="hidden xl:inline text-[9px] text-neutral-400 font-mono">[H]</span>
            </button>
          )}

          {/* VIP Passes, GBP Store, Saga Pass & Rune Wheel Button (Desktop & Tablet) */}
          {onToggleGamepasses && (
            <button
              onClick={onToggleGamepasses}
              className={`hidden md:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showGamepasses
                  ? 'bg-emerald-500 text-neutral-950 shadow-md'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-emerald-500/50'
              }`}
              title="£ GBP Store, VIP Gamepasses, Saga Pass & Daily Rune Wheel"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">£ GBP & Passes</span>
            </button>
          )}

          {/* 3D Pets & Mounts Button (Desktop & Tablet) */}
          {onTogglePets && (
            <button
              onClick={onTogglePets}
              className={`hidden md:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showPets
                  ? 'bg-sky-500 text-neutral-950 shadow-md'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-sky-300 border border-sky-500/40'
              }`}
              title="3D Companion Pets, Egg Hatcher & War Mounts [G]"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline">Pets</span>
            </button>
          )}

          {/* Village Tycoon & Sky Obby Button (Desktop & Tablet) */}
          {onToggleTycoon && (
            <button
              onClick={onToggleTycoon}
              className={`hidden md:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showTycoon
                  ? 'bg-emerald-500 text-neutral-950 shadow-md'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-emerald-500/40'
              }`}
              title="Katfjord Village Tycoon & Valhalla Sky Obby"
            >
              <Hammer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Tycoon & Obby</span>
            </button>
          )}

          {/* Clan, Territory & Trading Post Button */}
          {onToggleClanHub && (
            <button
              onClick={onToggleClanHub}
              className={`hidden sm:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showClanHub
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
              }`}
              title="Clan Stronghold, Player Trading & Achievement Badges"
            >
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Clan & Trade</span>
            </button>
          )}

          {/* Fjord Fishing Mini-Game Button */}
          {onToggleFishing && (
            <button
              onClick={onToggleFishing}
              className={`hidden lg:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showFishing
                  ? 'bg-sky-500 text-neutral-950 shadow-md ring-1 ring-sky-300'
                  : 'bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/50'
              }`}
              title="Katfjord Fishing & Catch Log [K]"
            >
              <Fish className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xl:inline">Fishing</span>
              <span className="hidden xl:inline text-[9px] text-sky-200 font-mono">[K]</span>
            </button>
          )}

          {/* Viking Archery Range Button */}
          {onToggleArchery && (
            <button
              onClick={onToggleArchery}
              className={`hidden lg:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showArchery
                  ? 'bg-amber-500 text-neutral-950 shadow-md ring-1 ring-amber-300'
                  : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/50'
              }`}
              title="Norse Archery Range & Quiver [O]"
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Archery</span>
              <span className="hidden xl:inline text-[9px] text-amber-200 font-mono">[O]</span>
            </button>
          )}

          {/* Fortress Base Construction Button */}
          {onToggleBuilding && (
            <button
              onClick={onToggleBuilding}
              className={`hidden lg:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showBuilding
                  ? 'bg-emerald-500 text-neutral-950 shadow-md ring-1 ring-emerald-300'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50'
              }`}
              title="Katfjord Fortress Building & Raid Defense [U]"
            >
              <Hammer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Build</span>
              <span className="hidden xl:inline text-[9px] text-emerald-200 font-mono">[U]</span>
            </button>
          )}

          {/* Clan Territory Wars GvG Button */}
          {onToggleConquest && (
            <button
              onClick={onToggleConquest}
              className={`hidden xl:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer ${
                showConquest
                  ? 'bg-red-500 text-white shadow-md ring-1 ring-red-300'
                  : 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50'
              }`}
              title="Clan Territory Conquest Battlefields [J]"
            >
              <Flag className="w-3.5 h-3.5 text-red-400" />
              <span>Conquest</span>
              <span className="text-[9px] text-red-200 font-mono">[J]</span>
            </button>
          )}

          {/* Draugr Crypt Barrow Dungeon Button */}
          {onEnterCrypt && (
            <button
              onClick={onEnterCrypt}
              className="hidden xl:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition text-xs font-bold shrink-0 cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-emerald-300 border border-emerald-500/40"
              title="Ancient Draugr Crypt Tomb [C]"
            >
              <Skull className="w-3.5 h-3.5 text-emerald-400" />
              <span>Crypt</span>
              <span className="text-[9px] text-emerald-200 font-mono">[C]</span>
            </button>
          )}

          {/* Desktop-only action buttons */}
          <div className="hidden md:flex items-center gap-1 sm:gap-1.5">
            {/* Dynamic Weather System Toggle */}
            <button
              onClick={onToggleWeather}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded transition text-xs font-semibold shrink-0 cursor-pointer ${
                currentWeather === 'sunny'
                  ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/50 shadow-sm'
                  : currentWeather === 'foggy'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-500/50 shadow-sm'
                  : currentWeather === 'snowy'
                  ? 'bg-blue-950/80 hover:bg-blue-900 text-cyan-200 border border-cyan-400/50 shadow-sm'
                  : 'bg-yellow-950/90 hover:bg-yellow-900 text-yellow-300 border border-yellow-500/60 shadow-sm'
              }`}
              title="Dynamic Weather System (V)"
            >
              {currentWeather === 'sunny' && <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              {currentWeather === 'foggy' && <CloudFog className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              {currentWeather === 'snowy' && <Snowflake className="w-3.5 h-3.5 text-cyan-300 shrink-0 animate-pulse" />}
              {currentWeather === 'stormy' && <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0 animate-pulse" />}
              <span className="capitalize font-medium">
                {currentWeather === 'stormy' ? 'Storm' : currentWeather}
              </span>
              <span className="hidden xl:inline text-[9px] text-neutral-400 font-mono">[V]</span>
            </button>

            <button
              onClick={onToggleQuests}
              className={`flex items-center gap-1 px-2 py-1 rounded transition text-xs font-semibold ${
                showQuests
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
              }`}
              title="Quests & Trials (Q)"
            >
              <Scroll className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Quests</span>
            </button>

            <button
              onClick={onToggleCustomizer}
              className={`flex items-center gap-1 px-2 py-1 rounded transition text-xs font-semibold ${
                showCustomizer
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
              }`}
              title="Avatar & Skins"
            >
              <Shirt className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Avatar</span>
            </button>

            <button
              onClick={onToggleEmotes}
              className={`p-1.5 rounded transition ${
                showEmotes
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
              }`}
              title="Emotes (B)"
            >
              <Smile className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleLeaderboard}
              className={`p-1.5 rounded transition ${
                showLeaderboard
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
              }`}
              title="Leaderboard (Tab)"
            >
              <Users className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMute}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-200 transition"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
            </button>

            <button
              onClick={onResetCharacter}
              className="px-2 py-1 bg-red-950/70 hover:bg-red-900 border border-red-800/80 rounded text-[11px] font-bold text-red-200 transition"
              title="Respawn at Katfjord Hall"
            >
              Respawn
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-200 transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer / Quick Menu Popover (Screens < md) */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-12 right-2 z-50 w-72 max-h-[82vh] overflow-y-auto bg-neutral-950/95 backdrop-blur-xl border border-neutral-700/80 rounded-2xl shadow-2xl p-3 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150 text-white select-none">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800 px-1">
            <span className="font-['Cinzel',serif] text-xs font-bold text-amber-400 uppercase tracking-wider">
              Katfjord Viking Menu
            </span>
            <span className="text-[10px] text-neutral-400">Clan: {clan} (Lv.{level})</span>
          </div>

          {/* PRIMARY FEATURED MOBILE REALMS & GUIDES (Top Priority) */}
          <div className="flex flex-col gap-1.5 pb-2 border-b border-neutral-800">
            {/* Live Multiplayer Hub */}
            {onToggleMultiplayer && (
              <button
                onClick={() => {
                  onToggleMultiplayer();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-between p-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 rounded-xl text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <span>Multiplayer Hub [P]</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">Co-Op Boss, Naval &amp; PvP</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px]">
                  {onlinePlayerCount} Online
                </span>
              </button>
            )}

            {/* Young Viking Forager Meadow Realm */}
            {onToggleYoungVikingRealm && (
              <button
                onClick={() => {
                  onToggleYoungVikingRealm();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-between p-2.5 bg-emerald-950/70 hover:bg-emerald-900 border border-teal-500/40 rounded-xl text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                    <TreePine className="w-4 h-4 text-teal-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-teal-200">Young Viking Meadow [Y]</div>
                    <div className="text-[10px] text-neutral-400">Peaceful Foraging &amp; Campfire</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide">Enter</span>
              </button>
            )}

            {/* How to Play & Controls Guide */}
            {onToggleHowToPlay && (
              <button
                onClick={() => {
                  onToggleHowToPlay();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-between p-2.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 rounded-xl text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-300">How to Play &amp; Controls [?]</div>
                    <div className="text-[10px] text-neutral-400">Touch, WASD, Skills &amp; Guide</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">View</span>
              </button>
            )}

            {/* War Council & Battles */}
            <button
              onClick={() => {
                onToggleLandingPage();
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center justify-between p-2.5 bg-gradient-to-r from-red-950/60 to-amber-950/60 hover:from-red-900/80 hover:to-amber-900/80 border border-red-500/40 rounded-xl text-left transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center">
                  <Swords className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">War Council &amp; Siege Battles</div>
                  <div className="text-[10px] text-neutral-400">Campaigns, Naval Siege &amp; Outposts</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">Play</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {/* Armory Button */}
            {onToggleArmory && (
              <button
                onClick={() => {
                  onToggleArmory();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium cursor-pointer"
              >
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Armory Gear</span>
              </button>
            )}
            {onToggleGamepasses && (
              <button
                onClick={() => {
                  onToggleGamepasses();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium"
              >
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <span>VIP Passes</span>
              </button>
            )}

            {onTogglePets && (
              <button
                onClick={() => {
                  onTogglePets();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium"
              >
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Pets & Mounts</span>
              </button>
            )}

            {onToggleTycoon && (
              <button
                onClick={() => {
                  onToggleTycoon();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium"
              >
                <Hammer className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tycoon & Obby</span>
              </button>
            )}

            {onToggleClanHub && (
              <button
                onClick={() => {
                  onToggleClanHub();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium"
              >
                <Flag className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Clan & Trade</span>
              </button>
            )}

            {onToggleFishing && (
              <button
                onClick={() => {
                  onToggleFishing();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 p-2 bg-sky-950/70 hover:bg-sky-900 rounded-xl border border-sky-500/40 text-left text-xs font-medium text-sky-200"
              >
                <Fish className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Fjord Fishing</span>
              </button>
            )}

            {onToggleArchery && (
              <button
                onClick={() => {
                  onToggleArchery();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 p-2 bg-amber-950/70 hover:bg-amber-900 rounded-xl border border-amber-500/40 text-left text-xs font-medium text-amber-200"
              >
                <Target className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Archery Range</span>
              </button>
            )}

            {onToggleBuilding && (
              <button
                onClick={() => {
                  onToggleBuilding();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 p-2 bg-emerald-950/70 hover:bg-emerald-900 rounded-xl border border-emerald-500/40 text-left text-xs font-medium text-emerald-200"
              >
                <Hammer className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Fortress Build</span>
              </button>
            )}

            {onToggleConquest && (
              <button
                onClick={() => {
                  onToggleConquest();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 p-2 bg-red-950/70 hover:bg-red-900 rounded-xl border border-red-500/40 text-left text-xs font-medium text-red-200"
              >
                <Flag className="w-4 h-4 text-red-400 shrink-0" />
                <span>Clan Conquest</span>
              </button>
            )}

            {onEnterCrypt && (
              <button
                onClick={() => {
                  onEnterCrypt();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 p-2 bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-emerald-500/40 text-left text-xs font-medium text-emerald-300"
              >
                <Skull className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Draugr Crypt</span>
              </button>
            )}

            {/* Weather Toggle */}
            <button
              onClick={() => {
                onToggleWeather();
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium"
            >
              {currentWeather === 'sunny' && <Sun className="w-4 h-4 text-amber-400 shrink-0" />}
              {currentWeather === 'foggy' && <CloudFog className="w-4 h-4 text-slate-300 shrink-0" />}
              {currentWeather === 'snowy' && <Snowflake className="w-4 h-4 text-cyan-300 shrink-0" />}
              {currentWeather === 'stormy' && <Zap className="w-4 h-4 text-yellow-400 shrink-0 animate-pulse" />}
              <span className="capitalize">{currentWeather === 'stormy' ? 'Storm Sea' : currentWeather}</span>
            </button>

            {/* Quests Button */}
            <button
              onClick={() => {
                onToggleQuests();
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium"
            >
              <Scroll className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Quests</span>
            </button>

            {/* Avatar Skins Button */}
            <button
              onClick={() => {
                onToggleCustomizer();
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium"
            >
              <Shirt className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Skins</span>
            </button>

            {/* Emotes Button */}
            <button
              onClick={() => {
                onToggleEmotes();
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium"
            >
              <Smile className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Emotes</span>
            </button>

            {/* Leaderboard Button */}
            <button
              onClick={() => {
                onToggleLeaderboard();
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium"
            >
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Ranks</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={onToggleMute}
              className="flex items-center gap-2 p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left text-xs font-medium"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-red-300">Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-green-300">Mute</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-800">
            {/* Respawn Button */}
            <button
              onClick={() => {
                onResetCharacter();
                setShowMobileMenu(false);
              }}
              className="flex-1 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800/80 rounded-lg text-xs font-bold text-red-200 text-center flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Respawn</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={() => {
                toggleFullscreen();
                setShowMobileMenu(false);
              }}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 border border-neutral-700"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
