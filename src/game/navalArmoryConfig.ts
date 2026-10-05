import { NavalCategory, NavalCustomizationItem, DrakkarCustomization } from '../types';

export const DEFAULT_DRAKKAR_CUSTOMIZATION: DrakkarCustomization = {
  sailId: 'sail_crimson_raider',
  shieldsId: 'shields_clan_iron',
  figureheadId: 'fig_drakkar_dragon',
};

export const DEFAULT_UNLOCKED_NAVAL_ITEMS: string[] = [
  'sail_crimson_raider',
  'shields_clan_iron',
  'fig_drakkar_dragon',
];

export const NAVAL_CUSTOMIZATION_ITEMS: NavalCustomizationItem[] = [
  // ==========================================
  // 1. DRAKKAR SAIL PATTERNS (6)
  // ==========================================
  {
    id: 'sail_crimson_raider',
    category: 'sail',
    name: 'Crimson Raider Canvas',
    lore: 'Standard blood-red and ivory striped linen sail favored by Katfjord sea rovers.',
    costSilver: 0,
    rarity: 'common',
    sailColor: '#cc2929',
    sailStripeColor: '#f8fafc',
    sailEmblem: 'crossed_axes',
  },
  {
    id: 'sail_raven_odin',
    category: 'sail',
    name: "Odin's Hugin Raven",
    lore: 'Deep charcoal woven sail emblazoned with the Allfather’s watching raven wings and golden solar trim.',
    costSilver: 200,
    rarity: 'uncommon',
    sailColor: '#1e1e24',
    sailStripeColor: '#f59e0b',
    sailEmblem: 'raven',
  },
  {
    id: 'sail_valkyrie_gold',
    category: 'sail',
    name: 'Valkyrie Auric Sun',
    lore: 'Royal golden wool and imperial crimson broadcloth blessed by Freyja to guide fallen heroes.',
    costSilver: 350,
    rarity: 'rare',
    sailColor: '#eab308',
    sailStripeColor: '#991b1b',
    sailEmblem: 'valkyrie_wings',
  },
  {
    id: 'sail_frost_wyrm',
    category: 'sail',
    name: 'Frostborn Glacial Wyrm',
    lore: 'Woven with frost-hardened threads from the peaks of Jotunheim, whispering cold sea breezes.',
    costSilver: 420,
    rarity: 'epic',
    sailColor: '#0284c7',
    sailStripeColor: '#e0f2fe',
    sailEmblem: 'frost_snowflake',
  },
  {
    id: 'sail_emerald_serpent',
    category: 'sail',
    name: 'Jörmungandr Sea Scales',
    lore: 'Lustrous sea-emerald canvas inspired by the undulating coils of the Great Midgard Serpent.',
    costSilver: 520,
    rarity: 'legendary',
    sailColor: '#059669',
    sailStripeColor: '#a7f3d0',
    sailEmblem: 'serpent_coil',
  },
  {
    id: 'sail_niflheim_shadow',
    category: 'sail',
    name: 'Niflheim Phantom Shroud',
    lore: 'Eerie abyssal purple canvas that catches midnight fog and strikes terror into coastal Saxon garrisons.',
    costSilver: 700,
    rarity: 'mythic',
    sailColor: '#581c87',
    sailStripeColor: '#c084fc',
    sailEmblem: 'runic_skull',
  },

  // ==========================================
  // 2. HULL GUNWALE SHIELDS (6)
  // ==========================================
  {
    id: 'shields_clan_iron',
    category: 'shields',
    name: 'Clan Iron & Crimson',
    lore: 'Alternating crimson red and carved timber oak shields bolted securely along both gunwales.',
    costSilver: 0,
    rarity: 'common',
    shieldColorA: '#dc2626',
    shieldColorB: '#d97706',
    shieldBossColor: '#cbd5e1',
  },
  {
    id: 'shields_blackguard',
    category: 'shields',
    name: 'Blackguard Nightsteel',
    lore: 'Heavy forged dark iron and basalt boss plates designed for silent night raids.',
    costSilver: 180,
    rarity: 'uncommon',
    shieldColorA: '#18181b',
    shieldColorB: '#3f3f46',
    shieldBossColor: '#94a3b8',
  },
  {
    id: 'shields_frost_azure',
    category: 'shields',
    name: 'Frostpeak Azure Shields',
    lore: 'Cerulean blue and frosted silver rimmed targes that gleam like fjord icebergs in the sun.',
    costSilver: 280,
    rarity: 'rare',
    shieldColorA: '#0284c7',
    shieldColorB: '#38bdf8',
    shieldBossColor: '#e0f2fe',
  },
  {
    id: 'shields_verdant_guard',
    category: 'shields',
    name: 'Verdant Forest Bastion',
    lore: 'Treated pine bark and deep emerald shields blessed by woodland druids against enemy ballista fire.',
    costSilver: 340,
    rarity: 'rare',
    shieldColorA: '#15803d',
    shieldColorB: '#4ade80',
    shieldBossColor: '#facc15',
  },
  {
    id: 'shields_gilded_gold',
    category: 'shields',
    name: 'Gilded Chieftain Plates',
    lore: 'Burnished gold and hammered bronze boss plates reflecting the wealth of legendary Viking conquerors.',
    costSilver: 480,
    rarity: 'legendary',
    shieldColorA: '#ca8a04',
    shieldColorB: '#fef08a',
    shieldBossColor: '#fbbf24',
  },
  {
    id: 'shields_blood_eclipse',
    category: 'shields',
    name: 'Blood Eclipse Volcanic',
    lore: 'Hardened maroon and blackened obsidian shields quenched in dragon blood.',
    costSilver: 650,
    rarity: 'mythic',
    shieldColorA: '#7f1d1d',
    shieldColorB: '#450a0a',
    shieldBossColor: '#f87171',
  },

  // ==========================================
  // 3. BOW FIGUREHEAD DESIGNS (6)
  // ==========================================
  {
    id: 'fig_drakkar_dragon',
    category: 'figurehead',
    name: 'Carved Drakkar Wyrm',
    lore: 'The classic fierce horned dragon stem that cleaves stormy seas and frightens sea monsters.',
    costSilver: 0,
    rarity: 'common',
    figureheadType: 'dragon',
    figureheadColor: '#a64424',
    emissiveColor: '#7c2d12',
  },
  {
    id: 'fig_fenrir_wolf',
    category: 'figurehead',
    name: "Fenrir's Dire Howl",
    lore: 'Snarling dire wolf prow with bared fangs carved from hardened Nordic ironwood.',
    costSilver: 250,
    rarity: 'uncommon',
    figureheadType: 'wolf',
    figureheadColor: '#475569',
    emissiveColor: '#38bdf8',
  },
  {
    id: 'fig_odin_raven',
    category: 'figurehead',
    name: "Odin's Keen Raven",
    lore: 'Sharp-beaked raven figurehead with outstretched timber wings seeking distant Saxon shores.',
    costSilver: 320,
    rarity: 'rare',
    figureheadType: 'raven',
    figureheadColor: '#1e293b',
    emissiveColor: '#f59e0b',
  },
  {
    id: 'fig_thor_ram',
    category: 'figurehead',
    name: "Mjolnir's Battering Ram",
    lore: 'Heavy curved ram horns reinforced with bronze bands for shattering harbor sea barricades.',
    costSilver: 420,
    rarity: 'epic',
    figureheadType: 'ram',
    figureheadColor: '#b45309',
    emissiveColor: '#fde047',
  },
  {
    id: 'fig_sea_serpent',
    category: 'figurehead',
    name: 'Jörmungandr Leviathan',
    lore: 'Crested sea leviathan head with glowing emerald runic eyes that part ocean squalls.',
    costSilver: 550,
    rarity: 'legendary',
    figureheadType: 'serpent',
    figureheadColor: '#047857',
    emissiveColor: '#34d399',
  },
  {
    id: 'fig_golden_valkyrie',
    category: 'figurehead',
    name: 'Golden Winged Valkyrie',
    lore: 'Majestic winged shieldmaiden figurehead adorned in gleaming golden plate to carry warriors to glory.',
    costSilver: 750,
    rarity: 'mythic',
    figureheadType: 'valkyrie',
    figureheadColor: '#d97706',
    emissiveColor: '#fef08a',
  },
];

