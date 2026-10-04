export type ToolType = 'axe' | 'shield' | 'horn' | 'mead' | 'torch' | 'hammer' | 'fishing_rod' | 'bow';

export interface HotbarItem {
  id: string;
  name: string;
  slot: number;
  type: ToolType;
  iconName: string;
  description: string;
  cooldown: number; // in seconds
  lastUsed?: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  valor: number; // XP / points
  silver: number;
  level: number;
  wood: number;
  iron: number;
  clan: string;
  name: string;
  skinId: string;
  equippedGear?: EquippedGear;
  isSailing: boolean;
}

export type ArmoryCategory = 'shield' | 'weapon' | 'headwear';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface ArmoryItem {
  id: string;
  name: string;
  category: ArmoryCategory;
  requiredPoints: number; // Valor points required to unlock
  rarity: ItemRarity;
  description: string;
  perkDescription: string;
  damageBonus?: number;
  blockBonus?: number;
  staminaBonus?: number;
  primaryColor: string;
  accentColor: string;
  specialEffect?: 'none' | 'frost' | 'lightning' | 'gold_glow' | 'blood_rune';
}

export interface EquippedGear {
  weaponId: string;
  shieldId: string;
  headwearId: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardSilver: number;
  rewardValor: number;
  completed: boolean;
  type: 'chop' | 'mine' | 'horn' | 'raid' | 'sail' | 'build';
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  clan?: string;
  isSystem?: boolean;
  time: string;
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  clan: string;
  level: number;
  silver: number;
  kills: number;
  isSelf?: boolean;
}

export interface AvatarSkin {
  id: string;
  name: string;
  title: string;
  bodyColor: string;
  shirtColor: string;
  pantsColor: string;
  beardColor: string;
  helmetColor: string;
  hornColor: string;
  shieldCrest: string;
  unlocked: boolean;
  price: number;
}

export type BattleId = 'frostfang_siege' | 'katfjord_defense' | 'glacial_stronghold' | 'rune_ambush';

export type WeatherCondition = 'sunny' | 'foggy' | 'snowy' | 'stormy';

export interface BattleScenario {
  id: BattleId;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  location: string;
  difficulty: 'Normal' | 'Challenging' | 'Epic Siege' | 'Legendary Raid';
  image: string;
  rewardSilver: number;
  rewardValor: number;
  objectives: string[];
  spawnLocation: { x: number; y: number; z: number };
  mountShipOnStart: boolean;
  bossName?: string;
  recommendedRole: string;
  badge: string;
  weather?: WeatherCondition;
}

export interface CampaignObjectiveStep {
  id: string;
  label: string;
  description: string;
  type: 'reach_area' | 'destroy_barricades' | 'defeat_enemies' | 'slay_boss' | 'loot_relic' | 'sound_horn' | 'pray_altar';
  targetCount: number;
  currentCount: number;
  completed: boolean;
  hint?: string;
}

export interface ActiveCampaignState {
  scenario: BattleScenario;
  currentStepIndex: number;
  steps: CampaignObjectiveStep[];
  isCompleted: boolean;
  startTime: number;
  enemiesDefeated: number;
  damageDealt: number;
  barricadesDestroyed: number;
}

export interface BossCombatState {
  name: string;
  title: string;
  health: number;
  maxHealth: number;
  phase: number;
  isEnraged: boolean;
  recentAction?: string;
  distance: number;
}

export interface FloatingCombatNumber {
  id: string;
  text: string;
  color: string;
  isCrit?: boolean;
  isBlock?: boolean;
  x: number; // Normalized screen or world position
  y: number;
  createdAt: number;
}

export interface GamepassItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  priceSilver: number;
  priceValor: number;
  priceGBP: number;
  owned: boolean;
  perkType: 'double_rewards' | 'golden_ship' | 'resource_magnet' | 'speed_wings';
  badgeText: string;
}

export interface GBPCurrencyPack {
  id: string;
  name: string;
  subtitle: string;
  priceGBP: number;
  silverAmount: number;
  bonusValor: number;
  freeWheelSpins: number;
  badgeText?: string;
  popular?: boolean;
  includesAllPasses?: boolean;
}

