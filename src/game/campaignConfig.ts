import { BattleId, CampaignObjectiveStep } from '../types';

export function createCampaignSteps(battleId: BattleId): CampaignObjectiveStep[] {
  switch (battleId) {
    case 'frostfang_siege':
      return [
        {
          id: 'ff_sail',
          label: 'Conquer the Rough Stormy Sea',
          description: 'Steer the Drakkar Longship through crashing stormy swells and fierce ocean waves across the fjord to Frostfang Island.',
          type: 'reach_area',
          targetCount: 1,
          currentCount: 0,
          completed: false,
          hint: 'Mount the Drakkar at Katfjord harbor [E] and navigate North through the raging storm waves.',
        },
        {
          id: 'ff_barricades',
          label: 'Breach Palisade Gates',
          description: 'Use your Battle Axe [1] to smash 3 reinforced spiked barricades defending the beach.',
          type: 'destroy_barricades',
          targetCount: 3,
          currentCount: 0,
          completed: false,
          hint: 'Equip your Axe [1] and strike the wooden barricades on the beachhead.',
        },
        {
          id: 'ff_defenders',
          label: 'Neutralize Island Guards',
          description: 'Defeat 4 Frostfang raiders defending the outpost perimeter.',
          type: 'defeat_enemies',
          targetCount: 4,
          currentCount: 0,
          completed: false,
          hint: 'Engage enemy raiders. Raise your Shield [Right-Click] to block heavy attacks.',
        },
        {
          id: 'ff_boss',
          label: 'Slay Chieftain Ulfric Frost-Bane',
          description: 'Duel the Warlord Boss in the central camp. Beware of his Phase 2 Frost Shockwave!',
          type: 'slay_boss',
          targetCount: 1,
          currentCount: 0,
          completed: false,
          hint: 'When Ulfric prepares a Frost Stomp, jump or back away to avoid shockwave damage.',
        },
        {
          id: 'ff_relic',
          label: 'Plunder the Golden Relic',
          description: 'Loot the ancient golden chest behind Ulfric’s tent to claim the spoils of victory.',
          type: 'loot_relic',
          targetCount: 1,
          currentCount: 0,
          completed: false,
          hint: 'Approach the gleaming treasure chest and press [E] to claim victory spoils.',
        },
      ];

    case 'katfjord_defense':
      return [
        {
          id: 'kd_horn',
          label: 'Sound the Alarm',
          description: 'Blow the War Horn [3] to alert the Katfjord Hearthguard and summon shield-brothers.',
          type: 'sound_horn',
          targetCount: 1,
          currentCount: 0,
          completed: false,
          hint: 'Select the War Horn [3] and click or press Space to blast the Gjallarhorn.',
        },
        {
          id: 'kd_skirmishers',
          label: 'Repel Invader Vanguard',
          description: 'Intercept and slay 5 hostile Frostfang skirmishers attacking village borders.',
          type: 'defeat_enemies',
          targetCount: 5,
          currentCount: 0,
          completed: false,
          hint: 'Patrol along the northern gate fences and eliminate approaching raiders.',
        },
        {
          id: 'kd_barricades',
          label: 'Clear Hostile Spikes',
          description: 'Smash 2 enemy siege blockades erected near the harbor road.',
          type: 'destroy_barricades',
          targetCount: 2,
          currentCount: 0,
          completed: false,
          hint: 'Chop down enemy barricades with your Axe [1] to free the roads.',
        },
        {
          id: 'kd_protect',
          label: 'Secure Jarl Erik & Longhouse',
          description: 'Defend Chief Jarl Erik at the Great Longhouse and vanquish the raiding leader.',
          type: 'slay_boss',
          targetCount: 1,
          currentCount: 0,
          completed: false,
          hint: 'Rally near Jarl Erik inside or at the doors of the Great Longhouse.',
        },
      ];

    case 'glacial_stronghold':
      return [
        {
          id: 'gs_infiltrate',
          label: 'Infiltrate Highland Outpost',
          description: 'Ascend the rocky cliffs and penetrate the Frostfang fortress camp.',
          type: 'reach_area',
          targetCount: 1,
          currentCount: 0,
          completed: false,
          hint: 'Advance into the encampment towards the flagged towers.',
        },
        {
          id: 'gs_barricades',
          label: 'Smash Heavy Stockades',
          description: 'Demolish 3 iron-reinforced barricades securing the highland pass.',
          type: 'destroy_barricades',
          targetCount: 3,
          currentCount: 0,
          completed: false,
          hint: 'Strike the heavy stockade barriers with your Axe [1].',
        },
        {
          id: 'gs_berserkers',
          label: 'Defeat Twin Berserkers',
          description: 'Defeat Berserkers Grom and Varg in furious close-quarters axe combat.',
          type: 'defeat_enemies',
          targetCount: 2,
          currentCount: 0,
          completed: false,
          hint: 'Dodge their dual-axe spin attack and strike back when they recover.',
        },
        {
          id: 'gs_boss',
          label: 'Slay Thorolf Shield-Breaker',
          description: 'Bring down the heavily armored Iron Vanguard Warlord.',
          type: 'slay_boss',
          targetCount: 1,
          currentCount: 0,
          completed: false,
          hint: 'Break through Thorolf’s iron shield with relentless axe strikes.',
        },
      ];

    case 'rune_ambush':
      return [
        {
          id: 'ra_reach',
          label: 'Reach Sacred Runestone Circle',
          description: 'Head west into the whispering pine forest where the glowing runestones stand.',
          type: 'reach_area',
          targetCount: 1,
          currentCount: 0,
          completed: false,
          hint: 'Follow the western path to the glowing blue megaliths.',
        },
        {
          id: 'ra_defilers',
          label: 'Slay Sanctuary Defilers',
          description: 'Defeat 3 raiders trying to siphon mystical Norse power from the sacred stones.',
          type: 'defeat_enemies',
          targetCount: 3,
          currentCount: 0,
          completed: false,
          hint: 'Cleanse the stone circle with your axe and shield.',
        },
        {
          id: 'ra_pray',
          label: 'Invoke Thor’s Thunder Blessing',
          description: 'Stand at the central altar stone and press [E] to commune with the Thunder God.',
          type: 'pray_altar',
          targetCount: 1,
          currentCount: 0,
          completed: false,
          hint: 'Walk inside the runestone center and press [E] to receive the blessing.',
        },
        {
          id: 'ra_purge',
          label: 'Unleash Thunder on Reinforcements',
          description: 'Use your lightning-empowered strikes to annihilate the remaining marauders.',
          type: 'defeat_enemies',
          targetCount: 3,
          currentCount: 0,
          completed: false,
          hint: 'Your strikes now deal lightning bonus damage to enemies.',
        },
      ];

    default:
      return [];
  }
}