export function getNavalItemById(id: string): NavalCustomizationItem | undefined {
  return NAVAL_CUSTOMIZATION_ITEMS.find((item) => item.id === id);
}

export function getNavalItemsByCategory(category: NavalCategory): NavalCustomizationItem[] {
  return NAVAL_CUSTOMIZATION_ITEMS.filter((item) => item.category === category);
}

export function getNavalItemPerk(item: NavalCustomizationItem): string {
  switch (item.id) {
    case 'sail_crimson_raider':
      return 'Standard Katfjord Rigging · +0% Sailing Speed';
    case 'sail_raven_odin':
      return "Allfather's Draft · +10% Sailing Speed & Wind Turning";
    case 'sail_valkyrie_gold':
      return 'Freyja’s Gale · +15% Sailing Speed & Broadside Stability';
    case 'sail_frost_wyrm':
      return 'Jotun Squall · +18% Sailing Speed & Ice Resistance';
    case 'sail_emerald_serpent':
      return 'Midgard Surge · +22% Sailing Speed & Wave Cutting';
    case 'sail_niflheim_shadow':
      return 'Phantom Mist · +28% Sailing Speed & Silent Saxon Evasion';

    case 'shields_clan_iron':
      return 'Hardened Oak Rim · Base Hull Armor (+0% Defense)';
    case 'shields_blackguard':
      return 'Nightsteel Boss · +8% Hull Protection against Saxon Arrows';
    case 'shields_frost_azure':
      return 'Fjord Glacial Barrier · +14% Hull Armor & Frost Deflection';
    case 'shields_verdant_guard':
      return 'Druidic Ironwood · +18% Hull Armor & Ballista Absorption';
    case 'shields_gilded_gold':
      return 'Jarl Auric Plate · +24% Hull Armor & +10% Crew Morale';
    case 'shields_blood_eclipse':
      return 'Dragon-Blood Forged · +32% Hull Armor & Piercing Immunity';

    case 'fig_drakkar_dragon':
      return 'Traditional Drakkar Stem · Base Ramming Impact (+0% Dmg)';
    case 'fig_fenrir_wolf':
      return 'Fenrir’s Savage Maw · +15% Ramming Impact & Wolf Howl Alert';
    case 'fig_odin_raven':
      return 'Odin’s Scouting Eye · +20% Ramming Impact & Coastal Sight Range';
    case 'fig_thor_ram':
      return 'Mjolnir’s Cleaver · +28% Ramming Impact against Harbor Barricades';
    case 'fig_sea_serpent':
      return 'Midgard Crest · +35% Ramming Impact & Emerald Wave Cleave';
    case 'fig_golden_valkyrie':
      return 'Valkyrie Solar Aura · +45% Ramming Impact & Fear Aura vs Enemies';

    default:
      return 'Reinforces Drakkar Longship Naval Capabilities';
  }
}