export interface GBPTransactionRecord {
  id: string;
  itemName: string;
  amountGBP: number;
  orderId: string;
  method: 'PayPal GBP' | 'GBP Express';
  timestamp: string;
}

export interface PayPalCatalogItem {
  skuId: string;
  name: string;
  priceUsd: number;
  description: string;
  badge?: string;
  silverGranted: number;
  valorGranted: number;
  freeSpinsGranted: number;
  unlockedGamepasses?: string[];
  unlockGoldSagaPass?: boolean;
}

export interface PayPalReceipt {
  orderId: string;
  transactionId: string;
  skuId: string;
  itemName: string;
  amountUsd: number;
  currency: string;
  payerEmail: string;
  payerName: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  silverGranted: number;
  valorGranted: number;
  freeSpinsGranted: number;
  unlockedGamepasses: string[];
  unlockGoldSagaPass: boolean;
}

export interface SagaPassTier {
  tier: number;
  requiredValor: number;
  freeRewardLabel: string;
  freeSilver: number;
  goldRewardLabel: string;
  goldSilver: number;
  goldValor: number;
  claimedFree: boolean;
  claimedGold: boolean;
}

export type PetId = 'pet_odin_raven' | 'pet_fenrir_pup' | 'pet_frost_dragon' | 'pet_golden_boar';

export interface VikingPet {
  id: PetId;
  name: string;
  species: string;
  rarity: ItemRarity;
  buffDescription: string;
  damageBonus: number;
  valorMultiplier: number;
  regenPerSec: number;
  primaryColor: string;
  accentColor: string;
  unlocked: boolean;
  count: number;
}

export type MountId = 'mount_war_bear' | 'mount_dire_wolf' | 'mount_sleipnir';

export interface VikingMount {
  id: MountId;
  name: string;
  title: string;
  rarity: ItemRarity;
  speedMultiplier: number;
  jumpMultiplier: number;
  priceSilver: number;
  priceGBP?: number;
  unlocked: boolean;
  primaryColor: string;
  accentColor: string;
}

export interface TycoonBuilding {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  baseCostSilver: number;
  baseCostWood: number;
  baseCostIron: number;
  silverPerSec: number;
  valorPerSec: number;
  position: { x: number; z: number };
}

export interface WeaponSkill {
  id: 'whirlwind' | 'thunder_leap' | 'frost_nova';
  key: 'Z' | 'X' | 'F';
  name: string;
  description: string;
  cooldown: number;
  staminaCost: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  rewardSilver: number;
}

export interface TradeOffer {
  id: string;
  traderName: string;
  traderClan: string;
  giveLabel: string;
  giveType: 'wood' | 'iron' | 'silver';
  giveAmount: number;
  receiveLabel: string;
  receiveType: 'silver' | 'valor' | 'iron' | 'wood' | 'pet_egg';
  receiveAmount: number;
  completed: boolean;
}

export interface RemotePlayerState {
  id: string;
  name: string;
  clan: string;
  level: number;
  silver: number;
  kills: number;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  z: number;
  rotY: number;
  skinId: string;
  weaponId: string;
  shieldId: string;
  headwearId: string;
  activeTool: string;
  isAttacking: boolean;
  isBlocking: boolean;
  isSailing: boolean;
  mountId: string | null;
  emote: string | null;
  speechText: string | null;
  lastUpdated: number;
}

export interface SharedWorldBoss {
  id: string;
  name: string;
  title: string;
  health: number;
  maxHealth: number;
  phase: number;
  isAlive: boolean;
  x: number;
  z: number;
  contributors: Record<string, { name: string; damage: number }>;
}

export interface SupplyDropEvent {
  id: string;
  name: string;
  x: number;
  z: number;
  rewardSilver: number;
  rewardValor: number;
  active: boolean;
  claimedBy: string | null;
  spawnedAt: number;
}

export interface TerritoryHolderState {
  clan: string;
  playerName: string;
  capturedAt: string;
}

export interface SeaSerpentState {
  id: string;
  name: string;
  title: string;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  x: number;
  z: number;
  captainName: string | null;
  crewCount: number;
}

