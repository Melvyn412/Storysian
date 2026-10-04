/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VikingWorld, WeatherCondition } from './game/VikingWorld';
import { CharacterController } from './game/CharacterController';
import { NPCManager } from './game/NPCManager';
import { RemotePlayerManager } from './game/RemotePlayerManager';
import {
  YoungVikingMeadowManager,
  INITIAL_MEADOW_NODES,
  MEADOW_CENTER,
  KATFJORD_MEADOW_ARCHWAY,
  MEADOW_RETURN_ARCHWAY,
} from './game/YoungVikingMeadowManager';
import { sound } from './audio/soundEngine';
import {
  ToolType,
  HotbarItem,
  PlayerStats,
  Quest,
  ChatMessage,
  LeaderboardPlayer,
  AvatarSkin,
  BattleScenario,
  ActiveCampaignState,
  BossCombatState,
  FloatingCombatNumber,
  EquippedGear,
  ArmoryCategory,
  GamepassItem,
  GBPTransactionRecord,
  SagaPassTier,
  VikingPet,
  VikingMount,
  PetId,
  MountId,
  TycoonBuilding,
  AchievementBadge,
  TradeOffer,
  RemotePlayerState,
  SharedWorldBoss,
  SupplyDropEvent,
  TerritoryHolderState,
  SeaSerpentState,
  NiflheimDungeonBoss,
  TacticalPingEvent,
  MeadowGatherNode,
  YoungVikingSatchel,
  FishSpecies,
  FishingState,
  CaughtFishRecord,
  ArrowType,
  TargetScoreRecord,
  BuildableStructureType,
  RaidWaveState,
  PetEvolutionData,
  MountArmorPiece,
  ClanConquestTower,
} from './types';
import { FishingManager } from './game/FishingManager';
import { ArcheryManager } from './game/ArcheryManager';
import { BuildingManager } from './game/BuildingManager';
import { DraugrCryptManager } from './game/DraugrCryptManager';
import { ClanConquestManager } from './game/ClanConquestManager';
import { BATTLE_SCENARIOS } from './game/battleScenarios';
import { createCampaignSteps } from './game/campaignConfig';
import { ARMORY_ITEMS, DEFAULT_EQUIPPED_GEAR } from './game/armoryConfig';
import {
  GBP_CURRENCY_PACKS,
  INITIAL_GAMEPASSES,
  INITIAL_SAGA_PASS_TIERS,
  INITIAL_PETS,
  INITIAL_MOUNTS,
  INITIAL_TYCOON_BUILDINGS,
  WEAPON_SKILLS,
  INITIAL_BADGES,
  INITIAL_TRADE_OFFERS,
  RUNE_WHEEL_PRIZES,
  INITIAL_PET_EVOLUTIONS,
  MOUNT_ARMOR_CATALOG,
  CONQUEST_TOWERS,
} from './game/robloxFeaturesConfig';

// UI Components
import { RobloxTopBar } from './components/RobloxTopBar';
import { RobloxLeaderboard } from './components/RobloxLeaderboard';
import { RobloxHotbar } from './components/RobloxHotbar';
import { PlayerHUD } from './components/PlayerHUD';
import { RobloxChat } from './components/RobloxChat';
import { QuestTracker } from './components/QuestTracker';
import { AvatarCustomizer } from './components/AvatarCustomizer';
import { ShipControlHUD } from './components/ShipControlHUD';
import { EmoteMenu } from './components/EmoteMenu';
import { MobileControls } from './components/MobileControls';
import { VikingLandingPage } from './components/VikingLandingPage';
import { BossHealthHUD } from './components/BossHealthHUD';
import { CampaignTrackerHUD } from './components/CampaignTrackerHUD';
import { CampaignVictoryModal } from './components/CampaignVictoryModal';
import { FloatingCombatTextHUD } from './components/FloatingCombatTextHUD';
import { ArmoryModal } from './components/ArmoryModal';
import { GamepassStoreModal, PendingGBPOrder } from './components/GamepassStoreModal';
import { PetsAndMountsModal } from './components/PetsAndMountsModal';
import { TycoonAndObbyModal } from './components/TycoonAndObbyModal';
import { ClanAndSocialModal } from './components/ClanAndSocialModal';
import { RadarMinimapHUD } from './components/RadarMinimapHUD';
import { MultiplayerModal } from './components/MultiplayerModal';
import { TacticalWheelModal, TacticalCommandOption } from './components/TacticalWheelModal';
import { YoungVikingRealmModal } from './components/YoungVikingRealmModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { FishingMiniGameModal } from './components/FishingMiniGameModal';
import { FishingHUD } from './components/FishingHUD';
import { ArcheryHUD } from './components/ArcheryHUD';
import { BuildingHUD } from './components/BuildingHUD';
import { ClanConquestHUD } from './components/ClanConquestHUD';

const INITIAL_SKINS: AvatarSkin[] = [
  {
    id: 'skin_jarl',
    name: 'Katfjord Jarl',
    title: 'Noble Ruler of the Fjord',
    bodyColor: '#f59e0b',
    shirtColor: '#991b1b',
    pantsColor: '#3f3f46',
    beardColor: '#d97706',
    helmetColor: '#475569',
    hornColor: '#fef3c7',
    shieldCrest: 'Blood Raven',
    unlocked: true,
    price: 0,
  },
  {
    id: 'skin_berserker',
    name: 'Grizzly Berserker',
    title: 'Frenzied Bear Warrior',
    bodyColor: '#d97706',
    shirtColor: '#78350f',
    pantsColor: '#1c1917',
    beardColor: '#ea580c',
    helmetColor: '#1e293b',
    hornColor: '#fbbf24',
    shieldCrest: 'Bear Claw',
    unlocked: false,
    price: 150,
  },
  {
    id: 'skin_valkyrie',
    name: 'Valkyrie Shieldmaiden',
    title: 'Chosen Defender of Valhalla',
    bodyColor: '#fde047',
    shirtColor: '#0284c7',
    pantsColor: '#0f172a',
    beardColor: '#facc15',
    helmetColor: '#94a3b8',
    hornColor: '#ffffff',
    shieldCrest: 'Winged Spear',
    unlocked: false,
    price: 300,
  },
  {
    id: 'skin_frostfang',
    name: 'Frostfang Raider',
    title: 'Conqueror of the Icy Seas',
    bodyColor: '#e0f2fe',
    shirtColor: '#1e3a8a',
    pantsColor: '#090d16',
    beardColor: '#94a3b8',
    helmetColor: '#334155',
    hornColor: '#67e8f9',
    shieldCrest: 'Frost Dragon',
    unlocked: false,
    price: 450,
  },
];

const INITIAL_HOTBAR: HotbarItem[] = [
  {
    id: 'tool_axe',
    name: 'Battle Axe',
    slot: 1,
    type: 'axe',
    iconName: 'axe',
    description: 'Cleave foes, chop pines, and mine iron deposits',
    cooldown: 0.35,
  },
  {
    id: 'tool_shield',
    name: 'Round Shield',
    slot: 2,
    type: 'shield',
    iconName: 'shield',
    description: 'Right-click to block incoming strikes (-80% damage)',
    cooldown: 0.1,
  },
  {
    id: 'tool_horn',
    name: 'Gjallarhorn',
    slot: 3,
    type: 'horn',
    iconName: 'horn',
    description: 'Sound the war horn to rally the clan (+Valor & Speed)',
    cooldown: 2.0,
  },
  {
    id: 'tool_mead',
    name: 'Mead Tankard',
    slot: 4,
    type: 'mead',
    iconName: 'mead',
    description: 'Drink golden Norse mead to restore 40 Health',
    cooldown: 1.5,
  },
  {
    id: 'tool_torch',
    name: 'Pine Torch',
    slot: 5,
    type: 'torch',
    iconName: 'torch',
    description: 'Illuminate dark fjords and mountain passes',
    cooldown: 0.2,
  },
  {
    id: 'tool_hammer',
    name: 'Builder Hammer',
    slot: 6,
    type: 'hammer',
    iconName: 'hammer',
    description: 'Fortress construction mode & wooden defense walls (-2 Wood)',
    cooldown: 0.8,
  },
  {
    id: 'tool_fishing_rod',
    name: 'Fjord Fishing Rod',
    slot: 7,
    type: 'fishing_rod',
    iconName: 'fishing_rod',
    description: 'Cast into Fjord waters to hook and reel in fish [K]',
    cooldown: 0.5,
  },
  {
    id: 'tool_bow',
    name: 'Norse Longbow',
    slot: 8,
    type: 'bow',
    iconName: 'bow',
    description: 'Aim and shoot Bodkin, Flame, and Frost arrows [O]',
    cooldown: 0.6,
  },
];

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q_timber',
    title: 'Lumber for the Longhouse',
    description: 'Chop down 3 Great Pines using your Battle Axe [1]',
    targetCount: 3,
    currentCount: 0,
    rewardSilver: 80,
    rewardValor: 120,
    completed: false,
    type: 'chop',
  },
  {
    id: 'q_iron',
    title: 'Iron for the Smith',
    description: 'Mine 2 Iron Ore deposits in the hills',
    targetCount: 2,
    currentCount: 0,
    rewardSilver: 120,
    rewardValor: 180,
    completed: false,
    type: 'mine',
  },
  {
    id: 'q_horn',
    title: 'Call to Arms',
    description: 'Blow the Gjallarhorn [3] to rally Katfjord warriors',
    targetCount: 1,
    currentCount: 0,
    rewardSilver: 60,
    rewardValor: 90,
    completed: false,
    type: 'horn',
  },
  {
    id: 'q_sail',
    title: 'Voyage on the Drakkar',
    description: 'Board the Viking Longship at the pier and set sail',
    targetCount: 1,
    currentCount: 0,
    rewardSilver: 150,
    rewardValor: 200,
    completed: false,
    type: 'sail',
  },
  {
    id: 'q_raid',
    title: 'Frostfang Incursion',
    description: 'Defeat 2 Frostfang Raiders at their island outpost',
    targetCount: 2,
    currentCount: 0,
    rewardSilver: 250,
    rewardValor: 350,
    completed: false,
    type: 'raid',
  },
  {
    id: 'q_relic',
    title: 'The Golden Relic',
    description: 'Loot the sacred Golden Relic chest at the outpost',
    targetCount: 1,
    currentCount: 0,
    rewardSilver: 500,
    rewardValor: 600,
    completed: false,
    type: 'raid',
  },
];

