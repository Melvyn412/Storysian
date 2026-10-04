import { BattleScenario } from '../types';
import siegeWarshipImg from '../assets/images/campaign_drakkar_siege_1790167584575.jpg';
import katfjordDefenseImg from '../assets/images/campaign_katfjord_defense_1790167598745.jpg';
import frostCitadelImg from '../assets/images/campaign_frost_citadel_1790167609625.jpg';
import runeSanctuaryImg from '../assets/images/campaign_rune_sanctuary_1790167624988.jpg';

export const BATTLE_SCENARIOS: BattleScenario[] = [
  {
    id: 'frostfang_siege',
    title: 'Siege of Frostfang Isle',
    subtitle: 'Naval Tempest Amphibious Invasion',
    tagline: 'Steer the Drakkar through rough stormy seas and towering fjord waves to storm the island fortress!',
    description:
      'A ferocious Norse tempest has struck Katfjord. Chieftain Ulfric Frost-Bane has entrenched his warband in the jagged island citadel across treacherous waters. Board the dragon-headed warship at the docks, brave the surging storm swells and lightning-streaked gale, navigate the rough seas, smash their beachhead palisades, and plunder the sacred Golden Relic.',
    location: 'Katfjord Docks ➔ Frostfang Island Citadel',
    difficulty: 'Epic Siege',
    image: siegeWarshipImg,
    rewardSilver: 500,
    rewardValor: 750,
    objectives: [
      'Board the Drakkar Warship at the harbor docks',
      'Conquer the rough stormy sea and navigate towering fjord waves',
      'Storm the island beachhead and smash 3 spiked barricades',
      'Slay Chieftain Ulfric Frost-Bane (World Boss)',
      'Plunder the Golden Relic chest (+500 Silver)',
    ],
    spawnLocation: { x: 22, y: 4, z: 85 }, // Right at the ship helm ready to steer
    mountShipOnStart: true,
    bossName: 'Chieftain Ulfric Frost-Bane',
    recommendedRole: 'Drakkar Helmsman & Vanguard',
    badge: 'FLAGSHIP SIEGE',
    weather: 'stormy',
  },
  {
    id: 'katfjord_defense',
    title: 'Defense of Katfjord',
    subtitle: 'Homeland Palisade Vanguard',
    tagline: 'Defend the Great Longhouse and villagers from raiding scout warbands!',
    description:
      'A vanguard of hostile Frostfang raiders and berserkers has landed on the northern coastline and is storming the village palisades. Rally your shield-brothers, blow the Gjallarhorn [3] to sound the alarm, and drive the invaders back into the icy sea before they reach Jarl Erik and the mead halls.',
    location: 'Katfjord Village Palisades & Great Longhouse',
    difficulty: 'Normal',
    image: katfjordDefenseImg,
    rewardSilver: 250,
    rewardValor: 350,
    objectives: [
      'Sound the Gjallarhorn [3] to rally the clan hearthguard',
      'Intercept and defeat 5 invading Frostfang skirmishers',
      'Defend Chief Jarl Erik at the Longhouse gates',
      'Collect fallen raider silver pouches',
    ],
    spawnLocation: { x: 0, y: 3.24, z: 25 }, // Village entrance gates
    mountShipOnStart: false,
    recommendedRole: 'Shield-Brother / Valkyrie',
    badge: 'VILLAGE DEFENSE',
    weather: 'sunny',
  },
  {
    id: 'glacial_stronghold',
    title: 'Frost Citadel Assault',
    subtitle: 'Highland Fortress Breach',
    tagline: 'Infiltrate the mountain stockade and silence the war horns of the north!',
    description:
      'Behind towering glacial ice walls and spiked logs lies the Frostfang high command. Scale the rocky cliffs, outflank the sentinel watchtowers, eliminate the iron vanguards, and extinguish their signal braziers to sever their reinforcements.',
    location: 'Frostfang Mountain Heights & Outpost Tents',
    difficulty: 'Challenging',
    image: frostCitadelImg,
    rewardSilver: 400,
    rewardValor: 550,
    objectives: [
      'Infiltrate the northern outpost camp',
      'Defeat Berserkers Grom and Varg in dual combat',
      'Dismantle the sentinel watchtower guards',
      'Capture the highland supply depot',
    ],
    spawnLocation: { x: 38, y: 3.24, z: 185 }, // Island beachhead ready for assault
    mountShipOnStart: false,
    bossName: 'Thorolf Shield-Breaker',
    recommendedRole: 'Berserker / Axe Specialist',
    badge: 'FORTRESS ASSAULT',
    weather: 'snowy',
  },
  {
    id: 'rune_ambush',
    title: 'Sanctuary of Thor',
    subtitle: 'Sacred Runestone Cleansing',
    tagline: 'Repel the desecrators and invoke the God of Thunder’s storm wrath!',
    description:
      'Dark omens shroud the Sacred Runestone Circle. Rogue marauders are attempting to siphon ancient Norse magic from the standing stones. Slay the defilers in the pine groves, kneel at the runic altar, and receive Thor’s thunderstorm blessing to empower your strikes.',
    location: 'Sacred Runestone Circle & Western Pine Forests',
    difficulty: 'Challenging',
    image: runeSanctuaryImg,
    rewardSilver: 300,
    rewardValor: 450,
    objectives: [
      'Reach the ancient glowing Runestone Circle',
      'Defeat the raiders defiling the sanctuary',
      'Pray at the central altar for Thor’s Blessing [E]',
      'Unleash thunderous wrath on remaining hostiles',
    ],
    spawnLocation: { x: -42, y: 3.24, z: 10 }, // Directly in the Runestone Circle
    mountShipOnStart: false,
    recommendedRole: 'Skald / Shaman',
    badge: 'MYSTIC TRIAL',
    weather: 'foggy',
  },
];
