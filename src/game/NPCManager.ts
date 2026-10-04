import * as THREE from 'three';
import { sound } from '../audio/soundEngine';

export type WeaponType =
  | 'axe'
  | 'dual_axes'
  | 'hammer'
  | 'shield_spear'
  | 'shield_axe'
  | 'staff'
  | 'tankard'
  | 'bow'
  | 'none';

export interface VikingNPC {
  id: string;
  name: string;
  clan: string;
  title: string;
  isHostile: boolean;
  isBoss?: boolean;
  bossPhase?: number;
  isEnraged?: boolean;
  specialAttackTimer?: number;
  isPerformingSpecial?: boolean;
  health: number;
  maxHealth: number;
  mesh: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  head: THREE.Mesh;
  patrolCenter: THREE.Vector3;
  patrolWaypoints?: THREE.Vector3[];
  currentWaypointIdx?: number;
  patrolRadius: number;
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'dead';
  attackCooldown: number;
  speechText?: string;
  nameplateSprite?: THREE.Sprite;
  nameplateCanvas?: HTMLCanvasElement;
  nameplateTexture?: THREE.CanvasTexture;
  dialogueTimer?: number;
  originalScale?: number;
}

export class NPCManager {
  public npcs: VikingNPC[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnKatfjordVillagers();
    this.spawnFrostRaiders();
  }

  /**
   * Helper to create authentic Roblox-style overhead billboard nameplate
   */
  private createNameplate(
    name: string,
    clan: string,
    title: string,
    isHostile: boolean,
    isBoss: boolean = false
  ): { sprite: THREE.Sprite; canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    this.drawNameplateCanvas(ctx, canvas.width, canvas.height, name, clan, title, 1, isHostile, isBoss, null);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(6.4, 2.0, 1.0);
    sprite.position.y = isBoss ? 9.8 : 7.6;

    return { sprite, canvas, texture };
  }

  /**
   * Draw the Roblox GUI billboard with clan tag, level badge, and health bar
   */
  private drawNameplateCanvas(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    name: string,
    clan: string,
    title: string,
    healthPct: number,
    isHostile: boolean,
    isBoss: boolean,
    activeSpeech: string | null
  ) {
    ctx.clearRect(0, 0, w, h);

    if (activeSpeech) {
      // Roblox chat bubble
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(16, 4, w - 32, 60, 12);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(w / 2 - 12, 64);
      ctx.lineTo(w / 2, 76);
      ctx.lineTo(w / 2 + 12, 64);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeSpeech.length > 36 ? activeSpeech.slice(0, 34) + '...' : activeSpeech, w / 2, 42);
      return;
    }

    // Background pill
    ctx.fillStyle = isBoss
      ? 'rgba(69, 10, 10, 0.85)'
      : isHostile
      ? 'rgba(30, 27, 75, 0.82)'
      : 'rgba(15, 23, 42, 0.82)';
    ctx.beginPath();
    ctx.roundRect(30, 20, w - 60, 110, 16);
    ctx.fill();

    // Border
    ctx.strokeStyle = isBoss ? '#ef4444' : isHostile ? '#818cf8' : '#38bdf8';
    ctx.lineWidth = isBoss ? 4 : 2;
    ctx.stroke();