const INITIAL_PLAYERS: LeaderboardPlayer[] = [
  { id: 'p1', name: 'Ragnar_Lothbrok', clan: 'Katfjord', level: 12, silver: 2450, kills: 28 },
  { id: 'p_self', name: 'You (Jarl_Thor)', clan: 'Katfjord', level: 1, silver: 100, kills: 0, isSelf: true },
  { id: 'p2', name: 'Valkyrie_99', clan: 'Katfjord', level: 8, silver: 1320, kills: 14 },
  { id: 'p3', name: 'Bjorn_Ironside', clan: 'Ironside', level: 10, silver: 1890, kills: 22 },
  { id: 'p4', name: 'Floki_Shipwright', clan: 'Raven', level: 7, silver: 980, kills: 5 },
  { id: 'p5', name: 'Frost_Slayer', clan: 'Frostfang', level: 9, silver: 1400, kills: 19 },
];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<VikingWorld | null>(null);
  const playerRef = useRef<CharacterController | null>(null);
  const npcRef = useRef<NPCManager | null>(null);
  const remoteMgrRef = useRef<RemotePlayerManager | null>(null);
  const meadowMgrRef = useRef<YoungVikingMeadowManager | null>(null);
  const fishingMgrRef = useRef<FishingManager | null>(null);
  const archeryMgrRef = useRef<ArcheryManager | null>(null);
  const buildingMgrRef = useRef<BuildingManager | null>(null);
  const draugrCryptMgrRef = useRef<DraugrCryptManager | null>(null);
  const clanConquestMgrRef = useRef<ClanConquestManager | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const selfPlayerIdRef = useRef<string>(
    `jarl_${Math.random().toString(36).slice(2, 8)}`
  );

  // Game UI State
  const [stats, setStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    valor: 0,
    silver: 150,
    level: 1,
    wood: 6,
    iron: 2,
    clan: 'Katfjord Clan',
    name: 'Jarl_Thor',
    skinId: 'skin_jarl',
    equippedGear: DEFAULT_EQUIPPED_GEAR,
    isSailing: false,
  });

  const [activeSlot, setActiveSlot] = useState<number>(1);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [players, setPlayers] = useState<LeaderboardPlayer[]>(INITIAL_PLAYERS);
  const [skins, setSkins] = useState<AvatarSkin[]>(INITIAL_SKINS);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [damageFlash, setDamageFlash] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Modals & Panels
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  const [showArmory, setShowArmory] = useState<boolean>(false);
  const [activeBattle, setActiveBattle] = useState<BattleScenario | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<ActiveCampaignState | null>(null);
  const [bossCombatState, setBossCombatState] = useState<BossCombatState | null>(null);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingCombatNumber[]>([]);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [battleBannerNotice, setBattleBannerNotice] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [cameraMode, setCameraMode] = useState<'third_person' | 'close_look' | 'first_person'>('third_person');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);

  // New Roblox Feature Modals & State
  const [showGamepasses, setShowGamepasses] = useState(false);
  const [showPetsModal, setShowPetsModal] = useState(false);
  const [showTycoonModal, setShowTycoonModal] = useState(false);
  const [showClanModal, setShowClanModal] = useState(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [showTacticalWheel, setShowTacticalWheel] = useState(false);
  const [showYoungVikingModal, setShowYoungVikingModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);

  // 6 New Viking Systems State
  const [showFishingModal, setShowFishingModal] = useState(false);
  const [fishingState, setFishingState] = useState<FishingState>({
    status: 'idle',
    bobberPos: null,
    targetFish: null,
    targetFishWeight: 0,
    tension: 20,
    reelProgress: 0,
  });
  const [caughtFishLog, setCaughtFishLog] = useState<CaughtFishRecord[]>([]);
  const [isPlayerNearWater, setIsPlayerNearWater] = useState(false);

  const [showArcheryHUD, setShowArcheryHUD] = useState(false);
  const [selectedArrow, setSelectedArrow] = useState<ArrowType>('bodkin');
  const [quiverStock, setQuiverStock] = useState<Record<ArrowType, number>>({
    bodkin: 99,
    flame: 25,
    frost: 20,
  });
  const [archeryTotalScore, setArcheryTotalScore] = useState(0);
  const [recentTargetScore, setRecentTargetScore] = useState<TargetScoreRecord | null>(null);

  const [showBuildingHUD, setShowBuildingHUD] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState<BuildableStructureType>('palisade_wall');
  const [raidState, setRaidState] = useState<RaidWaveState>({
    isActive: false,
    wave: 0,
    enemiesRemaining: 0,
    totalEnemies: 0,
    rewardSilver: 0,
    rewardValor: 0,
  });

  const [petEvolutions, setPetEvolutions] = useState<Record<PetId, PetEvolutionData>>(INITIAL_PET_EVOLUTIONS);
  const [mountArmor, setMountArmor] = useState<MountArmorPiece[]>(MOUNT_ARMOR_CATALOG);

  const [isInsideCrypt, setIsInsideCrypt] = useState(false);

  const [showConquestHUD, setShowConquestHUD] = useState(false);
  const [conquestTowers, setConquestTowers] = useState<ClanConquestTower[]>(CONQUEST_TOWERS);

  // Young Viking Meadow Sanctuary Realm & Forager Satchel State
  const [isYoungVikingMode, setIsYoungVikingMode] = useState(false);
  const [isAutoWandering, setIsAutoWandering] = useState(false);
  const isAutoWanderingRef = useRef(false);
  isAutoWanderingRef.current = isAutoWandering;
  const [meadowNodes, setMeadowNodes] = useState<MeadowGatherNode[]>(INITIAL_MEADOW_NODES);
  const [totalItemsGathered, setTotalItemsGathered] = useState(0);
  const [foragerSatchel, setForagerSatchel] = useState<YoungVikingSatchel>({
    berries: 2,
    mushrooms: 1,
    honeycomb: 1,
    amber: 0,
    herbs: 2,
    golden_apples: 0,
    runestones: 1,
    driftwood: 1,
  });

  // Real-Time Multiplayer State (WebSockets)
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('room') || 'katfjord-main').trim().toLowerCase();
  });

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.pathname = '/STORYSIAN-VIKING-WAR-COUNCIL.AI.STUDIO';
      if (roomId) {
        url.searchParams.set('room', roomId);
      }
      window.history.replaceState({}, 'STORYSIAN VIKING WAR COUNCIL.AI.STUDIO', url.toString());
      document.title = 'STORYSIAN VIKING WAR COUNCIL.AI.STUDIO';
    } catch {
      // Ignore history errors in restricted contexts
    }
  }, [roomId]);
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayerState[]>([]);
  const [sharedWorldBoss, setSharedWorldBoss] = useState<SharedWorldBoss | null>(null);
  const [seaSerpent, setSeaSerpent] = useState<SeaSerpentState | null>(null);
  const [dungeonBoss, setDungeonBoss] = useState<NiflheimDungeonBoss | null>(null);
  const [activePings, setActivePings] = useState<TacticalPingEvent[]>([]);
  const [supplyDrop, setSupplyDrop] = useState<SupplyDropEvent | null>(null);
  const [territoryHolder, setTerritoryHolder] = useState<TerritoryHolderState | null>(null);
  const sharedWorldBossRef = useRef<SharedWorldBoss | null>(null);
  sharedWorldBossRef.current = sharedWorldBoss;
  const seaSerpentRef = useRef<SeaSerpentState | null>(null);
  seaSerpentRef.current = seaSerpent;
  const dungeonBossRef = useRef<NiflheimDungeonBoss | null>(null);
  dungeonBossRef.current = dungeonBoss;
  const activePingsRef = useRef<TacticalPingEvent[]>([]);
  activePingsRef.current = activePings;
  const supplyDropRef = useRef<SupplyDropEvent | null>(null);
  supplyDropRef.current = supplyDrop;

  const [gamepasses, setGamepasses] = useState<GamepassItem[]>(INITIAL_GAMEPASSES);
  const [sagaTiers, setSagaTiers] = useState<SagaPassTier[]>(INITIAL_SAGA_PASS_TIERS);
  const [hasGoldSagaPass, setHasGoldSagaPass] = useState(false);
  const [freeWheelSpins, setFreeWheelSpins] = useState(2);
  const [gbpWalletBalance, setGbpWalletBalance] = useState<number>(25.0);
  const [gbpTransactions, setGbpTransactions] = useState<GBPTransactionRecord[]>([]);

  const [pets, setPets] = useState<VikingPet[]>(INITIAL_PETS);
  const [activePetId, setActivePetId] = useState<PetId | null>('pet_odin_raven');
  const [mounts, setMounts] = useState<VikingMount[]>(INITIAL_MOUNTS);
  const [activeMountId, setActiveMountId] = useState<MountId | null>(null);

  const [tycoonBuildings, setTycoonBuildings] = useState<TycoonBuilding[]>(INITIAL_TYCOON_BUILDINGS);
  const [uncollectedSilver, setUncollectedSilver] = useState(45);
  const [uncollectedValor, setUncollectedValor] = useState(15);

  const [clanMotto, setClanMotto] = useState('Victory or Valhalla!');
  const [clanTreasury, setClanTreasury] = useState(300);
  const [territoryCaptured, setTerritoryCaptured] = useState(false);
  const [trades, setTrades] = useState<TradeOffer[]>(INITIAL_TRADE_OFFERS);
  const [badges, setBadges] = useState<AchievementBadge[]>(INITIAL_BADGES);

  const [isShiftLocked, setIsShiftLocked] = useState(false);
  const [skillCooldowns, setSkillCooldowns] = useState<
    Record<'whirlwind' | 'thunder_leap' | 'frost_nova', number>
  >({
    whirlwind: 0,
    thunder_leap: 0,
    frost_nova: 0,
  });
  const [radarState, setRadarState] = useState<{
    playerX: number;
    playerZ: number;
    cameraYaw: number;
    blips: Array<{
      id: string;
      x: number;
      z: number;
      type: 'enemy' | 'boss' | 'ally' | 'ship' | 'obby' | 'tycoon' | 'flag';
    }>;
  }>({
    playerX: 0,
    playerZ: 20,
    cameraYaw: 0,
    blips: [],
  });

  // Active Campaign Ref for loop access
  const activeCampaignRef = useRef<ActiveCampaignState | null>(null);
  activeCampaignRef.current = activeCampaign;

  // Longship Sailing State
  const [shipSpeed, setShipSpeed] = useState(0);
  const [shipRotation, setShipRotation] = useState(0);

  // Chat log
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'System',
      text: 'Welcome to Storysian! Equip your Battle Axe [1] and speak with Jarl Erik.',
      isSystem: true,
      time: '12:00',
    },
    {
      id: 'm2',
      sender: 'Jarl Erik',
      clan: 'Katfjord',
      text: 'Hail warrior! Chop timber, mine iron, and prepare to raid the Frostfang outpost!',
      time: '12:01',
    },
    {
      id: 'm3',
      sender: 'Valkyrie_99',
      clan: 'Katfjord',
      text: 'The Drakkar longship is docked and ready to sail across the fjord!',
      time: '12:02',
    },
  ]);

  // Floating Combat Numbers generator
  const addFloatingNumber = useCallback(
    (text: string, color: string, isCrit = false, isBlock = false) => {
      const newNum: FloatingCombatNumber = {
        id: `f_${Date.now()}_${Math.random()}`,
        text,
        color,
        isCrit,
        isBlock,
        x: 50 + (Math.random() - 0.5) * 14,
        y: 48 + (Math.random() - 0.5) * 10,
        createdAt: Date.now(),
      };
      setFloatingNumbers((prev) => [...prev.slice(-14), newNum]);
    },
    []
  );
  const addFloatingNumberRef = useRef(addFloatingNumber);
  addFloatingNumberRef.current = addFloatingNumber;

  // Equip Weapon, Shield, or Headwear from Armory
  const handleEquipItem = useCallback(
    (category: ArmoryCategory, itemId: string) => {
      const item = ARMORY_ITEMS.find((i) => i.id === itemId);
      if (!item) return;

      setStats((prev) => {
        const currentGear = prev.equippedGear || DEFAULT_EQUIPPED_GEAR;
        const newGear: EquippedGear = {
          ...currentGear,
          [category === 'weapon' ? 'weaponId' : category === 'shield' ? 'shieldId' : 'headwearId']: itemId,
        };
        if (playerRef.current) {
          playerRef.current.setEquipment(newGear);
        }
        return {
          ...prev,
          equippedGear: newGear,
        };
      });

      addFloatingNumber(`⚔️ Equipped ${item.name}!`, '#fbbf24', false, false);
      setMessages((prev) => [
        ...prev,
        {
          id: `gear_${Date.now()}`,
          sender: 'Armory',
          text: `Equipped ${item.name} (${item.perkDescription})`,
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    },
    [addFloatingNumber]
  );

  // Advance Campaign Objective Progress
  const advanceCampaignStep = useCallback(
    (type: string, count: number = 1) => {
      setActiveCampaign((prev) => {
        if (!prev || prev.isCompleted) return prev;
        const currentStep = prev.steps[prev.currentStepIndex];
        if (!currentStep || currentStep.completed || currentStep.type !== type) return prev;

        const nextCount = currentStep.currentCount + count;
        const isStepDone = nextCount >= currentStep.targetCount;

        const updatedSteps = prev.steps.map((s, idx) =>
          idx === prev.currentStepIndex
            ? { ...s, currentCount: nextCount, completed: isStepDone }
            : s
        );

        let nextStepIndex = prev.currentStepIndex;
        let campaignFinished = false;

        if (isStepDone) {
          sound.playFanfare();
          if (nextStepIndex + 1 < prev.steps.length) {
            nextStepIndex += 1;
            setBattleBannerNotice(`🎯 OBJECTIVE COMPLETE: ${currentStep.label}!`);
            setTimeout(() => setBattleBannerNotice(null), 3500);
          } else {
            campaignFinished = true;
          }
        }

        if (campaignFinished) {
          sound.playVictoryTriumph();
          setShowVictoryModal(true);
          setStats((st) => ({
            ...st,
            silver: st.silver + prev.scenario.rewardSilver,
            valor: st.valor + prev.scenario.rewardValor,
          }));
          setMessages((m) => [
            ...m,
            {
              id: `vic_${Date.now()}`,
              sender: 'War Council',
              text: `👑 VICTORY! Campaign '${prev.scenario.title}' conquered! Spoils: +${prev.scenario.rewardSilver} Silver, +${prev.scenario.rewardValor} Valor!`,
              isSystem: true,
              time: 'Now',
            },
          ]);
        }

        return {
          ...prev,
          currentStepIndex: nextStepIndex,
          steps: updatedSteps,
          isCompleted: campaignFinished,
        };
      });
    },
    []
  );
  const advanceCampaignStepRef = useRef(advanceCampaignStep);
  advanceCampaignStepRef.current = advanceCampaignStep;

  // Abandon campaign and return safely to Katfjord
  const handleAbandonCampaign = useCallback(() => {
    setActiveCampaign(null);
    setBossCombatState(null);
    if (playerRef.current) {
      playerRef.current.position.set(0, 3.24, 20);
      playerRef.current.velocity.set(0, 0, 0);
    }
    if (worldRef.current) {
      worldRef.current.isShipMounted = false;
      worldRef.current.clearCampaignFortifications();
    }
    setStats((prev) => ({ ...prev, isSailing: false }));
    setMessages((prev) => [
      ...prev,
      {
        id: `retreat_${Date.now()}`,
        sender: 'War Council',
        text: 'You sounded the retreat and regrouped safely at Katfjord Village.',
        isSystem: true,
        time: 'Now',
      },
    ]);
  }, []);

  // Key tracking
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    analogVector: null as { x: number; y: number } | null,
    lookUp: false,
    lookDown: false,
    lookLeft: false,
    lookRight: false,
    lookVector: null as { x: number; y: number } | null,
  });

  // Mouse orbit camera tracking
  const isMouseDownRef = useRef(false);
  const isLeftMouseDownRef = useRef(false);
  const leftMouseDragDistRef = useRef(0);
  const mousePrevRef = useRef({ x: 0, y: 0 });

  // Update Quest Progress helper
  const advanceQuest = useCallback((type: Quest['type'], amount: number = 1) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.type === type && !q.completed) {
          const nextCount = Math.min(q.targetCount, q.currentCount + amount);
          return { ...q, currentCount: nextCount };
        }
        return q;
      })
    );
  }, []);

  // Handle claiming quest rewards
  const handleClaimReward = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || q.completed) return;

    sound.playFanfare();
    setQuests((prev) =>
      prev.map((item) => (item.id === questId ? { ...item, completed: true } : item))
    );

    setStats((prev) => {
      const nextSilver = prev.silver + q.rewardSilver;
      const nextValor = prev.valor + q.rewardValor;
      const nextLevel = Math.floor(nextValor / 200) + 1;
      return {
        ...prev,
        silver: nextSilver,
        valor: nextValor,
        level: nextLevel,
      };
    });

    // Update leaderboard self
    setPlayers((prev) =>
      prev.map((p) =>
        p.isSelf
          ? {
              ...p,
              silver: p.silver + q.rewardSilver,
              level: Math.floor((p.silver + q.rewardSilver) / 200) + 1,
            }
          : p
      )
    );

    // Chat announcement
    setMessages((prev) => [
      ...prev,
      {
        id: `sys_${Date.now()}`,
        sender: 'System',
        text: `You completed "${q.title}" and earned ${q.rewardSilver} Silver!`,
        isSystem: true,
        time: 'Now',
      },
    ]);
  };

  // Unlock Achievement Badge helper
  const unlockBadge = useCallback(
    (badgeId: string) => {
      setBadges((prev) => {
        const target = prev.find((b) => b.id === badgeId);
        if (!target || target.unlocked) return prev;
        sound.playFanfare();
        addFloatingNumber(`🏆 BADGE: ${target.title}!`, '#fbbf24', true);
        setStats((s) => ({ ...s, silver: s.silver + target.rewardSilver }));
        return prev.map((b) => (b.id === badgeId ? { ...b, unlocked: true } : b));
      });
    },
    [addFloatingNumber]
  );

  // Collect passive Tycoon Treasury
  const handleCollectTycoon = useCallback(() => {
    setUncollectedSilver((prevS) => {
      if (prevS <= 0 && uncollectedValor <= 0) return prevS;
      const gainS = Math.floor(prevS);
      const gainV = Math.floor(uncollectedValor);
      if (gainS > 0 || gainV > 0) {
        sound.playFanfare();
        addFloatingNumber(`+${gainS} Tycoon Silver!`, '#10b981', true);
        setStats((st) => ({
          ...st,
          silver: st.silver + gainS,
          valor: st.valor + gainV,
          level: Math.floor((st.valor + gainV) / 200) + 1,
        }));
      }
      setUncollectedValor(0);
      return 0;
    });
  }, [addFloatingNumber, uncollectedValor]);
  const handleCollectTycoonRef = useRef(handleCollectTycoon);
  handleCollectTycoonRef.current = handleCollectTycoon;

  // Toggle Mount helper
  const handleToggleMount = useCallback(
    (mountId?: MountId) => {
      if (!playerRef.current) return;
      const targetId =
        mountId ||
        mounts.find((m) => m.unlocked)?.id ||
        'mount_war_bear';
      const nextMount = activeMountId === targetId ? null : targetId;
      setActiveMountId(nextMount);
      playerRef.current.rebuildMount(nextMount);
      if (nextMount) {
        const mObj = mounts.find((m) => m.id === nextMount);
        sound.playWarHorn();
        addFloatingNumber(`🐎 Mounted ${mObj?.name || 'War Beast'}!`, '#fbbf24', true);
      } else {
        addFloatingNumber('Dismounted', '#94a3b8');
      }
    },
    [activeMountId, mounts, addFloatingNumber]
  );
  const handleToggleMountRef = useRef(handleToggleMount);
  handleToggleMountRef.current = handleToggleMount;

  // Trigger Special Weapon Skill (Z = Whirlwind, X = Thunder Leap, F = Frost Nova)
  const handleTriggerSkill = useCallback(
    (skillId: 'whirlwind' | 'thunder_leap' | 'frost_nova') => {
      if (!playerRef.current || !worldRef.current || !npcRef.current) return;
      if ((skillCooldowns[skillId] || 0) > 0) return;

      const sk = WEAPON_SKILLS.find((s) => s.id === skillId);
      if (!sk) return;

      const player = playerRef.current;
      const world = worldRef.current;
      const npcMgr = npcRef.current;

      setSkillCooldowns((prev) => ({ ...prev, [skillId]: sk.cooldown }));
      player.triggerSkillAnimation(skillId);

      const doublePass = gamepasses.find((g) => g.id === 'gp_double_rewards')?.owned ? 2 : 1;
      const petBonus = pets.find((p) => p.id === activePetId)?.damageBonus || 0;
      const clanBonus = Math.min(50, Math.floor(clanTreasury / 150) * 5);

      if (skillId === 'whirlwind') {
        sound.playAxeSwing();
        world.triggerBossShockwave(player.position);
        addFloatingNumber('🌪️ WHIRLWIND CLEAVE!', '#f59e0b', true);
      } else if (skillId === 'thunder_leap') {
        sound.playCriticalHit();
        world.triggerLightningBoltAt(player.position);
        addFloatingNumber('⚡ THOR LIGHTNING LEAP!', '#38bdf8', true);
      } else if (skillId === 'frost_nova') {
        sound.playFanfare();
        world.triggerBossShockwave(player.position);
        world.spawnCombatSparks(player.position, 'frost');
        setStats((prev) => ({
          ...prev,
          health: Math.min(prev.maxHealth, prev.health + 35),
          stamina: Math.min(prev.maxStamina, prev.stamina + 50),
        }));
        addFloatingNumber('❄️ FROST AEGIS +35 HP!', '#7dd3fc', true);
      }

      const radius = skillId === 'thunder_leap' ? 12 : 9.5;
      const skillDmg =
        (skillId === 'thunder_leap' ? 85 : skillId === 'whirlwind' ? 65 : 50) +
        petBonus +
        clanBonus;

      // Hit nearby barricades
      for (const barricade of world.campaignBarricades) {
        if (!barricade.isDestroyed && barricade.position.distanceTo(player.position) < radius) {
          const destroyed = world.damageBarricade(barricade, skillDmg);
          if (destroyed) advanceCampaignStep('destroy_barricades', 1);
        }
      }

      // Hit nearby hostile NPCs
      for (const npc of npcMgr.npcs) {
        if (npc.isHostile && npc.state !== 'dead') {
          if (npc.mesh.position.distanceTo(player.position) < radius) {
            world.spawnCombatSparks(npc.mesh.position, 'frost');
            const killed = npcMgr.damageNPC(npc, skillDmg);
            addFloatingNumber(`-${skillDmg}`, '#38bdf8', true);
            if (killed) {
              unlockBadge('badge_first_blood');
              const silverGain = (npc.isBoss ? 250 : 50) * doublePass;
              const valorGain = (npc.isBoss ? 350 : 80) * doublePass;
              setStats((prev) => ({
                ...prev,
                silver: prev.silver + silverGain,
                valor: prev.valor + valorGain,
              }));
              if (npc.isBoss) advanceCampaignStep('slay_boss', 1);
              else advanceCampaignStep('defeat_enemies', 1);
            }
          }
        }
      }

      // Hit Shared Co-Op World Raid Boss or Remote PvP Players via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'player:attack',
            damage: skillDmg,
            radius,
          })
        );
        const wb = sharedWorldBossRef.current;
        if (wb && wb.isAlive && Math.hypot(wb.x - player.position.x, wb.z - player.position.z) < radius + 4) {
          wsRef.current.send(
            JSON.stringify({
              type: 'worldboss:hit',
              damage: skillDmg,
            })
          );
          addFloatingNumber(`🔥 WORLD BOSS -${skillDmg}!`, '#f97316', true);
        }
        const db = dungeonBossRef.current;
        if (db && db.isAlive && Math.hypot(db.x - player.position.x, db.z - player.position.z) < radius + 6) {
          wsRef.current.send(
            JSON.stringify({
              type: 'dungeon:hit',
              damage: skillDmg,
            })
          );
          addFloatingNumber(`🐉 NÍÐHÖGGR -${skillDmg}!`, '#a855f7', true);
        }
      }
    },
    [
      skillCooldowns,
      gamepasses,
      pets,
      activePetId,
      clanTreasury,
      addFloatingNumber,
      advanceCampaignStep,
      unlockBadge,
    ]
  );
  const handleTriggerSkillRef = useRef(handleTriggerSkill);
  handleTriggerSkillRef.current = handleTriggerSkill;

  // Passive 1-Second Loop for Tycoon Income, Pet Healing, Territory Tribute & Skill Cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Reduce skill cooldowns
      setSkillCooldowns((prev) => ({
        whirlwind: Math.max(0, +(prev.whirlwind - 0.5).toFixed(1)),
        thunder_leap: Math.max(0, +(prev.thunder_leap - 0.5).toFixed(1)),
        frost_nova: Math.max(0, +(prev.frost_nova - 0.5).toFixed(1)),
      }));

      // 2. Accumulate Tycoon passive Silver & Valor
      const sRate =
        tycoonBuildings.reduce((acc, b) => acc + (b.level > 0 ? b.silverPerSec * b.level : 0), 0) *
        0.5;
      const vRate =
        tycoonBuildings.reduce((acc, b) => acc + (b.level > 0 ? b.valorPerSec * b.level : 0), 0) *
        0.5;
      setUncollectedSilver((p) => p + sRate);
      setUncollectedValor((p) => p + vRate);

      // 3. Pet Regen + Magnet Pass + Territory Capture Tribute
      const activePet = pets.find((p) => p.id === activePetId);
      const hasMagnet = gamepasses.find((g) => g.id === 'gp_resource_magnet')?.owned;
      const passiveSilver = (hasMagnet ? 2 : 0) + (territoryCaptured ? 2.5 : 0);
      const regenHp = activePet ? activePet.regenPerSec * 0.5 : 0;

      if (passiveSilver > 0 || regenHp > 0) {
        setStats((prev) => ({
          ...prev,
          silver: Math.round(prev.silver + passiveSilver),
          health: Math.min(prev.maxHealth, prev.health + regenHp),
        }));
      }

      // 4. Update Radar Blips
      if (playerRef.current && npcRef.current && worldRef.current) {
        const p = playerRef.current;
        const blips: Array<{
          id: string;
          x: number;
          z: number;
          type: 'enemy' | 'boss' | 'ally' | 'ship' | 'obby' | 'tycoon' | 'flag';
        }> = [
          { id: 'b_obby', x: -22, z: 12, type: 'obby' },
          { id: 'b_tycoon', x: 16, z: 16, type: 'tycoon' },
          { id: 'b_flag', x: 24, z: 214, type: 'flag' },
        ];
        if (worldRef.current.shipGroup) {
          blips.push({
            id: 'b_ship',
            x: worldRef.current.shipGroup.position.x,
            z: worldRef.current.shipGroup.position.z,
            type: 'ship',
          });
        }
        for (const npc of npcRef.current.npcs) {
          if (npc.state !== 'dead') {
            blips.push({
              id: npc.id,
              x: npc.mesh.position.x,
              z: npc.mesh.position.z,
              type: npc.isBoss ? 'boss' : npc.isHostile ? 'enemy' : 'ally',
            });
          }
        }
        // Add Shared Co-Op World Boss & Active Meteor Supply Drop + Live Multiplayer Peers to Radar
        if (sharedWorldBossRef.current && sharedWorldBossRef.current.isAlive) {
          blips.push({
            id: 'b_coop_boss',
            x: sharedWorldBossRef.current.x,
            z: sharedWorldBossRef.current.z,
            type: 'boss',
          });
        }
        if (seaSerpentRef.current && seaSerpentRef.current.isAlive) {
          blips.push({
            id: 'b_sea_serpent',
            x: seaSerpentRef.current.x,
            z: seaSerpentRef.current.z,
            type: 'boss',
          });
        }
        if (dungeonBossRef.current && dungeonBossRef.current.isAlive) {
          blips.push({
            id: 'b_dungeon_boss',
            x: dungeonBossRef.current.x,
            z: dungeonBossRef.current.z,
            type: 'boss',
          });
        }
        for (const tp of activePingsRef.current) {
          if (Date.now() - tp.createdAt < 12000) {
            blips.push({
              id: tp.id,
              x: tp.x,
              z: tp.z,
              type: 'flag',
            });
          }
        }
        if (supplyDropRef.current && supplyDropRef.current.active) {
          blips.push({
            id: 'b_meteor_drop',
            x: supplyDropRef.current.x,
            z: supplyDropRef.current.z,
            type: 'flag',
          });
        }
        if (remoteMgrRef.current) {
          for (const rp of remoteMgrRef.current.avatars.values()) {
            blips.push({
              id: `rp_${rp.id}`,
              x: rp.group.position.x,
              z: rp.group.position.z,
              type: 'ally',
            });
          }
        }
        setRadarState({
          playerX: p.position.x,
          playerZ: p.position.z,
          cameraYaw: p.cameraYaw,
          blips,
        });

        // Auto-collect Tycoon Treasury when stepping onto the green collector pad (x:16, z:16)
        if (Math.hypot(p.position.x - 16, p.position.z - 16) < 3.6) {
          handleCollectTycoonRef.current();
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [tycoonBuildings, pets, activePetId, gamepasses, territoryCaptured]);

  // Perform Tool Action (Attack, Chop, Mine, Horn, Drink, Build)
  const handleAction = useCallback(() => {
    if (!playerRef.current || !worldRef.current || !npcRef.current) return;
    const player = playerRef.current;
    const world = worldRef.current;
    const npcMgr = npcRef.current;

    player.triggerAttack();

    const tool = player.activeTool;
    const playerPos = player.position;

    if (tool === 'axe') {
      let hitTarget = false;

      // 1. Check Destructible Campaign Barricades & Palisades
      for (const barricade of world.campaignBarricades) {
        if (!barricade.isDestroyed && barricade.position.distanceTo(playerPos) < 6.5) {
          hitTarget = true;
          const weaponBonus =
            ARMORY_ITEMS.find((w) => w.id === stats.equippedGear?.weaponId)?.damageBonus || 0;
          const barricadeDmg = 35 + weaponBonus;
          const isDestroyed = world.damageBarricade(barricade, barricadeDmg);
          addFloatingNumber(`-${barricadeDmg}`, '#eab308');
          player.triggerCameraShake(0.2);

          setActiveCampaign((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              damageDealt: prev.damageDealt + barricadeDmg,
              barricadesDestroyed: prev.barricadesDestroyed + (isDestroyed ? 1 : 0),
            };
          });

          if (isDestroyed) {
            addFloatingNumber('💥 BARRICADE SMASHED!', '#facc15', true);
            player.triggerCameraShake(0.45);
            advanceCampaignStep('destroy_barricades', 1);
          }
          break;
        }
      }

      // 2. Check enemy raiders and Bosses
      if (!hitTarget) {
        for (const npc of npcMgr.npcs) {
          if (npc.isHostile && npc.state !== 'dead') {
            if (npc.mesh.position.distanceTo(playerPos) < (npc.isBoss ? 5.8 : 4.2)) {
              hitTarget = true;
              const weaponBonus =
                ARMORY_ITEMS.find((w) => w.id === stats.equippedGear?.weaponId)?.damageBonus || 0;
              const petBonus = pets.find((p) => p.id === activePetId)?.damageBonus || 0;
              const clanBonus = Math.min(50, Math.floor(clanTreasury / 150) * 5);
              const doubleMult = gamepasses.find((g) => g.id === 'gp_double_rewards')?.owned ? 2 : 1;
              const isCrit = Math.random() < 0.25;
              const baseDmg = 35 + weaponBonus + petBonus + clanBonus;
              const finalDmg = isCrit ? Math.round(baseDmg * 1.8) : baseDmg;

              if (isCrit) {
                sound.playCriticalHit();
                player.triggerCameraShake(0.4);
                addFloatingNumber(`🔥 CRIT -${finalDmg}!`, '#ef4444', true);
                world.spawnCombatSparks(npc.mesh.position, 'frost');
              } else {
                sound.playHitImpact(false);
                addFloatingNumber(`-${finalDmg}`, '#f97316');
                world.spawnCombatSparks(npc.mesh.position, 'sparks');
              }

              const isKilled = npcMgr.damageNPC(npc, finalDmg);

              setActiveCampaign((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  damageDealt: prev.damageDealt + finalDmg,
                  enemiesDefeated: prev.enemiesDefeated + (isKilled ? 1 : 0),
                };
              });

              if (isKilled) {
                unlockBadge('badge_first_blood');
                const silverGain = (npc.isBoss ? 250 : 50) * doubleMult;
                const valorGain = (npc.isBoss ? 350 : 80) * doubleMult;
                setStats((prev) => ({
                  ...prev,
                  silver: prev.silver + silverGain,
                  valor: prev.valor + valorGain,
                }));
                setPlayers((prev) =>
                  prev.map((p) => (p.isSelf ? { ...p, kills: p.kills + 1 } : p))
                );
                advanceQuest('raid', 1);

                if (npc.isBoss) {
                  advanceCampaignStep('slay_boss', 1);
                  addFloatingNumber('👑 BOSS SLAIN!', '#fbbf24', true);
                } else {
                  advanceCampaignStep('defeat_enemies', 1);
                }

                setMessages((prev) => [
                  ...prev,
                  {
                    id: `k_${Date.now()}`,
                    sender: 'System',
                    text: npc.isBoss
                      ? `🔥 VICTORY! You vanquished Boss ${npc.name} and seized ${silverGain} Silver!`
                      : `You defeated ${npc.name} and pillaged ${silverGain} Silver!`,
                    isSystem: true,
                    time: 'Now',
                  },
                ]);
              }
              break;
            }
          }
        }
      }

      // 3. Check tree chopping & mining
      if (!hitTarget) {
        for (const obj of world.interactiveObjects) {
          if (obj.type === 'tree' && obj.position.distanceTo(playerPos) < 7.5) {
            sound.playHitImpact(true);
            obj.health -= 35;
            hitTarget = true;
            addFloatingNumber('+2 Timber', '#84cc16');

            // Tree wobble animation
            obj.mesh.rotation.z = 0.15;
            setTimeout(() => {
              obj.mesh.rotation.z = -0.15;
              setTimeout(() => (obj.mesh.rotation.z = 0), 100);
            }, 100);

            setStats((prev) => ({ ...prev, wood: prev.wood + 2, silver: prev.silver + 10 }));
            advanceQuest('chop', 1);
            break;
          } else if (obj.type === 'ore' && obj.position.distanceTo(playerPos) < 7.0) {
            sound.playHitImpact(false);
            obj.health -= 40;
            hitTarget = true;
            addFloatingNumber('+1 Iron Ore', '#38bdf8');

            setStats((prev) => ({ ...prev, iron: prev.iron + 1, silver: prev.silver + 20 }));
            advanceQuest('mine', 1);
            break;
          }
        }
      }

      // 4. Hit Shared Co-Op World Boss or Remote Multiplayer Peers via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const weaponBonus =
          ARMORY_ITEMS.find((w) => w.id === stats.equippedGear?.weaponId)?.damageBonus || 0;
        const petBonus = pets.find((p) => p.id === activePetId)?.damageBonus || 0;
        const clanBonus = Math.min(50, Math.floor(clanTreasury / 150) * 5);
        const axeDmg = 35 + weaponBonus + petBonus + clanBonus;

        wsRef.current.send(
          JSON.stringify({
            type: 'player:attack',
            damage: axeDmg,
            radius: 5.5,
          })
        );

        const wb = sharedWorldBossRef.current;
        if (wb && wb.isAlive && Math.hypot(wb.x - playerPos.x, wb.z - playerPos.z) < 9.5) {
          wsRef.current.send(
            JSON.stringify({
              type: 'worldboss:hit',
              damage: axeDmg,
            })
          );
          sound.playHitImpact(false);
          world.spawnCombatSparks(new THREE.Vector3(wb.x, 5, wb.z), 'frost');
          addFloatingNumber(`🔥 CO-OP BOSS -${axeDmg}`, '#f97316', true);
        }

        const db = dungeonBossRef.current;
        if (db && db.isAlive && Math.hypot(db.x - playerPos.x, db.z - playerPos.z) < 11) {
          wsRef.current.send(
            JSON.stringify({
              type: 'dungeon:hit',
              damage: axeDmg,
            })
          );
          sound.playHitImpact(false);
          world.spawnCombatSparks(new THREE.Vector3(db.x, 5, db.z), 'frost');
          addFloatingNumber(`🐉 NÍÐHÖGGR -${axeDmg}`, '#a855f7', true);
        }
      }
    } else if (tool === 'horn') {
      advanceQuest('horn', 1);
      advanceCampaignStep('sound_horn', 1);
      setStats((prev) => ({ ...prev, stamina: 100, valor: prev.valor + 20 }));
      addFloatingNumber('📯 CALL TO ARMS!', '#38bdf8', true);
      setMessages((prev) => [
        ...prev,
        {
          id: `h_${Date.now()}`,
          sender: stats.name,
          clan: stats.clan,
          text: 'BLOWS THE WAR HORN! For Katfjord!',
          time: 'Now',
        },
      ]);
    } else if (tool === 'mead') {
      setStats((prev) => ({
        ...prev,
        health: Math.min(prev.maxHealth, prev.health + 40),
      }));
      addFloatingNumber('+40 HP', '#10b981');
    } else if (tool === 'hammer') {
      setShowBuildingHUD(true);
      // Place barricade in front of player
      if (stats.wood >= 2) {
        const forward = new THREE.Vector3(0, 0, 1)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y)
          .multiplyScalar(4);
        const placePos = new THREE.Vector3().addVectors(playerPos, forward);
        world.placeBarricade(placePos, player.group.rotation.y);
        setStats((prev) => ({ ...prev, wood: prev.wood - 2 }));
        addFloatingNumber('-2 Wood (Barricade)', '#ca8a04');
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'System',
            text: 'Need at least 2 Timber to construct a barricade! Chop trees with your Axe [1].',
            isSystem: true,
            time: 'Now',
          },
        ]);
      }
    } else if (tool === 'fishing_rod') {
      if (fishingMgrRef.current) {
        if (fishingMgrRef.current.state.status === 'reeling') {
          fishingMgrRef.current.reel(true);
          setShowFishingModal(true);
        } else if (fishingMgrRef.current.state.status === 'bite') {
          fishingMgrRef.current.hookBite();
          setShowFishingModal(true);
          addFloatingNumber('🎣 FISH HOOKED!', '#38bdf8', true);
        } else if (fishingMgrRef.current.isNearWater(playerPos)) {
          const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y);
          const castSuccess = fishingMgrRef.current.castLine(playerPos, forward);
          if (castSuccess) {
            setShowFishingModal(true);
            addFloatingNumber('🎣 LINE CAST! WAITING FOR BITE...', '#38bdf8');
          }
        } else {
          addFloatingNumber('🌊 Walk closer to Fjord water to fish!', '#38bdf8');
        }
      }
    } else if (tool === 'bow') {
      if (archeryMgrRef.current) {
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y);
        const origin = playerPos.clone().add(new THREE.Vector3(0, 2.0, 0));
        const shot = archeryMgrRef.current.shootArrow(origin, forward, 1.0, selectedArrow);
        if (shot) {
          setShowArcheryHUD(true);
          setQuiverStock({ ...archeryMgrRef.current.quiverStock });
          addFloatingNumber('🏹 ARROW RELEASED!', '#f59e0b');
        } else {
          addFloatingNumber('⚠️ Out of this arrow type!', '#ef4444');
        }
      }
    }
  }, [advanceCampaignStep, advanceQuest, stats.clan, stats.name, stats.wood, addFloatingNumber]);

  // Handle interaction key 'E'
  const handleInteract = useCallback(() => {
    if (!playerRef.current || !worldRef.current) return;
    const player = playerRef.current;
    const world = worldRef.current;
    const playerPos = player.position;

    // Check Ship Helm
    if (world.shipGroup) {
      const helmPos = new THREE.Vector3(22, 2, 85);
      if (playerPos.distanceTo(helmPos) < 10) {
        // Toggle sailing
        const nextSailing = !world.isShipMounted;
        world.isShipMounted = nextSailing;
        setStats((prev) => ({ ...prev, isSailing: nextSailing }));

        if (nextSailing) {
          advanceQuest('sail', 1);
          unlockBadge('badge_shipwright');
          sound.playFanfare();
          player.position.set(22, 4, 85);
          setMessages((prev) => [
            ...prev,
            {
              id: `ship_${Date.now()}`,
              sender: 'System',
              text: 'You have mounted the Drakkar helm! Use W/S to sail and A/D to steer across the fjord.',
              isSystem: true,
              time: 'Now',
            },
          ]);
        }
        return;
      }
    }

    // Check Runestone Circle
    const runePos = new THREE.Vector3(-42, 3, 10);
    if (playerPos.distanceTo(runePos) < 14) {
      sound.playFanfare();
      advanceCampaignStep('pray_altar', 1);
      addFloatingNumber('⚡ THOR BLESSING!', '#38bdf8', true);
      setStats((prev) => ({
        ...prev,
        stamina: 100,
        health: prev.maxHealth,
        valor: prev.valor + 50,
      }));
      setMessages((prev) => [
        ...prev,
        {
          id: `rune_${Date.now()}`,
          sender: 'System',
          text: "Thor has blessed your blade! Stamina and Health restored to maximum.",
          isSystem: true,
          time: 'Now',
        },
      ]);
      return;
    }

    // Check Golden Relic Chest
    const chestPos = new THREE.Vector3(30, 3, 225);
    if (playerPos.distanceTo(chestPos) < 10) {
      advanceQuest('raid', 1);
      advanceCampaignStep('loot_relic', 1);
      sound.playFanfare();
      addFloatingNumber('👑 RELIC PLUNDERED! +500 Silver', '#fbbf24', true);
      setStats((prev) => ({
        ...prev,
        silver: prev.silver + 500,
        valor: prev.valor + 600,
      }));
      setMessages((prev) => [
        ...prev,
        {
          id: `relic_${Date.now()}`,
          sender: 'System',
          text: 'Praise Odin! You plundered the Frostfang Golden Relic! (+500 Silver)',
          isSystem: true,
          time: 'Now',
        },
      ]);
      return;
    }

    // Check Valhalla Sky Obby Summit Chest (x: -18, y: 27.2, z: -63)
    const obbyChestPos = new THREE.Vector3(-18, 27.2, -63);
    if (playerPos.distanceTo(obbyChestPos) < 9) {
      sound.playVictoryTriumph();
      unlockBadge('badge_obby_master');
      addFloatingNumber('👑 SKY OBBY CONQUERED! +800 Silver', '#fbbf24', true);
      setStats((prev) => ({
        ...prev,
        silver: prev.silver + 800,
        valor: prev.valor + 600,
      }));
      return;
    }

    // Check Frostfang Territory Capture Flag (x: 24, y: 3, z: 214)
    const flagPos = new THREE.Vector3(24, 3, 214);
    if (playerPos.distanceTo(flagPos) < 10) {
      sound.playVictoryTriumph();
      setTerritoryCaptured(true);
      world.setTerritoryCaptured(true);
      unlockBadge('badge_outpost_king');
      addFloatingNumber('🚩 TERRITORY CAPTURED! +400 Silver', '#facc15', true);
      setStats((prev) => ({
        ...prev,
        silver: prev.silver + 400,
        valor: prev.valor + 350,
      }));
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'territory:capture' }));
      }
      return;
    }

    // Check Starfall Runic Meteor Chest (Server-Authoritative Supply Drop)
    const activeDrop = supplyDropRef.current;
    if (activeDrop && activeDrop.active) {
      const dropPos = new THREE.Vector3(activeDrop.x, 3.2, activeDrop.z);
      if (playerPos.distanceTo(dropPos) < 9) {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'supplydrop:claim' }));
        }
        return;
      }
    }

    // Check Niflheim Underworld Entrance Portal in Katfjord Village (-28, 3.2, 26)
    const niflheimPortalPos = new THREE.Vector3(-28, 3.2, 26);
    if (playerPos.distanceTo(niflheimPortalPos) < 8.5) {
      sound.playWarHorn();
      world.isShipMounted = false;
      setStats((prev) => ({ ...prev, isSailing: false }));
      player.position.set(-115, 3.6, 36);
      player.velocity.set(0, 0, 0);
      addFloatingNumber('🌀 ENTERED NIFLHEIM UNDERWORLD!', '#a855f7', true);
      setBattleBannerNotice('🐉 NIFLHEIM DUNGEON: Dodge the Soul-Scythes and slay Níðhöggr the Underworld Dragon!');
      setTimeout(() => setBattleBannerNotice(null), 5500);
      return;
    }

    // Check Niflheim Cavern Return Portal (-115, 3.2, 42)
    const niflheimExitPos = new THREE.Vector3(-115, 3.2, 42);
    if (playerPos.distanceTo(niflheimExitPos) < 8.0) {
      sound.playFanfare();
      player.position.set(-24, 3.6, 26);
      player.velocity.set(0, 0, 0);
      addFloatingNumber('☀️ Returned to Katfjord Village!', '#38bdf8', true);
      return;
    }

    // Check Young Viking Meadow Sanctuary Entrance Archway in Katfjord (28, 3.2, 16)
    const meadowArchPos = new THREE.Vector3(
      KATFJORD_MEADOW_ARCHWAY.x,
      3.2,
      KATFJORD_MEADOW_ARCHWAY.z
    );
    if (playerPos.distanceTo(meadowArchPos) < 8.5) {
      sound.playFanfare();
      world.isShipMounted = false;
      setStats((prev) => ({ ...prev, isSailing: false }));
      player.setYoungVikingMode(true);
      setIsYoungVikingMode(true);
      setIsAutoWandering(true);
      player.position.set(MEADOW_CENTER.x, 3.4, MEADOW_CENTER.z + 10);
      player.velocity.set(0, 0, 0);
      addFloatingNumber('🌿 ENTERED YOUNG VIKING MEADOW REALM!', '#10b981', true);
      setBattleBannerNotice(
        '🧒 YOUNG VIKING MEADOW REALM: Auto-Wandering & Gathering Wild Berries, Herbs, Amber & Golden Apples! Press [Y] for Satchel'
      );
      setTimeout(() => setBattleBannerNotice(null), 5500);
      return;
    }

    // Check Meadow Return Archway (135, 3.2, -107)
    const meadowReturnPos = new THREE.Vector3(
      MEADOW_RETURN_ARCHWAY.x,
      3.2,
      MEADOW_RETURN_ARCHWAY.z
    );
    if (playerPos.distanceTo(meadowReturnPos) < 8.5) {
      sound.playFanfare();
      setIsAutoWandering(false);
      player.setYoungVikingMode(false);
      setIsYoungVikingMode(false);
      player.position.set(24, 3.4, 18);
      player.velocity.set(0, 0, 0);
      addFloatingNumber('⚓ Returned to Katfjord Village!', '#38bdf8', true);
      return;
    }

    // Check Draugr Crypt Barrow Mound Entrance Portal (-65, 3.24, -55)
    const cryptEntrancePos = DraugrCryptManager.ENTRANCE_POS;
    if (playerPos.distanceTo(cryptEntrancePos) < 8.5) {
      sound.playWarHorn();
      world.isShipMounted = false;
      setStats((prev) => ({ ...prev, isSailing: false }));
      player.position.copy(DraugrCryptManager.CRYPT_INTERIOR_SPAWN);
      player.velocity.set(0, 0, 0);
      addFloatingNumber('💀 ENTERED ANCIENT DRAUGR CRYPT!', '#10b981', true);
      setBattleBannerNotice('💀 ANCIENT DRAUGR BARROW: Slay the Crypt Wight, Draugr Archers, and loot ancient Sarcophagi relics!');
      setTimeout(() => setBattleBannerNotice(null), 5500);
      return;
    }

    // Check Draugr Crypt Interior Exit Portal (-200, 2.0, -180)
    const cryptExitPos = new THREE.Vector3(-200, 2.0, -180);
    if (playerPos.distanceTo(cryptExitPos) < 8.0) {
      sound.playFanfare();
      player.position.set(-65, 3.5, -45);
      player.velocity.set(0, 0, 0);
      addFloatingNumber('☀️ Returned to Katfjord Surface!', '#38bdf8', true);
      return;
    }

    // Check Draugr Crypt Sarcophagi Looting
    if (draugrCryptMgrRef.current?.isInsideCrypt) {
      for (const sarc of draugrCryptMgrRef.current.sarcophagi) {
        if (!sarc.opened && Math.hypot(sarc.x - playerPos.x, sarc.z - playerPos.z) < 6.0) {
          const loot = draugrCryptMgrRef.current.openSarcophagus(sarc.id);
          if (loot) {
            setStats((prev) => ({
              ...prev,
              silver: prev.silver + loot.rewardSilver,
              valor: prev.valor + loot.rewardValor,
            }));
            addFloatingNumber(`⚰️ SARCOPHAGUS LOOTED! +${loot.rewardSilver} Silver & +${loot.rewardValor} Valor`, '#fbbf24', true);
            return;
          }
        }
      }
    }

    // Check Fjord Fishing near water
    if (fishingMgrRef.current?.isNearWater(playerPos)) {
      if (fishingMgrRef.current.state.status === 'bite') {
        fishingMgrRef.current.hookBite();
        setShowFishingModal(true);
        addFloatingNumber('🎣 FISH HOOKED! KEEP TENSION!', '#38bdf8', true);
        return;
      } else if (fishingMgrRef.current.state.status === 'idle') {
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y);
        const castSuccess = fishingMgrRef.current.castLine(playerPos, forward);
        if (castSuccess) {
          setShowFishingModal(true);
          addFloatingNumber('🎣 LINE CAST! WAITING FOR BITE...', '#38bdf8');
          return;
        }
      }
    }

    // If inside the Young Viking Meadow Realm, pressing [E] gathers the nearest item
    if (
      meadowMgrRef.current &&
      Math.abs(playerPos.x - MEADOW_CENTER.x) < 38 &&
      Math.abs(playerPos.z - MEADOW_CENTER.z) < 38
    ) {
      const gathered = meadowMgrRef.current.gatherNearestAvailableNode(player, (node) => {
        sound.playFanfare();
        setForagerSatchel((prev) => ({
          ...prev,
          [node.category]: (prev[node.category] || 0) + 1,
        }));
        setTotalItemsGathered((prev) => prev + 1);
        setStats((prev) => ({
          ...prev,
          silver: prev.silver + node.silverReward,
          valor: prev.valor + node.valorReward,
          health: Math.min(prev.maxHealth, prev.health + 8),
        }));
        addFloatingNumber(
          `🌿 +1 ${node.name} (+${node.silverReward} Silver)`,
          '#10b981',
          true
        );
      });
      if (gathered) {
        setMeadowNodes(meadowMgrRef.current.getNodesSnapshot());
        return;
      }
    }

    // Check Tycoon Collector Pad (x: 16, y: 3.2, z: 16)
    const tycoonPadPos = new THREE.Vector3(16, 3.2, 16);
    if (playerPos.distanceTo(tycoonPadPos) < 8) {
      handleCollectTycoonRef.current();
      return;
    }

    // Check Friendly Villagers
    if (npcRef.current) {
      for (const npc of npcRef.current.npcs) {
        if (!npc.isHostile && npc.state !== 'dead') {
          if (playerPos.distanceTo(npc.mesh.position) < 6.5) {
            sound.playFanfare();
            if (npc.speechText) {
              npcRef.current.speak(npc, npc.speechText);
            }
            setMessages((prev) => [
              ...prev,
              {
                id: `npc_${Date.now()}`,
                sender: npc.name,
                clan: npc.clan,
                text: npc.speechText || 'Hail, clan brother! Skol!',
                time: 'Now',
              },
            ]);
            return;
          }
        }
      }
    }
  }, [advanceQuest]);

  // Keep stable refs for event handlers to prevent Three.js scene remounting
  const handleActionRef = useRef(handleAction);
  handleActionRef.current = handleAction;

  const handleInteractRef = useRef(handleInteract);
  handleInteractRef.current = handleInteract;

  // Dynamic Weather System Toggle Handler
  const handleToggleWeather = useCallback(() => {
    setWeather((prev) => {
      const next: WeatherCondition =
        prev === 'sunny' ? 'foggy' : prev === 'foggy' ? 'snowy' : prev === 'snowy' ? 'stormy' : 'sunny';

      if (worldRef.current) {
        worldRef.current.setWeather(next);
      }
      sound.playWeatherChange(next);

      const weatherLabels: Record<WeatherCondition, string> = {
        sunny: "☀️ ODIN'S DAWN — Radiant sun & clear blue skies over Katfjord",
        foggy: "🌫️ NIFLHEIM MIST — Dense fjord fog & low-lying mist descends",
        snowy: "❄️ FIMBULWINTER — Arctic blizzard flurries blanket the realm",
        stormy: "⚡ THOR'S TEMPEST — Raging stormy sea, violent waves & lightning strikes",
      };

      setBattleBannerNotice(weatherLabels[next]);
      setTimeout(() => setBattleBannerNotice(null), 4500);

      setMessages((prevMsgs) => [
        ...prevMsgs,
        {
          id: `weather_${Date.now()}`,
          sender: 'Realm',
          text: `Atmospheric shift: ${weatherLabels[next]}`,
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      return next;
    });
  }, []);

  const handleToggleWeatherRef = useRef(handleToggleWeather);
  handleToggleWeatherRef.current = handleToggleWeather;

  // Keep latest stats in a ref for WebSocket 10Hz broadcast
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const activeMountIdRef = useRef(activeMountId);
  activeMountIdRef.current = activeMountId;

  // Real-Time WebSocket Multiplayer Connection & Event Synchronization
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let syncInterval: number | null = null;
    let isDisposed = false;

    const connectWebSocket = () => {
      if (isDisposed) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws/multiplayer`;
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isDisposed) return;
        setIsWsConnected(true);
        const s = statsRef.current;
        const p = playerRef.current;
        ws?.send(
          JSON.stringify({
            type: 'room:join',
            roomId,
            player: {
              id: selfPlayerIdRef.current,
              name: s.name,
              clan: s.clan,
              level: s.level,
              silver: s.silver,
              kills: 0,
              health: s.health,
              maxHealth: s.maxHealth,
              x: p ? p.position.x : 0,
              y: p ? p.position.y : 3.24,
              z: p ? p.position.z : 20,
              rotY: p ? p.group.rotation.y : 0,
              skinId: s.skinId,
              weaponId: s.equippedGear?.weaponId || 'axe_iron',
              shieldId: s.equippedGear?.shieldId || 'shield_wood',
              headwearId: s.equippedGear?.headwearId || 'helm_iron',
              activeTool: p ? p.activeTool : 'axe',
              isSailing: s.isSailing,
              mountId: activeMountIdRef.current,
            },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(String(event.data));
          const type = msg.type as string;

          if (type === 'room:init') {
            const incomingPlayers = (msg.players || []) as RemotePlayerState[];
            const peers = incomingPlayers.filter((p) => p.id !== selfPlayerIdRef.current);
            setRemotePlayers(peers);
            if (remoteMgrRef.current) {
              remoteMgrRef.current.syncPlayers(incomingPlayers, selfPlayerIdRef.current);
              remoteMgrRef.current.updateWorldBoss(msg.worldBoss || null);
              remoteMgrRef.current.updateSeaSerpent(msg.seaSerpent || null);
              remoteMgrRef.current.updateDungeonBoss(msg.dungeonBoss || null);
              remoteMgrRef.current.syncTacticalPings(msg.activePings || []);
              remoteMgrRef.current.updateSupplyDrop(msg.supplyDrop || null);
            }
            if (msg.worldBoss) setSharedWorldBoss(msg.worldBoss);
            if (msg.seaSerpent) setSeaSerpent(msg.seaSerpent);
            if (msg.dungeonBoss) setDungeonBoss(msg.dungeonBoss);
            if (Array.isArray(msg.activePings)) setActivePings(msg.activePings);
            if (msg.supplyDrop) setSupplyDrop(msg.supplyDrop);
            if (msg.territoryHolder) setTerritoryHolder(msg.territoryHolder);

            if (Array.isArray(msg.chatHistory)) {
              setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const fresh = msg.chatHistory.filter((m: ChatMessage) => !existingIds.has(m.id));
                return [...prev, ...fresh].slice(-40);
              });
            }
          } else if (type === 'player:joined' || type === 'player:updated') {
            const rp = msg.player as RemotePlayerState;
            if (!rp || rp.id === selfPlayerIdRef.current) return;
            setRemotePlayers((prev) => {
              const exists = prev.some((item) => item.id === rp.id);
              if (exists) {
                return prev.map((item) => (item.id === rp.id ? rp : item));
              }
              return [...prev, rp];
            });
            remoteMgrRef.current?.upsertPlayer(rp);
          } else if (type === 'player:left') {
            const leftId = String(msg.playerId);
            setRemotePlayers((prev) => prev.filter((item) => item.id !== leftId));
            remoteMgrRef.current?.removePlayer(leftId);
          } else if (type === 'chat:message') {
            const chatEntry = msg.message as ChatMessage;
            if (chatEntry) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === chatEntry.id)) return prev;
                return [...prev, chatEntry].slice(-40);
              });
              if (msg.playerId && msg.playerId !== selfPlayerIdRef.current) {
                remoteMgrRef.current?.showPlayerSpeech(String(msg.playerId), chatEntry.text);
              }
            }
          } else if (type === 'player:damaged') {
            if (msg.targetId === selfPlayerIdRef.current) {
              const dmg = Number(msg.damage) || 20;
              if (msg.isBlocked) {
                sound.playShieldBlock();
                addFloatingNumberRef.current(`🛡️ BLOCKED PVP -${dmg}`, '#38bdf8', false, true);
              } else {
                sound.playHitImpact(false);
                setDamageFlash(true);
                setTimeout(() => setDamageFlash(false), 220);
                addFloatingNumberRef.current(`⚔️ ${msg.attackerName} -${dmg} HP!`, '#ef4444', true);
              }
              setStats((prev) => ({
                ...prev,
                health: msg.killed ? prev.maxHealth : Math.max(1, prev.health - dmg),
              }));
              if (msg.killed && playerRef.current) {
                playerRef.current.position.set(0, 3.24, 20);
                addFloatingNumberRef.current('💀 Defeated in Holmgang! Respawned', '#f87171', true);
              }
            } else if (msg.attackerId === selfPlayerIdRef.current) {
              addFloatingNumberRef.current(
                `⚔️ Hit ${msg.targetName} -${msg.damage}!`,
                '#fbbf24',
                true
              );
              if (msg.killed) {
                sound.playVictoryTriumph();
                addFloatingNumberRef.current(
                  `👑 PVP VICTORY vs ${msg.targetName}! +120 Silver`,
                  '#10b981',
                  true
                );
                setStats((prev) => ({
                  ...prev,
                  silver: prev.silver + 120,
                  valor: prev.valor + 150,
                }));
              }
            }
          } else if (type === 'worldboss:updated' || type === 'worldboss:spawned') {
            setSharedWorldBoss(msg.worldBoss);
            remoteMgrRef.current?.updateWorldBoss(msg.worldBoss);
            if (msg.message) {
              setMessages((prev) =>
                prev.some((m) => m.id === msg.message.id) ? prev : [...prev, msg.message]
              );
            }
          } else if (type === 'worldboss:defeated') {
            setSharedWorldBoss(msg.worldBoss);
            remoteMgrRef.current?.updateWorldBoss(msg.worldBoss);
            sound.playVictoryTriumph();
            const rSilver = Number(msg.rewardSilver) || 400;
            const rValor = Number(msg.rewardValor) || 500;
            setStats((prev) => ({
              ...prev,
              silver: prev.silver + rSilver,
              valor: prev.valor + rValor,
              level: Math.floor((prev.valor + rValor) / 200) + 1,
            }));
            addFloatingNumberRef.current(
              `🔥 CO-OP BOSS SLAIN! +${rSilver} Silver`,
              '#fbbf24',
              true
            );
            if (msg.message) {
              setMessages((prev) =>
                prev.some((m) => m.id === msg.message.id) ? prev : [...prev, msg.message]
              );
            }
          } else if (type === 'territory:captured') {
            setTerritoryHolder(msg.territoryHolder);
            if (msg.message) {
              setMessages((prev) =>
                prev.some((m) => m.id === msg.message.id) ? prev : [...prev, msg.message]
              );
            }
          } else if (type === 'supplydrop:spawned' || type === 'supplydrop:claimed') {
            setSupplyDrop(msg.supplyDrop);
            remoteMgrRef.current?.updateSupplyDrop(msg.supplyDrop);
            if (type === 'supplydrop:claimed' && msg.claimerId === selfPlayerIdRef.current) {
              sound.playVictoryTriumph();
              const rSilver = Number(msg.rewardSilver) || 250;
              const rValor = Number(msg.rewardValor) || 300;
              setStats((prev) => ({
                ...prev,
                silver: prev.silver + rSilver,
                valor: prev.valor + rValor,
              }));
              addFloatingNumberRef.current(
                `☄️ METEOR CHEST CLAIMED! +${rSilver} Silver`,
                '#38bdf8',
                true
              );
            }
            if (msg.message) {
              setMessages((prev) =>
                prev.some((m) => m.id === msg.message.id) ? prev : [...prev, msg.message]
              );
            }
          }
        } catch {
          // Ignore malformed WS packets
        }
      };

      ws.onclose = () => {
        setIsWsConnected(false);
        if (!isDisposed) {
          reconnectTimer = window.setTimeout(connectWebSocket, 2200);
        }
      };
    };

    connectWebSocket();

    // 10Hz Delta Position & Combat State Broadcast
    syncInterval = window.setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN || !playerRef.current) return;
      const p = playerRef.current;
      const s = statsRef.current;
      ws.send(
        JSON.stringify({
          type: 'player:update',
          x: +p.position.x.toFixed(2),
          y: +p.position.y.toFixed(2),
          z: +p.position.z.toFixed(2),
          rotY: +p.group.rotation.y.toFixed(2),
          health: s.health,
          maxHealth: s.maxHealth,
          level: s.level,
          silver: s.silver,
          name: s.name,
          clan: s.clan,
          skinId: s.skinId,
          weaponId: s.equippedGear?.weaponId || 'axe_iron',
          activeTool: p.activeTool,
          isBlocking: p.isBlocking,
          isSailing: s.isSailing,
          mountId: activeMountIdRef.current,
        })
      );
    }, 120);

    return () => {
      isDisposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (syncInterval) clearInterval(syncInterval);
      if (ws) ws.close();
    };
  }, [roomId]);

  // Main Three.js Scene Setup & Loop
  useEffect(() => {

    if (!containerRef.current) return;
    const container = containerRef.current;

    const world = new VikingWorld(container);
    worldRef.current = world;

    const player = new CharacterController(world.scene);
    playerRef.current = player;

    const npcMgr = new NPCManager(world.scene);
    npcRef.current = npcMgr;

    const remoteMgr = new RemotePlayerManager(world.scene);
    remoteMgrRef.current = remoteMgr;

    const meadowMgr = new YoungVikingMeadowManager(world.scene);
    meadowMgrRef.current = meadowMgr;
    // Register the Young Viking Meadow Island (X: 135, Z: -135) as a solid walkable platform
    world.obbyPlatforms.push({
      x: MEADOW_CENTER.x,
      y: 3.0,
      z: MEADOW_CENTER.z,
      halfW: 34,
      halfD: 34,
    });

    // 1. Fjord Fishing Manager
    const fishingMgr = new FishingManager(world.scene);
    fishingMgrRef.current = fishingMgr;

    // 2. Viking Archery Range Manager
    const archeryMgr = new ArcheryManager(world.scene);
    archeryMgrRef.current = archeryMgr;

    // 3. Fortress Construction & Raid Defense Manager
    const buildingMgr = new BuildingManager(world.scene);
    buildingMgrRef.current = buildingMgr;

    // 4. Draugr Crypt Barrow Tomb Manager & Interior Platform
    const draugrCryptMgr = new DraugrCryptManager(world.scene);
    draugrCryptMgrRef.current = draugrCryptMgr;
    world.obbyPlatforms.push({
      x: DraugrCryptManager.CRYPT_INTERIOR_SPAWN.x,
      y: DraugrCryptManager.CRYPT_INTERIOR_SPAWN.y,
      z: DraugrCryptManager.CRYPT_INTERIOR_SPAWN.z,
      halfW: 26,
      halfD: 26,
    });

    // 5. Clan Territory Wars (GvG Battlefields) Manager
    const clanConquestMgr = new ClanConquestManager(world.scene);
    clanConquestMgrRef.current = clanConquestMgr;

    // Window and container resize with ResizeObserver
    const handleResize = () => {
      if (!containerRef.current || !worldRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        worldRef.current.resize(w, h);
      }
    };

    // Ensure immediate initial sizing
    handleResize();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && worldRef.current) {
          worldRef.current.resize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    window.addEventListener('resize', handleResize);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in chat input
      if (document.activeElement?.tagName === 'INPUT') return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') keysRef.current.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.right = true;
      if (code === 'Space') {
        if (fishingMgrRef.current?.state.status === 'bite') {
          fishingMgrRef.current.hookBite();
          setFishingState({ ...fishingMgrRef.current.state });
          addFloatingNumberRef.current('🎣 STRIKE! Fish Hooked!', '#38bdf8', true);
        } else if (fishingMgrRef.current?.state.status === 'reeling') {
          fishingMgrRef.current.reel(true);
          setFishingState({ ...fishingMgrRef.current.state });
        } else {
          keysRef.current.jump = true;
        }
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight') keysRef.current.sprint = true;

      // Look Up & Around keys (I/J/L and PageUp/PageDown)
      if (code === 'KeyI' || code === 'PageUp') keysRef.current.lookUp = true;
      if (code === 'PageDown') keysRef.current.lookDown = true;
      if (code === 'KeyJ') keysRef.current.lookLeft = true;
      if (code === 'KeyL') keysRef.current.lookRight = true;

      // Cycle Camera View Mode [C] (3rd Person / Close Look / 1st Person Viking Eye View)
      if (code === 'KeyC') {
        const nextMode = player.cycleCameraMode();
        setCameraMode(nextMode);
      }

      // Hotbar keys 1-8
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8'].includes(code)) {
        const slot = parseInt(code.replace('Digit', ''), 10);
        setActiveSlot(slot);
        const item = INITIAL_HOTBAR.find((i) => i.slot === slot);
        if (item) {
          player.setTool(item.type);
          if (item.type === 'hammer') setShowBuildingHUD(true);
          if (item.type === 'bow') setShowArcheryHUD(true);
          if (item.type === 'fishing_rod' && fishingMgrRef.current?.isNearWater(player.position)) {
            setShowFishingModal(true);
          }
        }
      }

      // Interaction Key
      if (code === 'KeyE') handleInteractRef.current();

      // Fjord Fishing Key [K]
      if (code === 'KeyK') {
        setShowFishingModal((prev) => !prev);
      }

      // Archery Range & Quiver Key [O]
      if (code === 'KeyO') setShowArcheryHUD((prev) => !prev);

      // Fortress Construction & Building HUD Key [U]
      if (code === 'KeyU') setShowBuildingHUD((prev) => !prev);

      // Clan Territory Conquest (GvG) Key [J]
      if (code === 'KeyJ') setShowConquestHUD((prev) => !prev);

      // Emotes Key
      if (code === 'KeyB') setShowEmotes((prev) => !prev);

      // Dynamic Weather System Toggle Key [V]
      if (code === 'KeyV') handleToggleWeatherRef.current();

      // Armory & Point Milestone Gear Key [H]
      if (code === 'KeyH') setShowArmory((prev) => !prev);

      // Summon / Dismount 3D War Mount [G]
      if (code === 'KeyG') handleToggleMountRef.current();

      // Special Weapon Skills [Z / X / F]
      if (code === 'KeyZ') handleTriggerSkillRef.current('whirlwind');
      if (code === 'KeyX') handleTriggerSkillRef.current('thunder_leap');
      if (code === 'KeyF') handleTriggerSkillRef.current('frost_nova');

      // War Council / Landing Page Key
      if (code === 'KeyM') setShowLandingPage((prev) => !prev);

      // Quests Key
      if (code === 'KeyQ') setShowQuests((prev) => !prev);

      // Multiplayer Realms & Co-Op Raid Key [P]
      if (code === 'KeyP') setShowMultiplayerModal((prev) => !prev);

      // Radial Tactical War-Command Wheel Key [T]
      if (code === 'KeyT') setShowTacticalWheel((prev) => !prev);

      // Young Viking Wanderer & Forager Meadow Realm Key [Y]
      if (code === 'KeyY') setShowYoungVikingModal((prev) => !prev);

      // How to Play & Keyboard Controls Guide Key [? / Slash / F1]
      if (code === 'Slash' || code === 'F1') {
        e.preventDefault();
        setShowHowToPlayModal((prev) => !prev);
      }

      // Fire Drakkar Broadside Frost-Ballista Key [R]
      if (code === 'KeyR') {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && playerRef.current) {
          sound.playCriticalHit();
          const shipX = worldRef.current?.shipGroup?.position.x ?? playerRef.current.position.x;
          const shipZ = worldRef.current?.shipGroup?.position.z ?? playerRef.current.position.z;
          wsRef.current.send(
            JSON.stringify({
              type: 'ship:fire_ballista',
              side: 'starboard',
              damage: 95,
              fromX: shipX,
              fromZ: shipZ,
            })
          );
          addFloatingNumberRef.current('❄️⚓ FROST-BALLISTA BROADSIDE -95!', '#38bdf8', true);
        }
      }

      // Leaderboard Tab Key
      if (code === 'Tab') {
        e.preventDefault();
        setShowLeaderboard((prev) => !prev);
      }

      // Close open modals on Escape
      if (code === 'Escape') {
        setShowArmory(false);
        setShowLandingPage(false);
        setShowCustomizer(false);
        setShowQuests(false);
        setShowEmotes(false);
        setShowLeaderboard(false);
        setShowGamepasses(false);
        setShowPetsModal(false);
        setShowTycoonModal(false);
        setShowClanModal(false);
        setShowMultiplayerModal(false);
        setShowTacticalWheel(false);
        setShowYoungVikingModal(false);
        setShowHowToPlayModal(false);
        setShowFishingModal(false);
        setShowArcheryHUD(false);
        setShowBuildingHUD(false);
        setShowConquestHUD(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') keysRef.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.right = false;
      if (code === 'Space') keysRef.current.jump = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') keysRef.current.sprint = false;
      if (code === 'KeyI' || code === 'PageUp') keysRef.current.lookUp = false;
      if (code === 'PageDown') keysRef.current.lookDown = false;
      if (code === 'KeyJ') keysRef.current.lookLeft = false;
      if (code === 'KeyL') keysRef.current.lookRight = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse Controls (Orbit Camera Look Up/Around & Actions)
    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) return;

      if (e.button === 0) {
        // Left click: drag to look up/around, or quick click to attack/use tool
        isLeftMouseDownRef.current = true;
        leftMouseDragDistRef.current = 0;
        mousePrevRef.current = { x: e.clientX, y: e.clientY };
      } else if (e.button === 2) {
        // Right click = Raise shield block & camera drag
        isMouseDownRef.current = true;
        mousePrevRef.current = { x: e.clientX, y: e.clientY };
        player.setBlocking(true);
      } else if (e.button === 1) {
        // Middle click = Camera drag
        isMouseDownRef.current = true;
        mousePrevRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        if (isLeftMouseDownRef.current && leftMouseDragDistRef.current < 6) {
          handleActionRef.current();
        }
        isLeftMouseDownRef.current = false;
      } else if (e.button === 2) {
        isMouseDownRef.current = false;
        player.setBlocking(false);
      } else if (e.button === 1) {
        isMouseDownRef.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Drag camera with left-click, right-click, or middle-click to look up, down, and around
      if (isMouseDownRef.current || isLeftMouseDownRef.current) {
        const dx = e.clientX - mousePrevRef.current.x;
        const dy = e.clientY - mousePrevRef.current.y;
        mousePrevRef.current = { x: e.clientX, y: e.clientY };

        if (isLeftMouseDownRef.current) {
          leftMouseDragDistRef.current += Math.hypot(dx, dy);
        }

        player.applyLookDelta(dx * 0.0065, -dy * 0.0065);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      player.cameraDistance = Math.max(2.5, Math.min(30, player.cameraDistance + e.deltaY * 0.02));
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Block browser context menu for smooth shield blocking
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('contextmenu', handleContextMenu);

    // Touch Controls: Camera Look-Around & 2-Finger Pinch Zoom
    let lookTouchId: number | null = null;
    let lookPrevPos = { x: 0, y: 0 };
    let initialPinchDist: number | null = null;
    let initialCameraDist: number = player.cameraDistance;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button') || target?.closest('.pointer-events-auto')) return;

      // Handle 2-finger pinch zoom
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        initialCameraDist = player.cameraDistance;
        return;
      }

      // Handle 1-finger camera orbit
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.clientX > window.innerWidth * 0.35 || t.clientY < window.innerHeight * 0.5) {
          if (lookTouchId === null) {
            lookTouchId = t.identifier;
            lookPrevPos = { x: t.clientX, y: t.clientY };
            break;
          }
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // 2-finger pinch zoom
      if (e.touches.length === 2 && initialPinchDist !== null) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        if (dist > 10) {
          const ratio = initialPinchDist / dist;
          player.cameraDistance = Math.max(2.5, Math.min(30, initialCameraDist * ratio));
        }
        return;
      }

      // 1-finger camera orbit (look up, down, and 360 around)
      if (lookTouchId !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === lookTouchId) {
            const dx = t.clientX - lookPrevPos.x;
            const dy = t.clientY - lookPrevPos.y;
            lookPrevPos = { x: t.clientX, y: t.clientY };

            player.applyLookDelta(dx * 0.007, -dy * 0.007);
            break;
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialPinchDist = null;
      }
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === lookTouchId) {
          lookTouchId = null;
          break;
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    // Animation Loop
    let lastTime = performance.now();
    let animId = 0;

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update world
      world.update(delta);

      // Handle ship sailing controls if mounted
      if (world.isShipMounted) {
        if (keysRef.current.forward) world.shipSpeed = Math.min(22, world.shipSpeed + 12 * delta);
        else if (keysRef.current.backward) world.shipSpeed = Math.max(-8, world.shipSpeed - 10 * delta);
        else world.shipSpeed = THREE.MathUtils.lerp(world.shipSpeed, 0, 2 * delta);

        if (keysRef.current.left) world.shipRotation += 1.2 * delta;
        if (keysRef.current.right) world.shipRotation -= 1.2 * delta;

        setShipSpeed(world.shipSpeed);
        setShipRotation(world.shipRotation);

        // Keep player anchored on ship deck as it rolls and pitches over waves
        if (world.shipGroup) {
          world.shipGroup.updateMatrixWorld(true);
          const localDeckPos = new THREE.Vector3(0, 4.3, -8);
          const worldDeckPos = localDeckPos.applyMatrix4(world.shipGroup.matrixWorld);
          player.position.copy(worldDeckPos);
          player.group.rotation.y = world.shipRotation;
        }
      }

      // Update player character physics, Sky Obby platform landing, and camera
      player.update(delta, keysRef.current, world.camera, world.obbyPlatforms);

      // Update Remote Multiplayer Avatars, Shared Co-Op World Boss & Meteor Drops
      remoteMgr.update(delta, time);

      // Update Young Viking Meadow Sanctuary, Companion Young Vikings & Auto-Wander Gathering
      if (meadowMgrRef.current) {
        const manualKeysActive =
          keysRef.current.forward ||
          keysRef.current.backward ||
          keysRef.current.left ||
          keysRef.current.right;
        meadowMgrRef.current.update(
          delta,
          player,
          isAutoWanderingRef.current && !manualKeysActive,
          (node) => {
            sound.playFanfare();
            setForagerSatchel((prev) => ({
              ...prev,
              [node.category]: (prev[node.category] || 0) + 1,
            }));
            setTotalItemsGathered((prev) => prev + 1);
            setStats((prev) => ({
              ...prev,
              silver: prev.silver + node.silverReward,
              valor: prev.valor + node.valorReward,
              health: Math.min(prev.maxHealth, prev.health + 8),
            }));
            addFloatingNumberRef.current(
              `🌿 +1 ${node.name} (+${node.silverReward} Silver)`,
              '#10b981',
              true
            );
            if (meadowMgrRef.current) {
              setMeadowNodes(meadowMgrRef.current.getNodesSnapshot());
            }
          }
        );
      }

      // 1. Update Fjord Fishing System & Reeling State
      if (fishingMgrRef.current) {
        setIsPlayerNearWater(fishingMgrRef.current.isNearWater(player.position));
        fishingMgrRef.current.update(delta, player.position, (caughtRecord) => {
          setCaughtFishLog((prev) => [caughtRecord, ...prev.slice(0, 19)]);
          setStats((prev) => ({
            ...prev,
            silver: prev.silver + caughtRecord.species.silverValue,
            stamina: Math.min(prev.maxStamina, prev.stamina + caughtRecord.species.staminaBoost),
          }));
          addFloatingNumberRef.current(
            `🎣 CAUGHT: ${caughtRecord.species.name} (${caughtRecord.weight} kg) +${caughtRecord.species.silverValue} Silver!`,
            '#38bdf8',
            true
          );
        });
        setFishingState({ ...fishingMgrRef.current.state });
      }

      // 2. Update Viking Archery System (Arrows & Targets)
      if (archeryMgrRef.current) {
        archeryMgrRef.current.update(
          delta,
          (targetScore) => {
            setRecentTargetScore(targetScore);
            setArcheryTotalScore(archeryMgrRef.current?.totalScore || 0);
            setStats((prev) => ({
              ...prev,
              silver: prev.silver + targetScore.points,
              valor: prev.valor + (targetScore.isBullseye ? 120 : 50),
            }));
            addFloatingNumberRef.current(
              targetScore.isBullseye
                ? `🎯 BULLSEYE! +${targetScore.points} Pts (+${targetScore.points} Silver)`
                : `🎯 TARGET HIT! +${targetScore.points} Pts`,
              targetScore.isBullseye ? '#fbbf24' : '#38bdf8',
              targetScore.isBullseye
            );
          },
          (dmg, arrowType, hitPos) => {
            world.spawnCombatSparks(
              hitPos,
              arrowType === 'flame' ? 'sparks' : arrowType === 'frost' ? 'frost' : 'sparks'
            );
            addFloatingNumberRef.current(`🏹 ARROW HIT -${dmg}!`, '#f97316');
          }
        );
      }

      // 3. Update Fortress Building Manager (Auto-Ballista & Raid Wave Invasions)
      if (buildingMgrRef.current) {
        buildingMgrRef.current.update(delta, player.position, (silverReward, valorReward) => {
          setStats((prev) => ({
            ...prev,
            silver: prev.silver + silverReward,
            valor: prev.valor + valorReward,
          }));
          addFloatingNumberRef.current(
            `🏆 SAXON RAID DEFEATED! +${silverReward} Silver & +${valorReward} Valor`,
            '#fbbf24',
            true
          );
        });
        setRaidState({ ...buildingMgrRef.current.raidState });
      }

      // 4. Update Draugr Crypt Barrow Tomb Manager & Interior AI
      if (draugrCryptMgrRef.current) {
        draugrCryptMgrRef.current.update(delta, player.position, (damage) => {
          const isBlocking = player.isBlocking;
          const actualDmg = isBlocking ? Math.max(1, Math.round(damage * 0.15)) : damage;
          if (isBlocking) {
            sound.playShieldBlock();
            addFloatingNumberRef.current(`🛡️ CRYPT BLOCK -${actualDmg}`, '#38bdf8', false, true);
          } else {
            sound.playHitImpact(false);
            addFloatingNumberRef.current(`💀 DRAUGR STRIKE -${actualDmg}!`, '#10b981');
          }
          setStats((prev) => ({ ...prev, health: Math.max(0, prev.health - actualDmg) }));
        });
        setIsInsideCrypt(draugrCryptMgrRef.current.isInsideCrypt);
      }

      // 5. Update Clan Territory Wars (GvG Battlefields & 3-Tower Capture)
      if (clanConquestMgrRef.current) {
        clanConquestMgrRef.current.update(
          delta,
          player.position,
          stats.clan,
          (capturedTower) => {
            sound.playVictoryTriumph();
            addFloatingNumberRef.current(
              `🚩 ${capturedTower.name.toUpperCase()} CAPTURED FOR ${stats.clan.toUpperCase()}!`,
              '#facc15',
              true
            );
          },
          (silverDiv, valorDiv) => {
            sound.playFanfare();
            setStats((prev) => ({
              ...prev,
              silver: prev.silver + silverDiv,
              valor: prev.valor + valorDiv,
            }));
            addFloatingNumberRef.current(
              `💰 CLAN DIVIDENDS: +${silverDiv} Silver & +${valorDiv} Valor!`,
              '#10b981',
              true
            );
          }
        );
        setConquestTowers([...clanConquestMgrRef.current.towers]);
      }

      // Update NPC AI with Boss special attacks and blocking reactions
      npcMgr.update(
        delta,
        player.position,
        (damage, isBoss) => {
          // Player hit by enemy NPC
          const isBlocking = player.isBlocking;
          const shieldBonus =
            ARMORY_ITEMS.find((s) => s.id === player.equippedGear?.shieldId)?.blockBonus || 0;
          const blockRatio = Math.max(0.04, 0.15 - shieldBonus * 0.0035);
          const actualDamage = isBlocking ? Math.max(1, Math.round(damage * blockRatio)) : damage;

          if (isBlocking) {
            sound.playShieldBlock();
            world.spawnCombatSparks(player.position, 'sparks');
            addFloatingNumberRef.current(`🛡️ BLOCKED -${actualDamage}`, '#38bdf8', false, true);
          } else {
            sound.playHitImpact(false);
            player.triggerCameraShake(isBoss ? 0.6 : 0.35);
            setDamageFlash(true);
            setTimeout(() => setDamageFlash(false), 200);
            addFloatingNumberRef.current(`-${actualDamage}`, '#ef4444');
          }

          setStats((prev) => {
            const nextHealth = Math.max(0, prev.health - actualDamage);
            return { ...prev, health: nextHealth };
          });
        },
        (boss) => {
          // Boss Ground Stomp / Slam Shockwave!
          world.triggerBossShockwave(boss.mesh.position);
          const dist = player.position.distanceTo(boss.mesh.position);
          if (dist < 14 && player.position.y <= 3.8) {
            const isBlocking = player.isBlocking;
            const shieldBonus =
              ARMORY_ITEMS.find((s) => s.id === player.equippedGear?.shieldId)?.blockBonus || 0;
            const shockDmg = isBlocking
              ? Math.max(2, Math.round(8 * (1 - Math.min(0.6, shieldBonus * 0.025))))
              : 32;
            player.triggerCameraShake(0.85);
            setDamageFlash(true);
            setTimeout(() => setDamageFlash(false), 260);

            if (isBlocking) {
              sound.playShieldBlock();
              addFloatingNumberRef.current(`🛡️ SHIELD DEFLECT -${shockDmg}!`, '#38bdf8', false, true);
            } else {
              addFloatingNumberRef.current(`⚡ STOMP -${shockDmg}!`, '#f43f5e', true);
            }

            setStats((prev) => ({
              ...prev,
              health: Math.max(0, prev.health - shockDmg),
            }));
          }
        }
      );

      // Track nearby Boss for Boss Health HUD
      let nearbyBoss: BossCombatState | null = null;
      for (const npc of npcMgr.npcs) {
        if (npc.isBoss && npc.state !== 'dead') {
          const dist = npc.mesh.position.distanceTo(player.position);
          if (dist < 46) {
            nearbyBoss = {
              name: npc.name,
              title: npc.title,
              health: npc.health,
              maxHealth: npc.maxHealth,
              phase: npc.bossPhase || 1,
              isEnraged: !!npc.isEnraged,
              distance: Math.round(dist),
            };
            break;
          }
        }
      }
      setBossCombatState(nearbyBoss);

      // Check Real-Time Campaign 'reach_area' objective
      const activeCamp = activeCampaignRef.current;
      if (activeCamp && !activeCamp.isCompleted) {
        const curStep = activeCamp.steps[activeCamp.currentStepIndex];
        if (curStep && curStep.type === 'reach_area' && !curStep.completed) {
          if (activeCamp.scenario.id === 'frostfang_siege' && player.position.z >= 170) {
            advanceCampaignStepRef.current('reach_area', 1);
          } else if (activeCamp.scenario.id === 'glacial_stronghold' && player.position.z >= 180) {
            advanceCampaignStepRef.current('reach_area', 1);
          } else if (
            activeCamp.scenario.id === 'rune_ambush' &&
            player.position.distanceTo(new THREE.Vector3(-42, 3, 10)) < 16
          ) {
            advanceCampaignStepRef.current('reach_area', 1);
          }
        }
      }

      // Cleanup expired floating combat text numbers
      setFloatingNumbers((prev) => {
        const now = Date.now();
        if (prev.length > 0 && now - prev[0].createdAt > 1150) {
          return prev.filter((item) => now - item.createdAt <= 1150);
        }
        return prev;
      });

      // Check nearby interactive prompts
      let foundPrompt: string | null = null;
      for (const obj of world.interactiveObjects) {
        if (obj.position.distanceTo(player.position) < 8) {
          if (obj.type === 'ship_helm') {
            foundPrompt = `[E] Mount Drakkar Helm · [M] War Council: Lay Siege`;
          } else {
            foundPrompt = `[E] ${obj.name} - ${obj.interactionPrompt}`;
          }
          break;
        }
      }

      // Check nearby friendly villagers
      if (!foundPrompt && npcMgr) {
        for (const npc of npcMgr.npcs) {
          if (!npc.isHostile && npc.state !== 'dead') {
            if (npc.mesh.position.distanceTo(player.position) < 6.0) {
              foundPrompt = `[E] Talk to ${npc.name} (${npc.title})`;
              break;
            }
          }
        }
      }

      // Check Starfall Meteor Chest or Shared Co-Op World Boss prompt
      if (!foundPrompt && supplyDropRef.current?.active) {
        const d = supplyDropRef.current;
        if (Math.hypot(d.x - player.position.x, d.z - player.position.z) < 8.5) {
          foundPrompt = `[E] Claim ${d.name} (+${d.rewardSilver} Silver & +${d.rewardValor} Valor)`;
        }
      }
      if (!foundPrompt && sharedWorldBossRef.current?.isAlive) {
        const wb = sharedWorldBossRef.current;
        if (Math.hypot(wb.x - player.position.x, wb.z - player.position.z) < 11) {
          foundPrompt = `[Left-Click / Z / X] Strike Co-Op World Boss: ${wb.name} (${wb.health}/${wb.maxHealth} HP)`;
        }
      }
      if (!foundPrompt && Math.hypot(-28 - player.position.x, 26 - player.position.z) < 8.5) {
        foundPrompt = `[E] Enter Niflheim Underworld Dungeon Portal (Co-Op Dragon Raid)`;
      }
      if (!foundPrompt && Math.hypot(-115 - player.position.x, 42 - player.position.z) < 8.0) {
        foundPrompt = `[E] Return Portal to Katfjord Village`;
      }
      if (!foundPrompt && dungeonBossRef.current?.isAlive) {
        const db = dungeonBossRef.current;
        if (Math.hypot(db.x - player.position.x, db.z - player.position.z) < 12) {
          foundPrompt = `[Left-Click / Z / X] Strike Níðhöggr Dragon Boss (${db.health}/${db.maxHealth} HP)`;
        }
      }
      if (
        !foundPrompt &&
        Math.hypot(
          KATFJORD_MEADOW_ARCHWAY.x - player.position.x,
          KATFJORD_MEADOW_ARCHWAY.z - player.position.z
        ) < 8.5
      ) {
        foundPrompt = `[E] Enter Young Viking Meadow Sanctuary Realm (Peaceful Item Foraging)`;
      }
      if (
        !foundPrompt &&
        Math.hypot(
          MEADOW_RETURN_ARCHWAY.x - player.position.x,
          MEADOW_RETURN_ARCHWAY.z - player.position.z
        ) < 8.5
      ) {
        foundPrompt = `[E] Return to Katfjord Village`;
      }

      // Check Draugr Crypt Entrance Portal (-65, 3.24, -55)
      if (
        !foundPrompt &&
        Math.hypot(
          DraugrCryptManager.ENTRANCE_POS.x - player.position.x,
          DraugrCryptManager.ENTRANCE_POS.z - player.position.z
        ) < 8.5
      ) {
        foundPrompt = `[E] Enter Ancient Draugr Barrow Crypt Dungeon`;
      }

      // Check Draugr Crypt Interior Exit Portal (-200, 2.0, -180)
      if (
        !foundPrompt &&
        Math.hypot(-200 - player.position.x, -180 - player.position.z) < 8.0
      ) {
        foundPrompt = `[E] Exit Crypt & Return to Katfjord Surface`;
      }

      // Check Draugr Crypt Sarcophagi
      if (!foundPrompt && draugrCryptMgrRef.current?.isInsideCrypt) {
        for (const sarc of draugrCryptMgrRef.current.sarcophagi) {
          if (!sarc.opened && Math.hypot(sarc.x - player.position.x, sarc.z - player.position.z) < 6.0) {
            foundPrompt = `[E] Loot Ancient Crypt Sarcophagus (+Silver & Relics)`;
            break;
          }
        }
      }

      // Check Fjord Fishing waters prompt
      if (!foundPrompt && fishingMgrRef.current?.isNearWater(player.position)) {
        if (fishingMgrRef.current.state.status === 'bite') {
          foundPrompt = `[E / K] Hook Fish & Reel!`;
        } else if (fishingMgrRef.current.state.status === 'reeling') {
          foundPrompt = `[Space / Left-Click] Reel In Fish!`;
        } else if (player.activeTool === 'fishing_rod') {
          foundPrompt = `[E / K] Cast Fjord Fishing Rod into Water`;
        }
      }

      setInteractionPrompt(foundPrompt);

      // Render
      world.renderer.render(world.scene, world.camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      world.dispose();
    };
  }, []);

  // Hotbar item selection handler
  const handleSelectSlot = (slot: number) => {
    setActiveSlot(slot);
    const item = INITIAL_HOTBAR.find((i) => i.slot === slot);
    if (item && playerRef.current) {
      playerRef.current.setTool(item.type);
    }
  };

  // Avatar skin change
  const handleSelectSkin = (skin: AvatarSkin) => {
    setStats((prev) => ({ ...prev, skinId: skin.id }));
    if (playerRef.current) {
      playerRef.current.setSkin(skin);
    }
  };

  const handleBuySkin = (skin: AvatarSkin) => {
    if (stats.silver < skin.price) return;
    setStats((prev) => ({ ...prev, silver: prev.silver - skin.price, skinId: skin.id }));
    setSkins((prev) =>
      prev.map((s) => (s.id === skin.id ? { ...s, unlocked: true } : s))
    );
    if (playerRef.current) {
      playerRef.current.setSkin(skin);
    }
    sound.playFanfare();
  };

  // Chat message send (Broadcasts live to all players in the WebSocket realm)
  const handleSendMessage = (text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat:send',
          text,
          sender: stats.name,
          clan: stats.clan,
        })
      );
      return;
    }
    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      sender: stats.name,
      clan: stats.clan,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Emote trigger
  const handleTriggerEmote = (emoteId: string) => {
    if (!playerRef.current) return;
    playerRef.current.playEmote(emoteId);
    if (emoteId === 'roar') sound.playWarHorn();
    if (emoteId === 'skol') sound.playMeadDrink();
  };

  // Deploy to chosen battle campaign
  const handleDeployBattle = useCallback(
    (scenario: BattleScenario, selectedSkinId?: string) => {
      setShowLandingPage(false);
      setActiveBattle(scenario);

      // Apply chosen skin if selected
      if (selectedSkinId && playerRef.current) {
        const skin = skins.find((s) => s.id === selectedSkinId);
        if (skin) {
          setStats((prev) => ({ ...prev, skinId: skin.id }));
          playerRef.current.setSkin(skin);
        }
      }

      if (!playerRef.current || !worldRef.current) return;

      // Initialize structured multi-stage campaign state
      const steps = createCampaignSteps(scenario.id);
      const newCampaign: ActiveCampaignState = {
        scenario,
        currentStepIndex: 0,
        steps,
        isCompleted: false,
        startTime: Date.now(),
        enemiesDefeated: 0,
        damageDealt: 0,
        barricadesDestroyed: 0,
      };
      setActiveCampaign(newCampaign);

      // Spawn real destructible barricades and fortifications for this scenario
      worldRef.current.setupCampaignFortifications(scenario.id);

      if (scenario.mountShipOnStart) {
        // Board Drakkar Warship to lay siege across the waters
        worldRef.current.isShipMounted = true;
        worldRef.current.shipSpeed = 16;
        worldRef.current.shipRotation = 0;
        setStats((prev) => ({ ...prev, isSailing: true }));
        playerRef.current.position.set(22, 4, 85);
        playerRef.current.velocity.set(0, 0, 0);
      } else {
        worldRef.current.isShipMounted = false;
        setStats((prev) => ({ ...prev, isSailing: false }));
        playerRef.current.position.set(
          scenario.spawnLocation.x,
          scenario.spawnLocation.y,
          scenario.spawnLocation.z
        );
        playerRef.current.velocity.set(0, 0, 0);
      }

      // Transition to scenario atmospheric weather condition
      if (scenario.weather) {
        setWeather(scenario.weather);
        worldRef.current.setWeather(scenario.weather);
      }

      sound.playWarHorn();

      // Set quest objectives for this specific campaign
      const battleQuest: Quest = {
        id: `quest_${scenario.id}`,
        title: scenario.title,
        description: scenario.tagline,
        targetCount: scenario.objectives.length,
        currentCount: 0,
        rewardSilver: scenario.rewardSilver,
        rewardValor: scenario.rewardValor,
        completed: false,
        type: 'raid',
      };

      setQuests((prev) => [battleQuest, ...prev.filter((q) => q.id !== battleQuest.id)]);

      // Display campaign battle banner
      setBattleBannerNotice(`⚔️ CAMPAIGN: ${scenario.title.toUpperCase()} — ${scenario.tagline}`);
      setTimeout(() => setBattleBannerNotice(null), 6500);

      // Announce to realm chat
      setMessages((prev) => [
        ...prev,
        {
          id: `battle_${Date.now()}`,
          sender: 'War Council',
          text: `⚔️ Clan orders: Deployed to ${scenario.title}! ${scenario.tagline}`,
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    },
    [skins]
  );

  // Direct Boarding of Drakkar Warship to lay siege
  const handleBoardDrakkarSiege = useCallback(() => {
    const frostfangSiege =
      BATTLE_SCENARIOS.find((b) => b.id === 'frostfang_siege') || BATTLE_SCENARIOS[0];
    handleDeployBattle(frostfangSiege);
  }, [handleDeployBattle]);

  // Respawn at Great Longhouse
  const handleRespawn = () => {
    if (!playerRef.current || !worldRef.current) return;
    worldRef.current.isShipMounted = false;
    playerRef.current.position.set(0, 3, 20);
    playerRef.current.velocity.set(0, 0, 0);
    setStats((prev) => ({
      ...prev,
      health: prev.maxHealth,
      stamina: prev.maxStamina,
      isSailing: false,
    }));
  };

  return (
    <div id="viking-game-root" className="relative w-full h-full min-h-screen overflow-hidden bg-neutral-950 font-sans select-none">
      {/* 3D WebGL Canvas Container */}
      <div id="viking-canvas-container" ref={containerRef} className="absolute inset-0 w-full h-full cursor-crosshair overflow-hidden" />

      {/* Roblox Top Bar */}
      <RobloxTopBar
        silver={stats.silver}
        valor={stats.valor}
        gbpBalance={gbpWalletBalance}
        level={stats.level}
        clan={stats.clan}
        isMuted={isMuted}
        onToggleMute={() => {
          const muted = sound.toggleMute();
          setIsMuted(muted);
        }}
        showLeaderboard={showLeaderboard}
        onToggleLeaderboard={() => setShowLeaderboard(!showLeaderboard)}
        showQuests={showQuests}
        onToggleQuests={() => setShowQuests(!showQuests)}
        showCustomizer={showCustomizer}
        onToggleCustomizer={() => setShowCustomizer(!showCustomizer)}
        showEmotes={showEmotes}
        onToggleEmotes={() => setShowEmotes(!showEmotes)}
        showArmory={showArmory}
        onToggleArmory={() => setShowArmory(!showArmory)}
        onResetCharacter={handleRespawn}
        showLandingPage={showLandingPage}
        onToggleLandingPage={() => setShowLandingPage(!showLandingPage)}
        currentWeather={weather}
        onToggleWeather={handleToggleWeather}
        showGamepasses={showGamepasses}
        onToggleGamepasses={() => setShowGamepasses(!showGamepasses)}
        showPets={showPetsModal}
        onTogglePets={() => setShowPetsModal(!showPetsModal)}
        showTycoon={showTycoonModal}
        onToggleTycoon={() => setShowTycoonModal(!showTycoonModal)}
        showClanHub={showClanModal}
        onToggleClanHub={() => setShowClanModal(!showClanModal)}
        showMultiplayer={showMultiplayerModal}
        onToggleMultiplayer={() => setShowMultiplayerModal(!showMultiplayerModal)}
        onlinePlayerCount={remotePlayers.length + 1}
        isMultiplayerConnected={isWsConnected}
        showYoungVikingRealm={showYoungVikingModal}
        onToggleYoungVikingRealm={() => setShowYoungVikingModal(!showYoungVikingModal)}
        showHowToPlay={showHowToPlayModal}
        onToggleHowToPlay={() => setShowHowToPlayModal(!showHowToPlayModal)}
        showFishing={showFishingModal}
        onToggleFishing={() => setShowFishingModal(!showFishingModal)}
        showArchery={showArcheryHUD}
        onToggleArchery={() => setShowArcheryHUD(!showArcheryHUD)}
        showBuilding={showBuildingHUD}
        onToggleBuilding={() => setShowBuildingHUD(!showBuildingHUD)}
        showConquest={showConquestHUD}
        onToggleConquest={() => setShowConquestHUD(!showConquestHUD)}
        onEnterCrypt={() => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.position.copy(DraugrCryptManager.CRYPT_INTERIOR_SPAWN);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber('💀 Teleported to Ancient Draugr Crypt!', '#10b981', true);
          }
        }}
      />

      {/* Young Viking Meadow Sanctuary Floating HUD Bar (Active when inside Meadow Realm or Auto-Wandering) */}
      {(Math.abs(radarState.playerX - MEADOW_CENTER.x) < 38 &&
        Math.abs(radarState.playerZ - MEADOW_CENTER.z) < 38) ||
      isYoungVikingMode ? (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-emerald-500/60 shadow-2xl text-xs pointer-events-auto">
          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
            <span>🧒 Young Viking Meadow Realm</span>
          </span>
          <span className="text-neutral-600">·</span>
          <button
            onClick={() => setIsAutoWandering((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              isAutoWandering
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {isAutoWandering ? '● Auto-Wandering & Gathering' : '○ Start Auto-Wander'}
          </button>
          <button
            onClick={() => setShowYoungVikingModal(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition cursor-pointer"
          >
            Woven Basket ({(Object.values(foragerSatchel) as number[]).reduce((a, b) => a + b, 0)}) [Y]
          </button>
          <button
            onClick={() => {
              if (playerRef.current && worldRef.current) {
                setIsAutoWandering(false);
                playerRef.current.setYoungVikingMode(false);
                setIsYoungVikingMode(false);
                playerRef.current.position.set(0, 3.4, 20);
                playerRef.current.velocity.set(0, 0, 0);
                addFloatingNumber('⚓ Returned to Katfjord Village!', '#38bdf8', true);
              }
            }}
            className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold transition cursor-pointer"
          >
            Exit Meadow
          </button>
        </div>
      ) : null}

      {/* Interactive Radar Minimap, Roblox Shift-Lock Toggle & Z/X/F Weapon Skills */}
      <RadarMinimapHUD
        playerX={radarState.playerX}
        playerZ={radarState.playerZ}
        cameraYaw={radarState.cameraYaw}
        blips={radarState.blips}
        isShiftLocked={isShiftLocked}
        onToggleShiftLock={() => {
          const next = !isShiftLocked;
          setIsShiftLocked(next);
          if (playerRef.current) {
            playerRef.current.isShiftLocked = next;
          }
        }}
        skillCooldowns={skillCooldowns}
        onTriggerSkill={handleTriggerSkill}
        onOpenTacticalWheel={() => setShowTacticalWheel(true)}
        onEnterNiflheimDungeon={() => {
          if (playerRef.current && worldRef.current) {
            sound.playWarHorn();
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.position.set(-115, 3.6, 36);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber('🌀 ENTERED NIFLHEIM UNDERWORLD!', '#a855f7', true);
          }
        }}
        onOpenYoungVikingRealm={() => setShowYoungVikingModal(true)}
        onOpenHowToPlay={() => setShowHowToPlayModal(true)}
      />

      {/* Active Battle Indicator */}
      {activeBattle && !showLandingPage && (
        <div className="absolute top-14 left-4 z-30 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/90 backdrop-blur-md border border-amber-900/60 text-xs text-neutral-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] shrink-0">Campaign:</span>
          <span className="font-semibold text-white whitespace-nowrap">{activeBattle.title}</span>
          <button
            onClick={() => setShowLandingPage(true)}
            className="ml-1 text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer shrink-0"
          >
            Change Battle
          </button>
        </div>
      )}

      {/* Battle Announcement Toast Banner */}
      {battleBannerNotice && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
          <div className="px-5 py-2.5 rounded-lg bg-neutral-950/95 border border-amber-500/80 shadow-2xl text-amber-300 text-xs sm:text-sm font-extrabold flex items-center gap-2.5 backdrop-blur-md text-center max-w-2xl leading-snug">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <span>{battleBannerNotice}</span>
          </div>
        </div>
      )}

      {/* Player HUD: Health, Stamina, Crosshair, Interaction */}
      <PlayerHUD
        stats={stats}
        interactionPrompt={interactionPrompt}
        damageFlash={damageFlash}
      />

      {/* Roblox Hotbar (Slots 1-6) */}
      <RobloxHotbar
        items={INITIAL_HOTBAR}
        activeSlot={activeSlot}
        onSelectSlot={handleSelectSlot}
      />

      {/* Roblox Chat Box */}
      <RobloxChat messages={messages} onSendMessage={handleSendMessage} />

      {/* Roblox Leaderboard Modal */}
      <RobloxLeaderboard
        players={players}
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      {/* Quest Tracker */}
      <QuestTracker
        quests={quests}
        isOpen={showQuests}
        onClose={() => setShowQuests(false)}
        onClaimReward={handleClaimReward}
      />

      {/* Avatar Customizer */}
      <AvatarCustomizer
        skins={skins}
        activeSkinId={stats.skinId}
        silver={stats.silver}
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        onSelectSkin={handleSelectSkin}
        onBuySkin={handleBuySkin}
      />

      {/* Ship Control HUD (When sailing the Drakkar) */}
      {stats.isSailing && (
        <ShipControlHUD
          speed={shipSpeed}
          rotation={shipRotation}
          isStormy={weather === 'stormy'}
          seaSerpent={seaSerpent}
          onFireBallista={(side) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && playerRef.current) {
              sound.playCriticalHit();
              const shipX = worldRef.current?.shipGroup?.position.x ?? playerRef.current.position.x;
              const shipZ = worldRef.current?.shipGroup?.position.z ?? playerRef.current.position.z;
              wsRef.current.send(
                JSON.stringify({
                  type: 'ship:fire_ballista',
                  side,
                  damage: 95,
                  fromX: shipX,
                  fromZ: shipZ,
                })
              );
              addFloatingNumber('❄️⚓ FROST-BALLISTA BROADSIDE -95!', '#38bdf8', true);
            }
          }}
          onRespawnSeaSerpent={() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              sound.playWarHorn();
              wsRef.current.send(JSON.stringify({ type: 'seaserpent:respawn' }));
            }
          }}
          onDismount={() => {
            if (worldRef.current) worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
          }}
          onAccelerate={(amt) => {
            if (worldRef.current) worldRef.current.shipSpeed += amt;
          }}
          onSteer={(amt) => {
            if (worldRef.current) worldRef.current.shipRotation += amt;
          }}
        />
      )}

      {/* Emote Menu */}
      <EmoteMenu
        isOpen={showEmotes}
        onClose={() => setShowEmotes(false)}
        onTriggerEmote={handleTriggerEmote}
      />

      {/* Mobile Touch Controls with Analog Joystick & Combat Arcade Cluster */}
      <MobileControls
        onDirectionChange={(dir) => {
          keysRef.current.forward = dir.forward;
          keysRef.current.backward = dir.backward;
          keysRef.current.left = dir.left;
          keysRef.current.right = dir.right;
        }}
        onAnalogChange={(vec) => {
          keysRef.current.analogVector = vec;
        }}
        onSprintChange={(sprint) => {
          keysRef.current.sprint = sprint;
        }}
        onJump={() => {
          keysRef.current.jump = true;
          setTimeout(() => (keysRef.current.jump = false), 220);
        }}
        onAttack={handleAction}
        onBlock={(blocking) => {
          if (playerRef.current) playerRef.current.setBlocking(blocking);
        }}
        onInteract={handleInteract}
        interactionPrompt={interactionPrompt}
        onRecenterCamera={() => {
          if (playerRef.current) playerRef.current.resetCameraBehind();
        }}
        isBlocking={playerRef.current?.isBlocking}
        onLookChange={(look) => {
          keysRef.current.lookUp = look.lookUp;
          keysRef.current.lookDown = look.lookDown;
          keysRef.current.lookLeft = look.lookLeft;
          keysRef.current.lookRight = look.lookRight;
        }}
        onCycleCameraMode={() => {
          if (playerRef.current) {
            const nextMode = playerRef.current.cycleCameraMode();
            setCameraMode(nextMode);
          }
        }}
        cameraMode={cameraMode}
      />

      {/* Floating Combat Numbers (Damage, Crits & Block Indicators) */}
      <FloatingCombatTextHUD floatingNumbers={floatingNumbers} />

      {/* Boss Health Bar HUD (When in proximity to active campaign boss) */}
      {bossCombatState && <BossHealthHUD boss={bossCombatState} />}

      {/* Campaign Tracker HUD (When campaign active) */}
      {activeCampaign && (
        <CampaignTrackerHUD
          campaign={activeCampaign}
          onAbandonCampaign={handleAbandonCampaign}
        />
      )}

      {/* Campaign Victory Modal */}
      {showVictoryModal && activeCampaign && (
        <CampaignVictoryModal
          campaign={activeCampaign}
          onClaimAndClose={() => setShowVictoryModal(false)}
          onReturnToKatfjord={() => {
            setShowVictoryModal(false);
            handleAbandonCampaign();
          }}
        />
      )}

      {/* Viking Armory Point Milestone Modal */}
      <ArmoryModal
        isOpen={showArmory}
        onClose={() => setShowArmory(false)}
        currentPoints={stats.valor}
        equippedGear={stats.equippedGear || DEFAULT_EQUIPPED_GEAR}
        onEquipItem={handleEquipItem}
      />

      {/* VIP Gamepasses, GBP Mint, Saga Pass & Daily Rune Wheel Modal */}
      <GamepassStoreModal
        isOpen={showGamepasses}
        onClose={() => setShowGamepasses(false)}
        silver={stats.silver}
        valor={stats.valor}
        gbpWalletBalance={gbpWalletBalance}
        transactions={gbpTransactions}
        onCompleteGBPPurchase={(order: PendingGBPOrder, orderId: string, method) => {
          sound.playVictoryTriumph();
          if (method === 'GBP Express') {
            setGbpWalletBalance((prev) => Math.max(0, +(prev - order.amountGBP).toFixed(2)));
          }
          const newRecord: GBPTransactionRecord = {
            id: `tx_${Date.now()}`,
            itemName: order.title,
            amountGBP: order.amountGBP,
            orderId,
            method,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setGbpTransactions((prev) => [newRecord, ...prev]);

          if (order.kind === 'currency_pack') {
            const pack = GBP_CURRENCY_PACKS.find((p) => p.id === order.payloadId);
            if (pack) {
              setStats((prev) => ({
                ...prev,
                silver: prev.silver + pack.silverAmount,
                valor: prev.valor + pack.bonusValor,
                level: Math.floor((prev.valor + pack.bonusValor) / 200) + 1,
              }));
              if (pack.freeWheelSpins > 0) {
                setFreeWheelSpins((s) => s + pack.freeWheelSpins);
              }
              if (pack.includesAllPasses) {
                setGamepasses((prev) => prev.map((gp) => ({ ...gp, owned: true })));
                setHasGoldSagaPass(true);
                if (playerRef.current) {
                  playerRef.current.speedPassMultiplier = 1.3;
                  playerRef.current.jumpPassMultiplier = 1.35;
                }
              }
              addFloatingNumber(
                `💷 +${pack.silverAmount.toLocaleString()} Silver (£${pack.priceGBP.toFixed(2)} GBP)!`,
                '#10b981',
                true
              );
            }
          } else if (order.kind === 'gamepass') {
            const passId = order.payloadId;
            setGamepasses((prev) =>
              prev.map((item) => (item.id === passId ? { ...item, owned: true } : item))
            );
            if (passId === 'gp_speed_wings' && playerRef.current) {
              playerRef.current.speedPassMultiplier = 1.3;
              playerRef.current.jumpPassMultiplier = 1.35;
            }
            addFloatingNumber(`👑 UNLOCKED ${order.title} (£${order.amountGBP.toFixed(2)})!`, '#fbbf24', true);
          } else if (order.kind === 'gold_sagapass') {
            setHasGoldSagaPass(true);
            addFloatingNumber('👑 GOLD SAGA PASS UNLOCKED (£3.99 GBP)!', '#fbbf24', true);
          } else if (order.kind === 'dev_product') {
            if (order.payloadId === 'revive_heal') {
              setStats((prev) => ({
                ...prev,
                maxHealth: 150,
                health: 150,
                stamina: 100,
              }));
              addFloatingNumber('💚 VALHALLA RESTORE (150 HP)!', '#10b981', true);
            } else if (order.payloadId === 'server_horn') {
              sound.playWarHorn();
              if (worldRef.current && playerRef.current) {
                worldRef.current.triggerLightningBoltAt(playerRef.current.position);
              }
              setStats((prev) => ({ ...prev, valor: prev.valor + 250 }));
              addFloatingNumber('⚡ SERVER WAR HORN +250 VALOR!', '#38bdf8', true);
            } else if (order.payloadId === 'silver_chest') {
              setStats((prev) => ({
                ...prev,
                silver: prev.silver + 350,
                wood: prev.wood + 10,
                iron: prev.iron + 5,
              }));
              addFloatingNumber('👑 +350 Silver & Supplies!', '#fbbf24', true);
            }
          }
        }}
        gamepasses={gamepasses}
        onBuyGamepass={(passId) => {
          const gp = gamepasses.find((g) => g.id === passId);
          if (!gp || gp.owned || stats.silver < gp.priceSilver) return;
          sound.playVictoryTriumph();
          setStats((prev) => ({ ...prev, silver: prev.silver - gp.priceSilver }));
          setGamepasses((prev) =>
            prev.map((item) => (item.id === passId ? { ...item, owned: true } : item))
          );
          if (passId === 'gp_speed_wings' && playerRef.current) {
            playerRef.current.speedPassMultiplier = 1.3;
            playerRef.current.jumpPassMultiplier = 1.35;
          }
          addFloatingNumber(`👑 UNLOCKED ${gp.name}!`, '#fbbf24', true);
        }}
        sagaTiers={sagaTiers}
        hasGoldSagaPass={hasGoldSagaPass}
        onUnlockGoldSagaPass={() => {
          if (stats.silver < 300 || hasGoldSagaPass) return;
          sound.playVictoryTriumph();
          setStats((prev) => ({ ...prev, silver: prev.silver - 300 }));
          setHasGoldSagaPass(true);
          addFloatingNumber('👑 GOLD SAGA PASS UNLOCKED!', '#fbbf24', true);
        }}
        onClaimSagaTier={(tierNum, isGold) => {
          const t = sagaTiers.find((item) => item.tier === tierNum);
          if (!t || stats.valor < t.requiredValor) return;
          sound.playFanfare();
          if (isGold && hasGoldSagaPass && !t.claimedGold) {
            setSagaTiers((prev) =>
              prev.map((item) => (item.tier === tierNum ? { ...item, claimedGold: true } : item))
            );
            setStats((prev) => ({
              ...prev,
              silver: prev.silver + t.goldSilver,
              valor: prev.valor + t.goldValor,
            }));
            addFloatingNumber(`+${t.goldSilver} Gold Saga Silver!`, '#fbbf24', true);
          } else if (!isGold && !t.claimedFree) {
            setSagaTiers((prev) =>
              prev.map((item) => (item.tier === tierNum ? { ...item, claimedFree: true } : item))
            );
            setStats((prev) => ({ ...prev, silver: prev.silver + t.freeSilver }));
            addFloatingNumber(`+${t.freeSilver} Saga Silver!`, '#38bdf8', true);
          }
        }}
        onUseDevProduct={(productType) => {
          if (productType === 'revive_heal' && stats.silver >= 60) {
            sound.playFanfare();
            setStats((prev) => ({
              ...prev,
              silver: prev.silver - 60,
              maxHealth: 150,
              health: 150,
              stamina: 100,
            }));
            addFloatingNumber('💚 VALHALLA RESTORE (150 HP)!', '#10b981', true);
          } else if (productType === 'server_horn' && stats.silver >= 120) {
            sound.playWarHorn();
            if (worldRef.current && playerRef.current) {
              worldRef.current.triggerLightningBoltAt(playerRef.current.position);
            }
            setStats((prev) => ({
              ...prev,
              silver: prev.silver - 120,
              valor: prev.valor + 250,
            }));
            addFloatingNumber('⚡ SERVER WAR HORN +250 VALOR!', '#38bdf8', true);
          } else if (productType === 'silver_chest' && stats.valor >= 100) {
            sound.playFanfare();
            setStats((prev) => ({
              ...prev,
              valor: prev.valor - 100,
              silver: prev.silver + 350,
              wood: prev.wood + 10,
              iron: prev.iron + 5,
            }));
            addFloatingNumber('👑 +350 Silver & Supplies!', '#fbbf24', true);
          }
        }}
        freeWheelSpins={freeWheelSpins}
        onSpinWheel={(prize, usedFreeSpin) => {
          sound.playVictoryTriumph();
          if (usedFreeSpin) {
            setFreeWheelSpins((p) => Math.max(0, p - 1));
          } else {
            setStats((prev) => ({ ...prev, silver: Math.max(0, prev.silver - 100) }));
          }
          if (prize.type === 'silver') {
            setStats((prev) => ({ ...prev, silver: prev.silver + prize.amount }));
          } else if (prize.type === 'valor') {
            setStats((prev) => ({ ...prev, valor: prev.valor + prize.amount }));
          } else if (prize.type === 'resources') {
            setStats((prev) => ({
              ...prev,
              wood: prev.wood + prize.amount,
              iron: prev.iron + 4,
            }));
          }
          addFloatingNumber(`🎡 WHEEL WON: ${prize.label}!`, '#fbbf24', true);
        }}
      />

      {/* 3D Companion Pets, Egg Hatcher & Rideable Mounts Modal */}
      <PetsAndMountsModal
        isOpen={showPetsModal}
        onClose={() => setShowPetsModal(false)}
        silver={stats.silver}
        valor={stats.valor}
        gbpBalance={gbpWalletBalance}
        pets={pets}
        activePetId={activePetId}
        onSelectPet={(petId) => {
          setActivePetId(petId);
          if (playerRef.current) {
            playerRef.current.rebuildPet(petId);
          }
        }}
        onHatchPetEgg={(paidWithGBP) => {
          if (!paidWithGBP && stats.silver < 180) return null;
          sound.playVictoryTriumph();
          if (paidWithGBP) {
            setGbpWalletBalance((prev) => Math.max(0, +(prev - 1.29).toFixed(2)));
          } else {
            setStats((prev) => ({ ...prev, silver: prev.silver - 180 }));
          }
          const pool: PetId[] = [
            'pet_odin_raven',
            'pet_fenrir_pup',
            'pet_golden_boar',
            'pet_frost_dragon',
          ];
          const chosen = pool[Math.floor(Math.random() * pool.length)];
          setPets((prev) =>
            prev.map((p) =>
              p.id === chosen ? { ...p, unlocked: true, count: p.count + 1 } : p
            )
          );
          setActivePetId(chosen);
          if (playerRef.current) {
            playerRef.current.rebuildPet(chosen);
          }
          unlockBadge('badge_pet_tamer');
          return chosen;
        }}
        mounts={mounts}
        activeMountId={activeMountId}
        onToggleMount={(mountId) => handleToggleMount(mountId)}
        onBuyMount={(mountId, paidWithGBP) => {
          const m = mounts.find((item) => item.id === mountId);
          if (!m || m.unlocked) return;
          if (!paidWithGBP && stats.silver < m.priceSilver) return;
          sound.playVictoryTriumph();
          if (paidWithGBP) {
            setGbpWalletBalance((prev) => Math.max(0, +(prev - (m.priceGBP || 2.99)).toFixed(2)));
          } else {
            setStats((prev) => ({ ...prev, silver: prev.silver - m.priceSilver }));
          }
          setMounts((prev) =>
            prev.map((item) => (item.id === mountId ? { ...item, unlocked: true } : item))
          );
          setActiveMountId(mountId);
          if (playerRef.current) {
            playerRef.current.rebuildMount(mountId);
          }
          addFloatingNumber(`🐎 Unlocked ${m.name}!`, '#fbbf24', true);
        }}
        petEvolutions={petEvolutions}
        onFeedPet={(petId) => {
          if (stats.silver < 60) {
            addFloatingNumber('Need 60 Silver to feed companion pet!', '#ef4444');
            return;
          }
          sound.playVictoryTriumph();
          setStats((prev) => ({ ...prev, silver: prev.silver - 60 }));
          setPetEvolutions((prev) => {
            const current = prev[petId];
            if (!current) return prev;
            const newXp = current.currentXp + 35;
            if (newXp >= current.maxXp && current.stage === 1) {
              addFloatingNumber(`✨ PET EVOLVED TO ${current.evolvedName.toUpperCase()}!`, '#facc15', true);
              return {
                ...prev,
                [petId]: {
                  ...current,
                  stage: 2,
                  level: current.level + 1,
                  currentXp: newXp - current.maxXp,
                  maxXp: Math.round(current.maxXp * 1.5),
                  bonusMultiplier: +(current.bonusMultiplier * 1.4).toFixed(1),
                },
              };
            }
            addFloatingNumber(`🍖 Pet Leveled Up! (+35 XP)`, '#10b981', true);
            return {
              ...prev,
              [petId]: {
                ...current,
                currentXp: newXp,
                level: newXp >= current.maxXp ? current.level + 1 : current.level,
              },
            };
          });
        }}
        mountArmor={mountArmor}
        onToggleMountArmor={(armorId) => {
          const piece = mountArmor.find((a) => a.id === armorId);
          if (!piece) return;
          if (!piece.unlocked) {
            if (stats.silver < piece.priceSilver) {
              addFloatingNumber(`Need ${piece.priceSilver} Silver for ${piece.name}!`, '#ef4444');
              return;
            }
            sound.playVictoryTriumph();
            setStats((prev) => ({ ...prev, silver: prev.silver - piece.priceSilver }));
            setMountArmor((prev) =>
              prev.map((a) => (a.id === armorId ? { ...a, unlocked: true } : a))
            );
            addFloatingNumber(`🛡️ Unlocked & Equipped ${piece.name}!`, '#fbbf24', true);
          } else {
            sound.playShieldBlock();
            addFloatingNumber(`Equipped ${piece.name}`, '#38bdf8');
          }
        }}
      />

      {/* Village Tycoon Base-Builder & Valhalla Sky Obby Modal */}
      <TycoonAndObbyModal
        isOpen={showTycoonModal}
        onClose={() => setShowTycoonModal(false)}
        silver={stats.silver}
        valor={stats.valor}
        wood={stats.wood}
        iron={stats.iron}
        buildings={tycoonBuildings}
        uncollectedSilver={uncollectedSilver}
        uncollectedValor={uncollectedValor}
        onCollectTycoon={handleCollectTycoon}
        onUpgradeBuilding={(buildingId) => {
          const b = tycoonBuildings.find((item) => item.id === buildingId);
          if (!b || b.level >= b.maxLevel) return;
          const costSilver = Math.round(b.baseCostSilver * Math.pow(1.4, b.level));
          const costWood = b.baseCostWood + b.level * 2;
          const costIron = b.baseCostIron + (b.level > 0 ? b.level : 0);
          if (stats.silver < costSilver || stats.wood < costWood || stats.iron < costIron) return;

          sound.playHammerBuild();
          setStats((prev) => ({
            ...prev,
            silver: prev.silver - costSilver,
            wood: prev.wood - costWood,
            iron: prev.iron - costIron,
          }));

          setTycoonBuildings((prev) => {
            const next = prev.map((item) =>
              item.id === buildingId ? { ...item, level: item.level + 1 } : item
            );
            if (worldRef.current) {
              worldRef.current.updateTycoonStructures(next);
            }
            const totalLevels = next.reduce((acc, item) => acc + item.level, 0);
            if (totalLevels >= 3) {
              unlockBadge('badge_tycoon_jarl');
            }
            return next;
          });
          addFloatingNumber(`🏗️ Upgraded ${b.name}!`, '#10b981', true);
        }}
        onTeleportToObby={() => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            playerRef.current.position.set(-22, 3.8, 12);
            playerRef.current.velocity.set(0, 0, 0);
            playerRef.current.group.rotation.y = Math.PI;
            playerRef.current.resetCameraBehind();
            addFloatingNumber('🌈 Teleported to Valhalla Sky Obby!', '#38bdf8', true);
          }
        }}
        onTeleportToTycoon={() => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            playerRef.current.position.set(16, 3.8, 16);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber('🏗️ Teleported to Tycoon Plot!', '#10b981', true);
          }
        }}
      />

      {/* Clan Stronghold, Territory Control, Player Trading & Badges Modal */}
      <ClanAndSocialModal
        isOpen={showClanModal}
        onClose={() => setShowClanModal(false)}
        playerName={stats.name}
        clanName={stats.clan}
        clanMotto={clanMotto}
        clanTreasury={clanTreasury}
        territoryCaptured={territoryCaptured}
        silver={stats.silver}
        valor={stats.valor}
        wood={stats.wood}
        iron={stats.iron}
        onUpdateClanProfile={(newName, newMotto) => {
          setStats((prev) => ({ ...prev, clan: newName }));
          setClanMotto(newMotto);
          sound.playFanfare();
          addFloatingNumber(`🛡️ Clan Banner Updated: ${newName}`, '#fbbf24', true);
        }}
        onDonateToClan={(amount) => {
          if (stats.silver < amount) return;
          sound.playFanfare();
          setStats((prev) => ({ ...prev, silver: prev.silver - amount }));
          setClanTreasury((prev) => prev + amount);
          addFloatingNumber('⚔️ +5 Clan Attack Buff!', '#38bdf8', true);
        }}
        trades={trades}
        onExecuteTrade={(tradeId) => {
          const tr = trades.find((item) => item.id === tradeId);
          if (!tr) return;
          if (tr.giveType === 'wood' && stats.wood < tr.giveAmount) return;
          if (tr.giveType === 'iron' && stats.iron < tr.giveAmount) return;
          if (tr.giveType === 'silver' && stats.silver < tr.giveAmount) return;

          sound.playFanfare();
          setStats((prev) => {
            let nextWood = prev.wood - (tr.giveType === 'wood' ? tr.giveAmount : 0);
            let nextIron = prev.iron - (tr.giveType === 'iron' ? tr.giveAmount : 0);
            let nextSilver = prev.silver - (tr.giveType === 'silver' ? tr.giveAmount : 0);
            let nextValor = prev.valor;

            if (tr.receiveType === 'silver') nextSilver += tr.receiveAmount;
            else if (tr.receiveType === 'valor') {
              nextSilver += tr.receiveAmount;
              nextValor += 120;
            } else if (tr.receiveType === 'wood') {
              nextWood += 8;
              nextIron += 4;
            }
            return {
              ...prev,
              wood: nextWood,
              iron: nextIron,
              silver: nextSilver,
              valor: nextValor,
            };
          });

          if (tr.receiveType === 'pet_egg') {
            setPets((prev) =>
              prev.map((p) =>
                p.id === 'pet_frost_dragon' ? { ...p, unlocked: true, count: p.count + 1 } : p
              )
            );
            setActivePetId('pet_frost_dragon');
            if (playerRef.current) {
              playerRef.current.rebuildPet('pet_frost_dragon');
            }
            unlockBadge('badge_pet_tamer');
          }

          addFloatingNumber(`🤝 Trade Completed with ${tr.traderName}!`, '#10b981', true);
        }}
        badges={badges}
      />

      {/* Live WebSocket Multiplayer Realms, Co-Op World Boss & Holmgang PvP Modal */}
      <MultiplayerModal
        isOpen={showMultiplayerModal}
        onClose={() => setShowMultiplayerModal(false)}
        isConnected={isWsConnected}
        roomId={roomId}
        selfId={selfPlayerIdRef.current}
        playerName={stats.name}
        playerClan={stats.clan}
        playerLevel={stats.level}
        remotePlayers={remotePlayers}
        worldBoss={sharedWorldBoss}
        seaSerpent={seaSerpent}
        dungeonBoss={dungeonBoss}
        supplyDrop={supplyDrop}
        territoryHolder={territoryHolder}
        onSwitchRoom={(newRoom) => {
          setRoomId(newRoom);
          const url = new URL(window.location.href);
          url.pathname = '/STORYSIAN-VIKING-WAR-COUNCIL.AI.STUDIO';
          url.searchParams.set('room', newRoom);
          window.history.replaceState({}, 'STORYSIAN VIKING WAR COUNCIL.AI.STUDIO', url.toString());
          if (newRoom === 'young-viking-meadow' && playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.setYoungVikingMode(true);
            setIsYoungVikingMode(true);
            setIsAutoWandering(true);
            playerRef.current.position.set(MEADOW_CENTER.x, 3.4, MEADOW_CENTER.z + 8);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber('🌿 Entered Young Viking Forager Meadow!', '#10b981', true);
          } else {
            addFloatingNumber(`🌐 Joined Realm: ${newRoom.toUpperCase()}`, '#10b981', true);
          }
        }}
        onUpdatePlayerName={(newName) => {
          setStats((prev) => ({ ...prev, name: newName }));
          addFloatingNumber(`🛡️ Handle Updated: ${newName}`, '#10b981', true);
        }}
        onTeleportToCoords={(x, z, label) => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.position.set(x, 3.6, z);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber(`⚡ Teleported to ${label}!`, '#38bdf8', true);
          }
        }}
        onStrikeWorldBoss={(dmg) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            sound.playCriticalHit();
            wsRef.current.send(
              JSON.stringify({
                type: 'worldboss:hit',
                damage: dmg,
              })
            );
            addFloatingNumber(`🔥 CO-OP RAID STRIKE -${dmg}!`, '#f97316', true);
          }
        }}
        onRespawnWorldBoss={() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            sound.playWarHorn();
            wsRef.current.send(JSON.stringify({ type: 'worldboss:respawn' }));
          }
        }}
        onFireNavalBallista={() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && playerRef.current) {
            sound.playCriticalHit();
            const shipX = worldRef.current?.shipGroup?.position.x ?? playerRef.current.position.x;
            const shipZ = worldRef.current?.shipGroup?.position.z ?? playerRef.current.position.z;
            wsRef.current.send(
              JSON.stringify({
                type: 'ship:fire_ballista',
                side: 'starboard',
                damage: 95,
                fromX: shipX,
                fromZ: shipZ,
              })
            );
            addFloatingNumber('❄️⚓ FROST-BALLISTA BROADSIDE -95!', '#38bdf8', true);
          }
        }}
        onRespawnSeaSerpent={() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            sound.playWarHorn();
            wsRef.current.send(JSON.stringify({ type: 'seaserpent:respawn' }));
          }
        }}
        onBoardDrakkarNaval={() => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = true;
            setStats((prev) => ({ ...prev, isSailing: true }));
            playerRef.current.position.set(22, 4, 85);
            playerRef.current.velocity.set(0, 0, 0);
            sound.playWarHorn();
            addFloatingNumber('⚓ Boarded Multi-Crew Drakkar! Press [R] for Ballistas', '#38bdf8', true);
          }
        }}
        onStrikeDungeonBoss={(dmg) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            sound.playCriticalHit();
            wsRef.current.send(
              JSON.stringify({
                type: 'dungeon:hit',
                damage: dmg,
              })
            );
            addFloatingNumber(`🐉 NÍÐHÖGGR STRIKE -${dmg}!`, '#a855f7', true);
          }
        }}
        onRespawnDungeonBoss={() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            sound.playWarHorn();
            wsRef.current.send(JSON.stringify({ type: 'dungeon:respawn' }));
          }
        }}
        onOpenTacticalWheel={() => setShowTacticalWheel(true)}
        onSpawnSupplyDrop={() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            sound.playFanfare();
            wsRef.current.send(JSON.stringify({ type: 'supplydrop:spawn' }));
          }
        }}
        onClaimSupplyDrop={() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'supplydrop:claim' }));
          }
        }}
        onPvPAttackPlayer={(targetId, targetName) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            sound.playAxeSwing();
            wsRef.current.send(
              JSON.stringify({
                type: 'player:attack',
                targetId,
                damage: 40,
                radius: 18,
              })
            );
            addFloatingNumber(`⚔️ Holmgang Strike on ${targetName}!`, '#ef4444', true);
          }
        }}
      />

      {/* Radial Tactical War-Command Wheel Modal [T] */}
      <TacticalWheelModal
        isOpen={showTacticalWheel}
        onClose={() => setShowTacticalWheel(false)}
        playerX={radarState.playerX}
        playerZ={radarState.playerZ}
        meteorX={supplyDrop?.x ?? -14}
        meteorZ={supplyDrop?.z ?? 36}
        onSendTacticalPing={(cmd: TacticalCommandOption) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'tactical:ping',
                commandId: cmd.id,
                label: cmd.label,
                color: cmd.color,
                x: cmd.x,
                z: cmd.z,
                senderName: stats.name,
                senderClan: stats.clan,
              })
            );
          }
        }}
        onTeleportToPing={(x, z, label) => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.position.set(x, 3.6, z);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber(`⚡ Teleported to ${label}!`, '#fbbf24', true);
          }
        }}
      />

      {/* Young Viking Wanderer & Forager Sanctuary Realm Modal [Y] */}
      <YoungVikingRealmModal
        isOpen={showYoungVikingModal}
        onClose={() => setShowYoungVikingModal(false)}
        isInMeadowRealm={
          Math.abs(radarState.playerX - MEADOW_CENTER.x) < 38 &&
          Math.abs(radarState.playerZ - MEADOW_CENTER.z) < 38
        }
        isYoungVikingMode={isYoungVikingMode}
        isAutoWandering={isAutoWandering}
        satchel={foragerSatchel}
        totalItemsGathered={totalItemsGathered}
        nodes={meadowNodes}
        onEnterMeadowRealm={(startAutoWander) => {
          if (playerRef.current && worldRef.current) {
            sound.playFanfare();
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.setYoungVikingMode(true);
            setIsYoungVikingMode(true);
            setIsAutoWandering(startAutoWander);
            setRoomId('young-viking-meadow');
            playerRef.current.position.set(MEADOW_CENTER.x, 3.4, MEADOW_CENTER.z + 8);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber(
              startAutoWander
                ? '🧒 Young Viking Auto-Wandering & Gathering!'
                : '🌿 Teleported to Young Viking Meadow Realm!',
              '#10b981',
              true
            );
          }
        }}
        onReturnToKatfjord={() => {
          if (playerRef.current && worldRef.current) {
            sound.playFanfare();
            setIsAutoWandering(false);
            playerRef.current.setYoungVikingMode(false);
            setIsYoungVikingMode(false);
            setRoomId('katfjord-main');
            playerRef.current.position.set(0, 3.4, 20);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber('⚓ Returned to Katfjord Village!', '#38bdf8', true);
          }
        }}
        onToggleYoungVikingMode={() => {
          const next = !isYoungVikingMode;
          setIsYoungVikingMode(next);
          playerRef.current?.setYoungVikingMode(next);
          addFloatingNumber(
            next ? '🧒 Transformed into Young Viking Apprentice!' : '🧔 Restored Adult Viking Form!',
            '#10b981',
            true
          );
        }}
        onToggleAutoWander={() => {
          const next = !isAutoWandering;
          setIsAutoWandering(next);
          if (next && playerRef.current && worldRef.current) {
            const inMeadow =
              Math.abs(playerRef.current.position.x - MEADOW_CENTER.x) < 38 &&
              Math.abs(playerRef.current.position.z - MEADOW_CENTER.z) < 38;
            if (!inMeadow) {
              worldRef.current.isShipMounted = false;
              setStats((prev) => ({ ...prev, isSailing: false }));
              playerRef.current.setYoungVikingMode(true);
              setIsYoungVikingMode(true);
              playerRef.current.position.set(MEADOW_CENTER.x, 3.4, MEADOW_CENTER.z + 8);
              playerRef.current.velocity.set(0, 0, 0);
            }
          }
          addFloatingNumber(
            next ? '🧭 Auto-Wander & Gather Enabled!' : '⏸️ Manual WASD Control Active',
            '#fbbf24',
            true
          );
        }}
        onGatherNearestItem={() => {
          if (meadowMgrRef.current && playerRef.current) {
            const ok = meadowMgrRef.current.gatherNearestAvailableNode(
              playerRef.current,
              (node) => {
                sound.playFanfare();
                setForagerSatchel((prev) => ({
                  ...prev,
                  [node.category]: (prev[node.category] || 0) + 1,
                }));
                setTotalItemsGathered((prev) => prev + 1);
                setStats((prev) => ({
                  ...prev,
                  silver: prev.silver + node.silverReward,
                  valor: prev.valor + node.valorReward,
                }));
                addFloatingNumber(
                  `🌿 +1 ${node.name} (+${node.silverReward} Silver)`,
                  '#10b981',
                  true
                );
              }
            );
            if (ok) {
              setMeadowNodes(meadowMgrRef.current.getNodesSnapshot());
            } else {
              addFloatingNumber('Walk closer to a glowing meadow item!', '#f59e0b');
            }
          }
        }}
        onTeleportToItem={(x, z, name) => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.setYoungVikingMode(true);
            setIsYoungVikingMode(true);
            playerRef.current.position.set(x, 3.4, z);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber(`🌿 Gathered at ${name}!`, '#10b981', true);
          }
        }}
        onTradeAllSatchel={() => {
          const totalItems = (Object.values(foragerSatchel) as number[]).reduce((a, b) => a + b, 0);
          if (totalItems <= 0) return;
          const silverEarned =
            foragerSatchel.berries * 35 +
            foragerSatchel.mushrooms * 45 +
            foragerSatchel.honeycomb * 55 +
            foragerSatchel.amber * 65 +
            foragerSatchel.herbs * 40 +
            foragerSatchel.golden_apples * 85 +
            foragerSatchel.runestones * 70 +
            foragerSatchel.driftwood * 38;
          const valorEarned = totalItems * 20;
          sound.playVictoryTriumph();
          setForagerSatchel({
            berries: 0,
            mushrooms: 0,
            honeycomb: 0,
            amber: 0,
            herbs: 0,
            golden_apples: 0,
            runestones: 0,
            driftwood: 0,
          });
          setStats((prev) => ({
            ...prev,
            silver: prev.silver + silverEarned,
            valor: prev.valor + valorEarned,
            level: Math.floor((prev.valor + valorEarned) / 200) + 1,
          }));
          addFloatingNumber(
            `🧺 TRADED BASKET! +${silverEarned} Silver & +${valorEarned} Valor`,
            '#facc15',
            true
          );
        }}
        onCraftRecipe={(recipeId) => {
          sound.playVictoryTriumph();
          if (recipeId === 'berry_tea') {
            setForagerSatchel((prev) => ({
              ...prev,
              berries: Math.max(0, prev.berries - 2),
              herbs: Math.max(0, prev.herbs - 1),
            }));
            setStats((prev) => ({
              ...prev,
              health: prev.maxHealth,
              silver: prev.silver + 180,
              valor: prev.valor + 80,
            }));
            addFloatingNumber('🍓 Brewed Sweet Fjord Berry Tea! +180 Silver', '#f43f5e', true);
          } else if (recipeId === 'mushroom_brew') {
            setForagerSatchel((prev) => ({
              ...prev,
              mushrooms: Math.max(0, prev.mushrooms - 2),
              honeycomb: Math.max(0, prev.honeycomb - 1),
            }));
            setStats((prev) => ({
              ...prev,
              silver: prev.silver + 260,
              valor: prev.valor + 120,
            }));
            addFloatingNumber('🍄 Brewed Moon-Mushroom Elixir! +260 Silver', '#38bdf8', true);
          } else if (recipeId === 'golden_feast') {
            setForagerSatchel((prev) => ({
              ...prev,
              golden_apples: Math.max(0, prev.golden_apples - 1),
              amber: Math.max(0, prev.amber - 1),
            }));
            setStats((prev) => ({
              ...prev,
              health: prev.maxHealth,
              silver: prev.silver + 420,
              valor: prev.valor + 200,
              level: Math.floor((prev.valor + 200) / 200) + 1,
            }));
            addFloatingNumber("🍎 Prepared Idunn's Golden Apple Feast! +420 Silver", '#facc15', true);
          }
        }}
      />

      {/* Viking Landing Page / War Council Campaign & Siege Selection */}
      <VikingLandingPage
        isOpen={showLandingPage}
        onClose={() => setShowLandingPage(false)}
        onDeployBattle={handleDeployBattle}
        onBoardDrakkarSiege={handleBoardDrakkarSiege}
        currentSilver={stats.silver}
        currentValor={stats.valor}
        currentGbpBalance={gbpWalletBalance}
        currentLevel={stats.level}
        availableSkins={skins}
        activeSkinId={stats.skinId}
        onSelectSkin={handleSelectSkin}
        equippedGear={stats.equippedGear || DEFAULT_EQUIPPED_GEAR}
        onEquipGear={handleEquipItem}
        isMuted={isMuted}
        onToggleMute={() => {
          const muted = sound.toggleMute();
          setIsMuted(muted);
        }}
        onOpenGamepasses={() => setShowGamepasses(true)}
        onOpenPets={() => setShowPetsModal(true)}
        onOpenTycoon={() => setShowTycoonModal(true)}
        onOpenClanHub={() => setShowClanModal(true)}
        onOpenMultiplayer={() => setShowMultiplayerModal(true)}
        onOpenYoungVikingRealm={() => {
          if (playerRef.current && worldRef.current) {
            sound.playFanfare();
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.setYoungVikingMode(true);
            setIsYoungVikingMode(true);
            setIsAutoWandering(true);
            setRoomId('young-viking-meadow');
            playerRef.current.position.set(MEADOW_CENTER.x, 3.4, MEADOW_CENTER.z + 8);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber('🧒 Entered Young Viking Meadow Realm — Auto-Wandering!', '#10b981', true);
          }
          setShowYoungVikingModal(true);
        }}
        onOpenHowToPlay={() => setShowHowToPlayModal(true)}
        onOpenFishing={() => setShowFishingModal(true)}
        onOpenArchery={() => setShowArcheryHUD(true)}
        onOpenBuilding={() => setShowBuildingHUD(true)}
        onOpenConquest={() => setShowConquestHUD(true)}
        onEnterCrypt={() => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.position.copy(DraugrCryptManager.CRYPT_INTERIOR_SPAWN);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber('💀 Teleported to Ancient Draugr Crypt!', '#10b981', true);
          }
        }}
        onlinePlayerCount={remotePlayers.length + 1}
      />

      {/* How to Play, WASD & Keyboard Controls Guide Modal [?] */}
      <HowToPlayModal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
        onQuickAction={(action) => {
          if (action === 'young_viking') {
            if (playerRef.current && worldRef.current) {
              sound.playFanfare();
              worldRef.current.isShipMounted = false;
              setStats((prev) => ({ ...prev, isSailing: false }));
              playerRef.current.setYoungVikingMode(true);
              setIsYoungVikingMode(true);
              setIsAutoWandering(true);
              setRoomId('young-viking-meadow');
              playerRef.current.position.set(MEADOW_CENTER.x, 3.4, MEADOW_CENTER.z + 8);
              playerRef.current.velocity.set(0, 0, 0);
              addFloatingNumber('🧒 Entered Young Viking Meadow Realm!', '#10b981', true);
            }
            setShowYoungVikingModal(true);
          } else if (action === 'multiplayer') {
            setShowMultiplayerModal(true);
          } else if (action === 'niflheim') {
            if (playerRef.current && worldRef.current) {
              sound.playWarHorn();
              worldRef.current.isShipMounted = false;
              setStats((prev) => ({ ...prev, isSailing: false }));
              playerRef.current.position.set(-115, 3.6, 36);
              playerRef.current.velocity.set(0, 0, 0);
              addFloatingNumber('🌀 ENTERED NIFLHEIM UNDERWORLD!', '#a855f7', true);
            }
          } else if (action === 'drakkar') {
            if (playerRef.current && worldRef.current) {
              worldRef.current.isShipMounted = true;
              setStats((prev) => ({ ...prev, isSailing: true }));
              playerRef.current.position.set(22, 4, 85);
              playerRef.current.velocity.set(0, 0, 0);
              sound.playWarHorn();
              addFloatingNumber('⚓ Boarded Drakkar! Press [R] for Frost-Ballistas', '#38bdf8', true);
            }
          } else if (action === 'tactical_wheel') {
            setShowTacticalWheel(true);
          } else if (action === 'armory') {
            setShowArmory(true);
          } else if (action === 'weather') {
            handleToggleWeather();
          } else if (action === 'camera') {
            if (playerRef.current) {
              const nextMode = playerRef.current.cycleCameraMode();
              setCameraMode(nextMode);
            }
          }
        }}
      />

      {/* 1. Fjord Fishing Mini-Game Modal */}
      <FishingMiniGameModal
        isOpen={showFishingModal}
        onClose={() => setShowFishingModal(false)}
        fishingState={fishingState}
        caughtLog={caughtFishLog}
        isNearWater={isPlayerNearWater}
        onCastLine={(lure) => {
          if (playerRef.current && fishingMgrRef.current) {
            const playerPos = playerRef.current.position;
            // If player is not near water, auto-teleport them to the scenic pier first!
            if (!fishingMgrRef.current.isNearWater(playerPos)) {
              playerRef.current.position.set(0, 1.2, 72);
              playerRef.current.velocity.set(0, 0, 0);
              playerRef.current.group.rotation.y = 0;
              addFloatingNumber('⚓ Warped to Katfjord Pier for Fishing!', '#38bdf8', true);
            }
            const ok = fishingMgrRef.current.castLine(
              playerRef.current.position,
              new THREE.Vector3(0, 0, 1),
              lure
            );
            if (ok) {
              setFishingState({ ...fishingMgrRef.current.state });
              addFloatingNumber('🎣 Line Cast into Katfjord! Watching float...', '#38bdf8');
            }
          }
        }}
        onTeleportToPier={() => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.position.set(0, 1.2, 72);
            playerRef.current.velocity.set(0, 0, 0);
            playerRef.current.group.rotation.y = 0;
            addFloatingNumber('⚓ Warped to Katfjord Fishing Pier!', '#38bdf8', true);
          }
        }}
        onHookBite={() => {
          if (fishingMgrRef.current) {
            const hooked = fishingMgrRef.current.hookBite();
            if (hooked) {
              setFishingState({ ...fishingMgrRef.current.state });
              addFloatingNumber('🎣 STRIKE! Fish Hooked! Reel it in!', '#38bdf8', true);
            }
          }
        }}
        onReelPull={() => {
          if (fishingMgrRef.current) {
            fishingMgrRef.current.reel(true);
            setFishingState({ ...fishingMgrRef.current.state });
          }
        }}
        onReleaseTension={() => {
          if (fishingMgrRef.current) {
            fishingMgrRef.current.releaseTension();
            setFishingState({ ...fishingMgrRef.current.state });
          }
        }}
        onReset={() => {
          if (fishingMgrRef.current) {
            fishingMgrRef.current.reset();
            setFishingState({ ...fishingMgrRef.current.state });
          }
        }}
        onCookFish={(record) => {
          sound.playVictoryTriumph();
          setStats((prev) => ({
            ...prev,
            health: Math.min(prev.maxHealth, prev.health + 35),
            stamina: prev.maxStamina,
          }));
          setCaughtFishLog((prev) => prev.filter((item) => item !== record));
          addFloatingNumber(`🔥 Cooked & Ate ${record.species.name}! (+35 HP, Max Stamina)`, '#10b981', true);
        }}
        onSellFish={(record) => {
          sound.playFanfare();
          const bonusSilver = Math.round(record.species.silverValue * 1.5);
          setStats((prev) => ({
            ...prev,
            silver: prev.silver + bonusSilver,
            valor: prev.valor + 30,
          }));
          setCaughtFishLog((prev) => prev.filter((item) => item !== record));
          addFloatingNumber(`🪙 Sold ${record.species.name} for +${bonusSilver} Silver!`, '#fbbf24', true);
        }}
        onCookAllFish={() => {
          if (caughtFishLog.length === 0) return;
          sound.playVictoryTriumph();
          const count = caughtFishLog.length;
          setStats((prev) => ({
            ...prev,
            health: prev.maxHealth,
            stamina: prev.maxStamina,
          }));
          setCaughtFishLog([]);
          addFloatingNumber(`🔥 Smoked & Feasted on ${count} catches! (Full HP & Stamina)`, '#10b981', true);
        }}
        onSellAllFish={() => {
          if (caughtFishLog.length === 0) return;
          sound.playFanfare();
          const totalSilver = caughtFishLog.reduce(
            (acc, c) => acc + Math.round(c.species.silverValue * 1.5),
            0
          );
          const totalValor = caughtFishLog.length * 30;
          setStats((prev) => ({
            ...prev,
            silver: prev.silver + totalSilver,
            valor: prev.valor + totalValor,
          }));
          setCaughtFishLog([]);
          addFloatingNumber(`🪙 Sold all fish for +${totalSilver} Silver & +${totalValor} Valor!`, '#fbbf24', true);
        }}
      />

      {/* Floating In-Game Fishing HUD */}
      <FishingHUD
        isVisible={
          !showFishingModal &&
          (INITIAL_HOTBAR.find((i) => i.slot === activeSlot)?.type === 'fishing_rod' ||
            playerRef.current?.activeTool === 'fishing_rod' ||
            fishingState.status === 'casting' ||
            fishingState.status === 'waiting' ||
            fishingState.status === 'bite' ||
            fishingState.status === 'reeling')
        }
        fishingState={fishingState}
        isNearWater={isPlayerNearWater}
        onCast={() => {
          if (playerRef.current && fishingMgrRef.current) {
            const playerPos = playerRef.current.position;
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
              new THREE.Vector3(0, 1, 0),
              playerRef.current.group.rotation.y
            );
            const ok = fishingMgrRef.current.castLine(playerPos, forward);
            if (ok) {
              setFishingState({ ...fishingMgrRef.current.state });
              addFloatingNumber('🎣 Line Cast into Fjord! Watching float...', '#38bdf8');
            } else {
              addFloatingNumber('🌊 Walk closer to water or warp to Pier!', '#38bdf8');
            }
          }
        }}
        onHookBite={() => {
          if (fishingMgrRef.current) {
            const hooked = fishingMgrRef.current.hookBite();
            if (hooked) {
              setFishingState({ ...fishingMgrRef.current.state });
              addFloatingNumber('🎣 STRIKE! Fish Hooked! Reel it in!', '#38bdf8', true);
            }
          }
        }}
        onReelPull={() => {
          if (fishingMgrRef.current) {
            fishingMgrRef.current.reel(true);
            setFishingState({ ...fishingMgrRef.current.state });
          }
        }}
        onReleaseTension={() => {
          if (fishingMgrRef.current) {
            fishingMgrRef.current.releaseTension();
            setFishingState({ ...fishingMgrRef.current.state });
          }
        }}
        onOpenModal={() => setShowFishingModal(true)}
        onTeleportPier={() => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.position.set(0, 1.2, 72);
            playerRef.current.velocity.set(0, 0, 0);
            playerRef.current.group.rotation.y = 0;
            addFloatingNumber('⚓ Warped to Katfjord Fishing Pier!', '#38bdf8', true);
          }
        }}
      />

      {/* 2. Viking Archery Range & Reticle HUD */}
      <ArcheryHUD
        isVisible={showArcheryHUD}
        selectedArrow={selectedArrow}
        onSelectArrow={(type) => {
          setSelectedArrow(type);
          if (archeryMgrRef.current) {
            archeryMgrRef.current.selectedArrowType = type;
          }
        }}
        quiverStock={quiverStock}
        totalScore={archeryTotalScore}
        recentScore={recentTargetScore}
        onShootArrow={() => {
          if (archeryMgrRef.current && playerRef.current) {
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
              new THREE.Vector3(0, 1, 0),
              playerRef.current.group.rotation.y
            );
            const origin = playerRef.current.position.clone().add(new THREE.Vector3(0, 2.0, 0));
            const ok = archeryMgrRef.current.shootArrow(origin, forward, 1.0, selectedArrow);
            if (ok) {
              setQuiverStock({ ...archeryMgrRef.current.quiverStock });
              addFloatingNumber('🏹 Arrow Released!', '#f59e0b');
            } else {
              addFloatingNumber('⚠️ Out of this arrow type!', '#ef4444');
            }
          }
        }}
      />

      {/* 3. Fortress Construction & Palisade Base Building HUD */}
      <BuildingHUD
        isOpen={showBuildingHUD}
        onClose={() => {
          setShowBuildingHUD(false);
          buildingMgrRef.current?.setBuildMode(false);
        }}
        selectedBlueprint={selectedBlueprint}
        onSelectBlueprint={(type) => {
          setSelectedBlueprint(type);
          buildingMgrRef.current?.setBuildMode(true, type);
        }}
        onPlaceStructure={() => {
          if (buildingMgrRef.current && playerRef.current) {
            const result = buildingMgrRef.current.placeStructure(
              playerRef.current.position,
              playerRef.current.group.rotation.y,
              stats.name,
              stats.wood,
              stats.iron,
              stats.silver
            );
            if (result.success && result.cost) {
              setStats((prev) => ({
                ...prev,
                wood: prev.wood - result.cost!.wood,
                iron: prev.iron - result.cost!.iron,
                silver: prev.silver - result.cost!.silver,
              }));
              addFloatingNumber(`🔨 Built ${selectedBlueprint.replace('_', ' ').toUpperCase()}!`, '#10b981', true);
            } else {
              addFloatingNumber(result.reason || 'Cannot place structure!', '#ef4444');
            }
          }
        }}
        wood={stats.wood}
        iron={stats.iron}
        silver={stats.silver}
        raidState={raidState}
        onStartRaidWave={() => {
          if (buildingMgrRef.current) {
            const nextWave = (raidState.wave || 0) + 1;
            buildingMgrRef.current.startRaidWave(nextWave);
            setRaidState({ ...buildingMgrRef.current.raidState });
            addFloatingNumber(`⚔️ SAXON RAID WAVE ${nextWave} INCOMING!`, '#ef4444', true);
          }
        }}
      />

      {/* 6. Clan Territory Wars (GvG Battlefields) 3-Tower Capture HUD */}
      <ClanConquestHUD
        isVisible={showConquestHUD}
        towers={conquestTowers}
        playerClan={stats.clan}
        onTeleportTower={(tower) => {
          if (playerRef.current && worldRef.current) {
            worldRef.current.isShipMounted = false;
            setStats((prev) => ({ ...prev, isSailing: false }));
            playerRef.current.position.set(tower.x, 3.4, tower.z + 8);
            playerRef.current.velocity.set(0, 0, 0);
            addFloatingNumber(`🚩 Warped near ${tower.name}!`, '#fbbf24', true);
          }
        }}
      />
    </div>
  );
}