export interface NavalBonuses {
  speedBonus: number;
  armorBonus: number;
  rammingBonus: number;
}

export function calculateNavalBonuses(customization: DrakkarCustomization): NavalBonuses {
  let speedBonus = 0;
  let armorBonus = 0;
  let rammingBonus = 0;

  if (customization.sailId === 'sail_raven_odin') speedBonus += 10;
  else if (customization.sailId === 'sail_valkyrie_gold') speedBonus += 15;
  else if (customization.sailId === 'sail_frost_wyrm') speedBonus += 18;
  else if (customization.sailId === 'sail_emerald_serpent') speedBonus += 22;
  else if (customization.sailId === 'sail_niflheim_shadow') speedBonus += 28;

  if (customization.shieldsId === 'shields_blackguard') armorBonus += 8;
  else if (customization.shieldsId === 'shields_frost_azure') armorBonus += 14;
  else if (customization.shieldsId === 'shields_verdant_guard') armorBonus += 18;
  else if (customization.shieldsId === 'shields_gilded_gold') armorBonus += 24;
  else if (customization.shieldsId === 'shields_blood_eclipse') armorBonus += 32;

  if (customization.figureheadId === 'fig_fenrir_wolf') rammingBonus += 15;
  else if (customization.figureheadId === 'fig_odin_raven') rammingBonus += 20;
  else if (customization.figureheadId === 'fig_thor_ram') rammingBonus += 28;
  else if (customization.figureheadId === 'fig_sea_serpent') rammingBonus += 35;
  else if (customization.figureheadId === 'fig_golden_valkyrie') rammingBonus += 45;

  return { speedBonus, armorBonus, rammingBonus };
}

export interface NavalPreset {
  id: string;
  name: string;
  description: string;
  themeColor: string;
  customization: DrakkarCustomization;
}

export const NAVAL_PRESETS: NavalPreset[] = [
  {
    id: 'preset_classic_katfjord',
    name: 'Classic Katfjord Raider',
    description: 'Traditional blood-red striped sail, iron oak shields, and carved horned dragon stem.',
    themeColor: '#cc2929',
    customization: {
      sailId: 'sail_crimson_raider',
      shieldsId: 'shields_clan_iron',
      figureheadId: 'fig_drakkar_dragon',
    },
  },
  {
    id: 'preset_odins_ravenguard',
    name: "Odin's Ravenguard",
    description: "Dark linen raven wings, blackguard basalt shields, and Odin's watchful raven prow.",
    themeColor: '#38bdf8',
    customization: {
      sailId: 'sail_raven_odin',
      shieldsId: 'shields_blackguard',
      figureheadId: 'fig_odin_raven',
    },
  },
  {
    id: 'preset_valkyrie_sun',
    name: 'Golden Valkyrie Solar',
    description: 'Imperial golden auric sail, burnished gold chieftain shields, and winged Valkyrie figurehead.',
    themeColor: '#eab308',
    customization: {
      sailId: 'sail_valkyrie_gold',
      shieldsId: 'shields_gilded_gold',
      figureheadId: 'fig_golden_valkyrie',
    },
  },
  {
    id: 'preset_glacial_frostwyrm',
    name: 'Glacial Frostwyrm',
    description: 'Frostborn Jotun sail, azure ice shields, and Thor’s heavy barricade battering ram.',
    themeColor: '#0284c7',
    customization: {
      sailId: 'sail_frost_wyrm',
      shieldsId: 'shields_frost_azure',
      figureheadId: 'fig_thor_ram',
    },
  },
];