    // Title / Clan (top sub-line)
    ctx.fillStyle = isBoss ? '#fca5a5' : isHostile ? '#c7d2fe' : '#7dd3fc';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`<${clan}> • ${title}`, w / 2, 50);

    // Name (bold main line)
    ctx.fillStyle = '#ffffff';
    ctx.font = isBoss ? 'bold 28px system-ui, sans-serif' : 'bold 24px system-ui, sans-serif';
    ctx.fillText(name, w / 2, 82);

    // Health bar for hostiles or bosses
    if (isHostile || isBoss || healthPct < 1.0) {
      const barX = 60;
      const barY = 96;
      const barW = w - 120;
      const barH = 14;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(barX, barY, barW, barH);

      const healthW = Math.max(0, barW * healthPct);
      ctx.fillStyle = isBoss ? '#dc2626' : isHostile ? '#ea580c' : '#22c55e';
      ctx.fillRect(barX, barY, healthW, barH);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
    }
  }

  /**
   * Spawn a populated Viking village (Katfjord)
   */
  private spawnKatfjordVillagers() {
    // 1. Jarl Erik the Bold (Village Chieftain at Longhouse)
    const jarl = this.createHumanoidNPC({
      name: 'Jarl Erik the Bold',
      clan: 'Katfjord Clan',
      title: 'Village Chieftain',
      shirtColor: 0xd97706, // Regal Gold
      pantsColor: 0x451a03,
      beardColor: 0x271406,
      helmetColor: 0xfbbf24, // Gold Crown
      isHostile: false,
      weapon: 'axe',
      accessories: { hasCrown: true, hasCape: true },
      position: new THREE.Vector3(0, 3, -8),
      speechText: 'Hail, warrior! Equip your Axe [1] and lead Katfjord to glory!',
    });
    this.npcs.push(jarl);

    // 2. Thora Golden-Brew (Mead Brewer in the Longhouse feasting hall)
    const thora = this.createHumanoidNPC({
      name: 'Thora Golden-Brew',
      clan: 'Katfjord Clan',
      title: 'Mead Brewer',
      shirtColor: 0xb45309, // Amber tunic
      pantsColor: 0x3f2d1d,
      beardColor: 0x000000,
      helmetColor: 0x78716c,
      isHostile: false,
      weapon: 'tankard',
      accessories: { hasBraids: true },
      position: new THREE.Vector3(-6, 3, -22),
      speechText: 'Skol! May your drinking horn never empty! Take a sip of hearty Mead [4].',
    });
    this.npcs.push(thora);

    // 3. Halstein the Smith (Forge Master)
    const smith = this.createHumanoidNPC({
      name: 'Halstein the Smith',
      clan: 'Katfjord Clan',
      title: 'Master Forge',
      shirtColor: 0x334155, // Sooty dark grey
      pantsColor: 0x1e293b,
      beardColor: 0x991b1b, // Flaming red beard
      helmetColor: 0x475569,
      isHostile: false,
      weapon: 'hammer',
      position: new THREE.Vector3(38, 3, 0),
      speechText: 'Clang! Bring me Timber and Iron Ore to temper legendary Viking steel!',
    });
    this.npcs.push(smith);

    // 4. Astrid Shieldmaiden (Harbor Gate Valkyrie Defender)
    const astrid = this.createHumanoidNPC({
      name: 'Astrid Shieldmaiden',
      clan: 'Katfjord Guard',
      title: 'Harbor Defender',
      shirtColor: 0x0284c7, // Sea blue
      pantsColor: 0x0f172a,
      beardColor: 0x000000,
      helmetColor: 0x94a3b8, // Silver Helm
      isHostile: false,
      weapon: 'shield_spear',
      accessories: { hasBraids: true },
      position: new THREE.Vector3(-18, 3, 35),
      speechText: 'Keep watch on the seas! Frostfang raiders lurk across the icy fjord waters!',
    });
    this.npcs.push(astrid);

    // 5. Bjorn Bear-Claw (Katfjord Woodsman & Lumberjack)
    const bjorn = this.createHumanoidNPC({
      name: 'Bjorn Bear-Claw',
      clan: 'Katfjord Clan',
      title: 'Forester',
      shirtColor: 0x15803d, // Forest green
      pantsColor: 0x292524,
      beardColor: 0x57341b, // Thick brown beard
      helmetColor: 0x44403c,
      isHostile: false,
      weapon: 'axe',
      position: new THREE.Vector3(-36, 3, -32),
      speechText: 'The great pines of Katfjord stand tall. Chop them down for longship timber!',
    });
    this.npcs.push(bjorn);

    // 6. Sigurd the Runemaster (Rune Priest in the Sacred Circle)
    const sigurd = this.createHumanoidNPC({
      name: 'Sigurd Runemaster',
      clan: 'Thor Cult',
      title: 'Rune Priest',
      shirtColor: 0x4c1d95, // Mystic purple tunic
      pantsColor: 0x1e1b4b,
      beardColor: 0xe2e8f0, // White wise beard
      helmetColor: 0x6b21a8,
      isHostile: false,
      weapon: 'staff',
      accessories: { hasCape: true },
      position: new THREE.Vector3(-42, 3, 10),
      speechText: 'Step into the stones, warrior! Thor will renew your strength and stamina.',
    });
    this.npcs.push(sigurd);

    // 7. Gunnar the Shipwright (Master Boatbuilder at the Docks)
    const gunnar = this.createHumanoidNPC({
      name: 'Gunnar Shipwright',
      clan: 'Katfjord Fleet',
      title: 'Master Boatbuilder',
      shirtColor: 0x0369a1, // Navy tunic
      pantsColor: 0x334155,
      beardColor: 0xb45309,
      helmetColor: 0x64748b,
      isHostile: false,
      weapon: 'hammer',
      position: new THREE.Vector3(14, 2, 70),
      speechText: 'The Drakkar warship is ready! Mount the helm [E] and set sail for glory!',
    });
    this.npcs.push(gunnar);

    // 8. Freya Keen-Eye (Lookout on the North Watchtower)
    const freya = this.createHumanoidNPC({
      name: 'Freya Keen-Eye',
      clan: 'Katfjord Guard',
      title: 'Watchtower Scout',
      shirtColor: 0x047857, // Emerald
      pantsColor: 0x064e3b,
      beardColor: 0x000000,
      helmetColor: 0x059669,
      isHostile: false,
      weapon: 'bow',
      accessories: { hasBraids: true },
      position: new THREE.Vector3(20, 13.5, 35),
      speechText: 'I can see the Frostfang outpost across the waters! Ready your war horns!',
    });
    this.npcs.push(freya);

    // 9. Torstein the Hearthguard (Patrolling Guard between gates and longhouse)
    const torstein = this.createHumanoidNPC({
      name: 'Torstein Hearthguard',
      clan: 'Katfjord Guard',
      title: 'Shield Brother',
      shirtColor: 0x991b1b, // Crimson war tunic
      pantsColor: 0x1f2937,
      beardColor: 0x78350f,
      helmetColor: 0x64748b,
      isHostile: false,
      weapon: 'shield_axe',
      position: new THREE.Vector3(4, 3, 16),
      speechText: 'None shall breach the walls of Katfjord while my shield holds true!',
    });
    torstein.patrolWaypoints = [
      new THREE.Vector3(4, 3, 16),
      new THREE.Vector3(4, 3, 30),
      new THREE.Vector3(-10, 3, 30),
      new THREE.Vector3(-10, 3, 16),
    ];
    this.npcs.push(torstein);

    // 10. Ragnar the Sentry (Patrolling along the palisades)
    const ragnar = this.createHumanoidNPC({
      name: 'Ragnar the Sentry',
      clan: 'Katfjord Guard',
      title: 'Gate Watchman',
      shirtColor: 0xb91c1c,
      pantsColor: 0x111827,
      beardColor: 0x172554,
      helmetColor: 0x475569,
      isHostile: false,
      weapon: 'axe',
      position: new THREE.Vector3(-12, 3, 24),
      speechText: 'Skol! May the gods grant you sharp steel and good winds!',
    });
    ragnar.patrolWaypoints = [
      new THREE.Vector3(-12, 3, 24),
      new THREE.Vector3(12, 3, 24),
    ];
    this.npcs.push(ragnar);

    // 11. Einar Saga-Teller (Elder by the central village firepit)
    const einar = this.createHumanoidNPC({
      name: 'Einar Saga-Teller',
      clan: 'Katfjord Clan',
      title: 'Skaldic Elder',
      shirtColor: 0x57534e, // Slate grey
      pantsColor: 0x292524,
      beardColor: 0xf1f5f9, // Long white skald beard
      helmetColor: 0x44403c,
      isHostile: false,
      weapon: 'staff',
      position: new THREE.Vector3(0, 3, 15),
      speechText: 'Sit by the fire, young warrior, and hear tales of dragons and the Allfather!',
    });
    this.npcs.push(einar);

    // 12. Ingrid the Shield-Sister (Warrior practicing near combat dummies)
    const ingrid = this.createHumanoidNPC({
      name: 'Ingrid Shield-Sister',
      clan: 'Katfjord Clan',
      title: 'Warrior Maiden',
      shirtColor: 0x0e7490, // Cyan war tunic
      pantsColor: 0x155e75,
      beardColor: 0x000000,
      helmetColor: 0x67e8f9,
      isHostile: false,
      weapon: 'shield_spear',
      accessories: { hasBraids: true },
      position: new THREE.Vector3(26, 3, -12),
      speechText: 'Keep your shield raised [Right Click] when raiders strike!',
    });
    this.npcs.push(ingrid);
  }

  /**
   * Spawn a horde of hostile Frostfang Vikings & Boss across the fjord
   */
  private spawnFrostRaiders() {
    // 1. EPIC RAID BOSS: Chieftain Ulfric Frost-Bane
    const ulfric = this.createHumanoidNPC({
      name: 'Chieftain Ulfric Frost-Bane',
      clan: 'Frostfang Clan',
      title: 'Warlord Boss',
      shirtColor: 0x1e3a8a, // Frost dark blue
      pantsColor: 0x0f172a,
      beardColor: 0x93c5fd, // Icy blue frosted beard
      helmetColor: 0x38bdf8, // Ice-forged Horned Crown
      isHostile: true,
      isBoss: true,
      weapon: 'dual_axes',
      accessories: { hasCrown: true, hasCape: true, isBoss: true },
      position: new THREE.Vector3(38, 3, 235),
      speechText: 'Fools of Katfjord! You dare step foot on Frostfang soil?! DIE!',
    });
    ulfric.health = 300;
    ulfric.maxHealth = 300;
    ulfric.patrolRadius = 18;
    this.npcs.push(ulfric);

    // 2. Frostfang Berserker Grom (Dual-axe savage)
    const grom = this.createHumanoidNPC({
      name: 'Berserker Grom',
      clan: 'Frostfang Clan',
      title: 'Blood Berserker',
      shirtColor: 0x312e81,
      pantsColor: 0x1e1b4b,
      beardColor: 0xf87171, // Wild red
      helmetColor: 0x1e293b,
      isHostile: true,
      weapon: 'dual_axes',
      position: new THREE.Vector3(26, 3, 238),
      speechText: 'BLOOD AND FROST! FOR ULFRIC!',
    });
    grom.health = 160;
    grom.maxHealth = 160;
    grom.patrolRadius = 16;
    this.npcs.push(grom);

    // 3. Frostfang Berserker Varg
    const varg = this.createHumanoidNPC({
      name: 'Berserker Varg',
      clan: 'Frostfang Clan',
      title: 'Frost Berserker',
      shirtColor: 0x1e3a8a,
      pantsColor: 0x172554,
      beardColor: 0xe2e8f0,
      helmetColor: 0x334155,
      isHostile: true,
      weapon: 'dual_axes',
      position: new THREE.Vector3(50, 3, 238),
      speechText: 'Your bones will freeze in the northern sea!',
    });
    varg.health = 150;
    varg.maxHealth = 150;
    varg.patrolRadius = 15;
    this.npcs.push(varg);

    // 4. Frostfang Shield-Breaker Thorolf
    const thorolf = this.createHumanoidNPC({
      name: 'Thorolf Shield-Breaker',
      clan: 'Frostfang Vanguard',
      title: 'Iron Vanguard',
      shirtColor: 0x374151,
      pantsColor: 0x111827,
      beardColor: 0x9ca3af,
      helmetColor: 0x4b5563,
      isHostile: true,
      weapon: 'shield_axe',
      position: new THREE.Vector3(34, 3, 222),
      speechText: 'Your puny shields will shatter before my axe!',
    });
    thorolf.health = 180;
    thorolf.maxHealth = 180;
    thorolf.patrolRadius = 14;
    this.npcs.push(thorolf);

    // 5. Frostfang Spearman Sven (Guards Relic Chest)
    const sven = this.createHumanoidNPC({
      name: 'Spearman Sven',
      clan: 'Frostfang Clan',
      title: 'Relic Guard',
      shirtColor: 0x1d4ed8,
      pantsColor: 0x1e293b,
      beardColor: 0xca8a04,
      helmetColor: 0x475569,
      isHostile: true,
      weapon: 'shield_spear',
      position: new THREE.Vector3(28, 3, 226),
      speechText: 'Hands off the Sacred Golden Relic!',
    });
    sven.health = 120;
    sven.maxHealth = 120;
    this.npcs.push(sven);

    // 6. Frostfang Scout Loki
    const loki = this.createHumanoidNPC({
      name: 'Scout Loki',
      clan: 'Frostfang Clan',
      title: 'Shadow Skirmisher',
      shirtColor: 0x0f766e,
      pantsColor: 0x134e4a,
      beardColor: 0x451a03,
      helmetColor: 0x115e59,
      isHostile: true,
      weapon: 'axe',
      position: new THREE.Vector3(56, 3, 218),
      speechText: 'Invaders spotted on the beach! Attack!',
    });
    loki.health = 110;
    loki.maxHealth = 110;
    this.npcs.push(loki);

    // 7-10. Coastal Raiders patrolling the Isle Outpost
    const raiderConfigs = [
      { name: 'Frostfang Raider I', pos: new THREE.Vector3(44, 3, 214), weapon: 'axe' as WeaponType },
      { name: 'Frostfang Raider II', pos: new THREE.Vector3(22, 3, 218), weapon: 'axe' as WeaponType },
      { name: 'Frostfang Raider III', pos: new THREE.Vector3(60, 3, 230), weapon: 'shield_axe' as WeaponType },
      { name: 'Frostfang Raider IV', pos: new THREE.Vector3(38, 3, 246), weapon: 'axe' as WeaponType },
      { name: 'Frostfang Watchman Kjell', pos: new THREE.Vector3(18, 3, 234), weapon: 'shield_spear' as WeaponType },
    ];

    raiderConfigs.forEach((cfg) => {
      const raider = this.createHumanoidNPC({
        name: cfg.name,
        clan: 'Frostfang Clan',
        title: 'Raider',
        shirtColor: 0x1e3a8a,
        pantsColor: 0x0f172a,
        beardColor: 0x64748b,
        helmetColor: 0x334155,
        isHostile: true,
        weapon: cfg.weapon,
        position: cfg.pos,
        speechText: 'Valhalla awaits! Strike them down!',
      });
      raider.patrolRadius = 12;
      raider.health = 100;
      raider.maxHealth = 100;
      this.npcs.push(raider);
    });
  }

  /**
   * Procedural humanoid creation with Roblox aesthetics and customized equipment
   */
  private createHumanoidNPC(config: {
    name: string;
    clan: string;
    title: string;
    shirtColor: number;
    pantsColor: number;
    beardColor: number;
    helmetColor: number;
    isHostile: boolean;
    isBoss?: boolean;
    weapon: WeaponType;
    accessories?: {
      hasCrown?: boolean;
      hasBraids?: boolean;
      hasCape?: boolean;
      isBoss?: boolean;
    };
    position: THREE.Vector3;
    speechText: string;
  }): VikingNPC {
    const group = new THREE.Group();
    const isBoss = !!config.accessories?.isBoss;
    // Scale Viking NPCs to classic Roblox minifigure scale (boss is slightly larger)
    const scale = isBoss ? 0.78 : 0.6;
    group.scale.set(scale, scale, scale);

    // Torso (Classic Roblox blocky chest)
    const torsoMat = new THREE.MeshStandardMaterial({
      color: config.shirtColor,
      roughness: 0.75,
    });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 1.3), torsoMat);
    torso.position.y = 3.4;
    torso.castShadow = true;
    torso.receiveShadow = true;
    group.add(torso);

    // Cape if chieftain / priest / boss
    if (config.accessories?.hasCape) {
      const capeMat = new THREE.MeshStandardMaterial({
        color: isBoss ? 0x991b1b : config.isHostile ? 0x1e3a8a : 0x7f1d1d,
        roughness: 0.9,
      });
      const cape = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3.4, 0.15), capeMat);
      cape.position.set(0, 3.2, -0.72);
      cape.rotation.x = -0.08;
      group.add(cape);
    }

    // Head (Cubic blocky head)
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), headMat);
    head.position.y = 5.6;
    head.castShadow = true;
    group.add(head);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.05), eyeMat);
    eyeL.position.set(-0.4, 0.1, 0.81);
    head.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.05), eyeMat);
    eyeR.position.set(0.4, 0.1, 0.81);
    head.add(eyeR);

    // Beard / Braids
    if (config.accessories?.hasBraids) {
      // Golden / auburn braids for shieldmaidens
      const hairMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.8 });
      [-0.6, 0.6].forEach((side) => {
        const braid = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.0, 0.35), hairMat);
        braid.position.set(side, -0.6, 0.45);
        head.add(braid);
      });
    } else if (config.beardColor !== 0x000000) {
      const beard = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 1.25, 0.45),
        new THREE.MeshStandardMaterial({ color: config.beardColor, roughness: 0.85 })
      );
      beard.position.set(0, -0.65, 0.75);
      head.add(beard);
    }

    // Helmet or Crown
    if (config.accessories?.hasCrown) {
      const crownMat = new THREE.MeshStandardMaterial({
        color: isBoss ? 0x38bdf8 : 0xfbbf24,
        metalness: 0.9,
        roughness: 0.2,
      });
      const crownBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 1.8), crownMat);
      crownBase.position.y = 0.65;
      head.add(crownBase);

      // Spikes
      [-0.7, 0, 0.7].forEach((x) => {
        const spike = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), crownMat);
        spike.position.set(x, 0.95, 0.8);
        head.add(spike);
      });
    } else {
      const helmet = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 0.9, 1.75),
        new THREE.MeshStandardMaterial({ color: config.helmetColor, metalness: 0.85, roughness: 0.3 })
      );
      helmet.position.y = 0.55;
      head.add(helmet);

      // Horns
      [-1.0, 1.0].forEach((side) => {
        const horn = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.9, 0.35),
          new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 })
        );
        horn.position.set(side, 0.8, 0);
        horn.rotation.z = -side * 0.5;
        helmet.add(horn);
      });
    }

    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: config.shirtColor, roughness: 0.75 });
    const leftArm = new THREE.Group();
    leftArm.position.set(-1.8, 4.6, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.7, 1.0), armMat);
    leftArmMesh.position.y = -1.2;
    leftArmMesh.castShadow = true;
    leftArm.add(leftArmMesh);
    group.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(1.8, 4.6, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.7, 1.0), armMat);
    rightArmMesh.position.y = -1.2;
    rightArmMesh.castShadow = true;
    rightArm.add(rightArmMesh);
    group.add(rightArm);

    // Equip Weapons & Items
    this.equipWeapon(config.weapon, rightArm, leftArm, isBoss);

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: config.pantsColor, roughness: 0.8 });
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.65, 2.2, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.8, 1.1), legMat);
    leftLegMesh.position.y = -1.2;
    leftLegMesh.castShadow = true;
    leftLeg.add(leftLegMesh);
    group.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.65, 2.2, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.8, 1.1), legMat);
    rightLegMesh.position.y = -1.2;
    rightLegMesh.castShadow = true;
    rightLeg.add(rightLegMesh);
    group.add(rightLeg);

    // Overhead Billboard Nameplate
    const nameplate = this.createNameplate(
      config.name,
      config.clan,
      config.title,
      config.isHostile,
      isBoss
    );
    group.add(nameplate.sprite);

    // Position in world (feet aligned cleanly with top of terrain blocks)
    group.position.set(
      config.position.x,
      config.position.y + (isBoss ? 0.31 : 0.24),
      config.position.z
    );
    this.scene.add(group);

    return {
      id: `npc_${Math.random().toString(36).substring(2, 9)}`,
      name: config.name,
      clan: config.clan,
      title: config.title,
      isHostile: config.isHostile,
      isBoss,
      health: 100,
      maxHealth: 100,
      mesh: group,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      head,
      patrolCenter: group.position.clone(),
      patrolRadius: 8,
      state: 'idle',
      attackCooldown: 0,
      speechText: config.speechText,
      nameplateSprite: nameplate.sprite,
      nameplateCanvas: nameplate.canvas,
      nameplateTexture: nameplate.texture,
      dialogueTimer: 0,
      originalScale: scale,
    };
  }

  /**
   * Equip character hands with tailored Viking items & weapons
   */
  private equipWeapon(type: WeaponType, rightArm: THREE.Group, leftArm: THREE.Group, isBoss: boolean) {
    if (type === 'axe' || type === 'dual_axes') {
      const haft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 3.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x57341b })
      );
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.0, 0.16),
        new THREE.MeshStandardMaterial({
          color: isBoss ? 0x7dd3fc : 0x94a3b8,
          metalness: 0.9,
          roughness: 0.2,
        })
      );
      blade.position.set(0.5, 1.1, 0);
      haft.add(blade);
      haft.position.set(0, -2.0, 0.4);
      rightArm.add(haft);

      if (type === 'dual_axes') {
        const leftHaft = haft.clone();
        leftHaft.position.set(0, -2.0, 0.4);
        leftArm.add(leftHaft);
      }
    } else if (type === 'hammer') {
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 2.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x57341b })
      );
      const hammerHead = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 })
      );
      hammerHead.position.set(0, 1.0, 0);
      handle.add(hammerHead);
      handle.position.set(0, -1.8, 0.4);
      rightArm.add(handle);
    } else if (type === 'shield_spear' || type === 'shield_axe') {
      // Spear or Axe in Right Hand
      if (type === 'shield_spear') {
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 4.4, 6),
          new THREE.MeshStandardMaterial({ color: 0x78350f })
        );
        const spearPoint = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.9, 5),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
        );
        spearPoint.position.y = 2.4;
        shaft.add(spearPoint);
        shaft.position.set(0, -1.8, 0.4);
        rightArm.add(shaft);
      } else {
        const haft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.12, 3.2, 6),
          new THREE.MeshStandardMaterial({ color: 0x57341b })
        );
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 0.9, 0.15),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
        );
        blade.position.set(0.5, 1.1, 0);
        haft.add(blade);
        haft.position.set(0, -2.0, 0.4);
        rightArm.add(haft);
      }

      // Round Viking Shield on Left Arm
      const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 0.2, 12),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 })
      );
      shield.rotation.x = Math.PI / 2;
      shield.position.set(-0.6, -1.2, 0.3);
      const boss = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
      );
      boss.position.y = 0.12;
      shield.add(boss);
      leftArm.add(shield);
    } else if (type === 'staff') {
      const staff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 4.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x3f2d1d })
      );
      const orb = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.35),
        new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          emissive: 0x9333ea,
          emissiveIntensity: 0.8,
        })
      );
      orb.position.y = 2.4;
      staff.add(orb);
      staff.position.set(0, -1.6, 0.4);
      rightArm.add(staff);
    } else if (type === 'tankard') {
      const tankard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      const froth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.2, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef08a })
      );
      froth.position.y = 0.4;
      tankard.add(froth);
      tankard.position.set(0, -1.4, 0.4);
      rightArm.add(tankard);
    } else if (type === 'bow') {
      const bow = new THREE.Mesh(
        new THREE.TorusGeometry(1.3, 0.08, 6, 12, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x57341b })
      );
      bow.rotation.z = Math.PI / 2;
      bow.position.set(0, -1.4, 0.3);
      leftArm.add(bow);
    }
  }

  /**
   * Update AI, behaviors, animations, and nameplates
   */
  public update(
    delta: number,
    playerPos: THREE.Vector3,
    onPlayerHit: (damage: number, isBoss: boolean, isSpecial: boolean) => void,
    onBossSpecial?: (boss: VikingNPC, type: 'shockwave') => void
  ) {
    this.npcs.forEach((npc) => {
      if (npc.state === 'dead') return;

      const distToPlayer = npc.mesh.position.distanceTo(playerPos);

      // Decrement speech dialogue bubble
      if (npc.dialogueTimer && npc.dialogueTimer > 0) {
        npc.dialogueTimer -= delta;
        if (npc.dialogueTimer <= 0) {
          this.refreshNameplate(npc, null);
        }
      }

      if (npc.isHostile) {
        npc.attackCooldown -= delta;

        // Boss special attack timer
        if (npc.isBoss) {
          if (npc.specialAttackTimer === undefined) npc.specialAttackTimer = 7.0;
          npc.specialAttackTimer -= delta;
        }

        const aggroDist = npc.isBoss ? (npc.isEnraged ? 36 : 28) : 18;

        if (distToPlayer < aggroDist) {
          // Check Boss Ground Stomp Special
          if (npc.isBoss && npc.specialAttackTimer !== undefined && npc.specialAttackTimer <= 0 && distToPlayer < 18 && !npc.isPerformingSpecial) {
            npc.isPerformingSpecial = true;
            npc.specialAttackTimer = npc.isEnraged ? 6.0 : 8.5;
            npc.state = 'attack';

            // Wind up pose: Raise both arms skyward
            npc.leftArm.rotation.x = -Math.PI / 1.1;
            npc.rightArm.rotation.x = -Math.PI / 1.1;
            npc.head.rotation.x = -0.3;
            this.speak(npc, npc.isEnraged ? 'FROST SHOCKWAVE!' : 'EARTH-SHATTERING STOMP!');
            sound.playAxeSwing();

            setTimeout(() => {
              if (npc.state !== 'dead') {
                npc.leftArm.rotation.x = Math.PI / 2.2;
                npc.rightArm.rotation.x = Math.PI / 2.2;
                npc.head.rotation.x = 0;
                sound.playBossStomp();
                onBossSpecial?.(npc, 'shockwave');
              }
              setTimeout(() => {
                npc.isPerformingSpecial = false;
              }, 400);
            }, 450);

            return;
          }

          if (npc.isPerformingSpecial) return;

          // Normal Attack or Chase
          npc.state = distToPlayer < (npc.isBoss ? 4.6 : 3.0) ? 'attack' : 'chase';

          // Turn toward player
          const dir = new THREE.Vector3().subVectors(playerPos, npc.mesh.position);
          dir.y = 0;
          dir.normalize();
          const targetAngle = Math.atan2(dir.x, dir.z);
          npc.mesh.rotation.y = THREE.MathUtils.lerp(npc.mesh.rotation.y, targetAngle, 8 * delta);

          if (npc.state === 'chase') {
            const runSpeed = npc.isBoss ? (npc.isEnraged ? 8.2 : 6.8) : 5.4;
            npc.mesh.position.addScaledVector(dir, runSpeed * delta);

            // Dynamic stride
            const stride = Math.sin(Date.now() * 0.012) * 0.65;
            npc.leftLeg.rotation.x = stride;
            npc.rightLeg.rotation.x = -stride;
            npc.leftArm.rotation.x = -stride;
            npc.rightArm.rotation.x = stride;
          } else if (npc.state === 'attack') {
            if (npc.attackCooldown <= 0) {
              npc.attackCooldown = npc.isBoss ? (npc.isEnraged ? 0.9 : 1.3) : 1.6;
              npc.rightArm.rotation.x = -Math.PI / 1.4;
              sound.playAxeSwing();

              setTimeout(() => {
                if (npc.state !== 'dead') {
                  npc.rightArm.rotation.x = Math.PI / 2.5;
                  const damage = npc.isBoss ? (npc.isEnraged ? 34 : 26) : 15;
                  onPlayerHit(damage, !!npc.isBoss, false);
                }
              }, 220);
            }
          }
        } else {
          // Return or wander near patrol center
          npc.state = 'idle';
          npc.leftLeg.rotation.x = 0;
          npc.rightLeg.rotation.x = 0;
          npc.leftArm.rotation.x = 0;
          npc.rightArm.rotation.x = 0;
        }
      } else {
        // Friendly NPC behavior
        if (npc.patrolWaypoints && npc.patrolWaypoints.length > 0) {
          // Patrol route between waypoints
          if (npc.currentWaypointIdx === undefined) npc.currentWaypointIdx = 0;
          const targetWp = npc.patrolWaypoints[npc.currentWaypointIdx];
          const distToWp = npc.mesh.position.distanceTo(targetWp);

          if (distToWp < 1.2) {
            npc.currentWaypointIdx = (npc.currentWaypointIdx + 1) % npc.patrolWaypoints.length;
          } else {
            const dir = new THREE.Vector3().subVectors(targetWp, npc.mesh.position);
            dir.y = 0;
            dir.normalize();
            npc.mesh.position.addScaledVector(dir, 2.6 * delta);

            const angle = Math.atan2(dir.x, dir.z);
            npc.mesh.rotation.y = THREE.MathUtils.lerp(npc.mesh.rotation.y, angle, 6 * delta);

            const stride = Math.sin(Date.now() * 0.007) * 0.45;
            npc.leftLeg.rotation.x = stride;
            npc.rightLeg.rotation.x = -stride;
            npc.leftArm.rotation.x = -stride;
            npc.rightArm.rotation.x = stride;
          }
        } else if (distToPlayer < 7.0) {
          // Turn to player and salute / nod
          const dir = new THREE.Vector3().subVectors(playerPos, npc.mesh.position);
          dir.y = 0;
          dir.normalize();
          const angle = Math.atan2(dir.x, dir.z);
          npc.mesh.rotation.y = THREE.MathUtils.lerp(npc.mesh.rotation.y, angle, 5 * delta);

          // Subtle breathing / idle motion
          const breath = Math.sin(Date.now() * 0.003) * 0.04;
          npc.rightArm.rotation.z = breath;
        }
      }
    });
  }

  /**
   * Trigger NPC speech popup in 3D overhead bubble
   */
  public speak(npc: VikingNPC, speech: string) {
    npc.dialogueTimer = 5.0; // Show for 5 seconds
    this.refreshNameplate(npc, speech);
  }

  /**
   * Update nameplate texture
   */
  private refreshNameplate(npc: VikingNPC, speech: string | null) {
    if (!npc.nameplateCanvas || !npc.nameplateTexture) return;
    const ctx = npc.nameplateCanvas.getContext('2d')!;
    const healthPct = Math.max(0, npc.health / npc.maxHealth);

    this.drawNameplateCanvas(
      ctx,
      npc.nameplateCanvas.width,
      npc.nameplateCanvas.height,
      npc.name,
      npc.clan,
      npc.title,
      healthPct,
      npc.isHostile,
      !!npc.isBoss,
      speech
    );
    npc.nameplateTexture.needsUpdate = true;
  }

  public damageNPC(npc: VikingNPC, amount: number): boolean {
    if (npc.state === 'dead') return false;
    npc.health = Math.max(0, npc.health - amount);
    sound.playHitImpact(false);

    // Boss Enrage Phase Trigger at 50% health
    if (npc.isBoss && !npc.isEnraged && npc.health > 0 && npc.health <= npc.maxHealth * 0.5) {
      npc.isEnraged = true;
      npc.bossPhase = 2;
      this.speak(npc, '❄️ FROST ENRAGED! TASTE THE BLIZZARD OF YMIR!');
      sound.playWarHorn();
    }

    // Refresh nameplate with updated health bar
    this.refreshNameplate(npc, null);

    // Hit flash reaction
    npc.mesh.position.y += 0.22;
    setTimeout(() => {
      npc.mesh.position.y -= 0.22;
    }, 100);

    if (npc.health <= 0) {
      npc.state = 'dead';
      npc.mesh.rotation.x = Math.PI / 2;
      npc.mesh.position.y = 3.3;
      sound.playFanfare();
      if (npc.nameplateSprite) {
        npc.nameplateSprite.visible = false;
      }
      return true; // NPC killed
    }
    return false;
  }
}