export interface NiflheimDungeonBoss {
  id: string;
  name: string;
  title: string;
  health: number;
  maxHealth: number;
  phase: number;
  isAlive: boolean;
  x: number;
  z: number;
  contributors: Record<string, { name: string; damage: number }>;
}

export interface TacticalPingEvent {
  id: string;
  senderName: string;
  senderClan: string;
  commandId: string;
  label: string;
  color: string;
  x: number;
  z: number;
  createdAt: number;
}

export type MeadowItemCategory =
  | 'berries'
  | 'mushrooms'
  | 'honeycomb'
  | 'amber'
  | 'herbs'
  | 'golden_apples'
  | 'runestones'
  | 'driftwood';

export interface MeadowGatherNode {
  id: string;
  category: MeadowItemCategory;
  name: string;
  x: number;
  z: number;
  silverReward: number;
  xpReward: number;
  valorReward: number;
  isAvailable: boolean;
  respawnAt: number;
}

export type YoungVikingSatchel = Record<MeadowItemCategory, number>;

// 1. Fjord Fishing System
export interface FishSpecies {
  id: string;
  name: string;
  rarity: ItemRarity;
  minWeight: number;
  maxWeight: number;
  silverValue: number;
  staminaBoost: number;
  icon: string;
  description: string;
}

export interface CaughtFishRecord {
  species: FishSpecies;
  weight: number;
  caughtAt: string;
}

export type FishingStatus = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'caught';

export interface FishingState {
  status: FishingStatus;
  bobberPos: { x: number; y: number; z: number } | null;
  targetFish: FishSpecies | null;
  targetFishWeight: number;
  tension: number; // 0-100
  reelProgress: number; // 0-100
}

// 2. Viking Archery & Target Range
export type ArrowType = 'bodkin' | 'flame' | 'frost';

export interface ArrowDefinition {
  id: ArrowType;
  name: string;
  damage: number;
  element: 'physical' | 'fire' | 'frost';
  description: string;
  color: string;
}

export interface TargetScoreRecord {
  points: number;
  distance: number;
  isBullseye: boolean;
  timestamp: number;
}

// 3. Player Base Building & Palisade Fortress
export type BuildableStructureType =
  | 'palisade_wall'
  | 'watchtower'
  | 'palisade_gate'
  | 'defense_ballista'
  | 'hearth_bonfire'
  | 'jarl_throne';

export interface BuildableStructureBlueprint {
  type: BuildableStructureType;
  name: string;
  woodCost: number;
  ironCost: number;
  silverCost: number;
  maxHealth: number;
  description: string;
}

export interface PlacedStructure {
  id: string;
  type: BuildableStructureType;
  x: number;
  y: number;
  z: number;
  rotY: number;
  health: number;
  maxHealth: number;
  ownerName: string;
  createdAt: number;
}

export interface RaidWaveState {
  isActive: boolean;
  wave: number;
  enemiesRemaining: number;
  totalEnemies: number;
  rewardSilver: number;
  rewardValor: number;
}

// 4. Pet Evolution & Mount Armor
export interface PetEvolutionData {
  level: number;
  currentXp: number;
  maxXp: number;
  stage: 1 | 2; // Base -> Evolved form
  evolvedName: string;
  evolvedSpecies: string;
  bonusMultiplier: number;
}

export interface MountArmorPiece {
  id: string;
  name: string;
  slot: 'head' | 'saddle' | 'aura';
  rarity: ItemRarity;
  speedBonus: number;
  unlocked: boolean;
  priceSilver: number;
  description: string;
}

// 5. Draugr Crypts & Ancient Tombs
export interface DraugrEnemyState {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  z: number;
  isAlive: boolean;
  type: 'draugr_warrior' | 'draugr_archer' | 'crypt_wight';
}

export interface CryptSarcophagus {
  id: string;
  x: number;
  z: number;
  opened: boolean;
  rewardSilver: number;
  rewardValor: number;
  itemDrop?: string;
}

// 6. Clan Territory Wars (GvG Battlefields)
export interface ClanConquestTower {
  id: string;
  name: string;
  x: number;
  z: number;
  controllingClan: string | null;
  capturePercent: number; // 0 to 100
  isContested: boolean;
}







