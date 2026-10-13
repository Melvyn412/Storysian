import * as THREE from 'three';
import { sound } from '../audio/soundEngine';

export type FleetFormationType = 'wedge' | 'line' | 'convoy';

export interface FleetNPCData {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Mesh;
  role: 'helmsman' | 'leader' | 'rower' | 'berserker';
  baseY: number;
  initialArmRotX?: number;
  initialArmRotZ?: number;
}

export interface FleetBoatData {
  id: string;
  name: string;
  group: THREE.Group;
  hullMesh: THREE.Mesh;
  mastMesh: THREE.Mesh;
  sailMesh: THREE.Mesh;
  yardMesh: THREE.Mesh;
  prowMesh: THREE.Mesh;
  sternMesh: THREE.Mesh;
  brazierLight: THREE.PointLight;
  oars: { group: THREE.Group; side: 'port' | 'starboard'; baseAngle: number }[];
  npcs: FleetNPCData[];
  formationOffset: THREE.Vector3; // local offset relative to player ship
  worldPos: THREE.Vector3;
  worldRotY: number;
  pitch: number;
  roll: number;
  crestSprayTimer: number;
  speechBubble?: THREE.Sprite;
  speechCanvas?: HTMLCanvasElement;
  speechTexture?: THREE.CanvasTexture;
  speechTimer: number;
  clanColor: number;
  sailStripes: number;
}

const FLEET_CONFIGS = [
  {
    id: 'iron_raven',
    name: 'Járn Hrafn (Iron Raven)',
    color: 0x1c1917, // Iron dark wood
    trimColor: 0x991b1b, // Crimson
    sailColorA: 0xdc2626,
    sailColorB: 0x18181b,
    wedgeOffset: new THREE.Vector3(-34, 0, -10),
    lineOffset: new THREE.Vector3(-36, 0, 0),
    convoyOffset: new THREE.Vector3(0, 0, -38),
    leaderTitle: 'Port Guard Commander',
  },
  {
    id: 'sea_wolf',
    name: 'Sæ Úlfr (Sea Wolf)',
    color: 0x78350f, // Golden oak
    trimColor: 0xd97706, // Amber gold
    sailColorA: 0xf59e0b,
    sailColorB: 0x451a03,
    wedgeOffset: new THREE.Vector3(34, 0, -8),
    lineOffset: new THREE.Vector3(36, 0, 0),
    convoyOffset: new THREE.Vector3(0, 0, -76),
    leaderTitle: 'Starboard Berserker Lead',
  },
  {
    id: 'thunder_wyrm',
    name: 'Þrumu Dreki (Thunder Wyrm)',
    color: 0x1e293b, // Slate sea wood
    trimColor: 0x0284c7, // Storm cyan
    sailColorA: 0x38bdf8,
    sailColorB: 0x0f172a,
    wedgeOffset: new THREE.Vector3(-58, 0, 24),
    lineOffset: new THREE.Vector3(-72, 0, 0),
    convoyOffset: new THREE.Vector3(-18, 0, 32),
    leaderTitle: 'Vanguard Storm Scout',
  },
  {
    id: 'blood_eagle',
    name: 'Blóð Örn (Blood Eagle)',
    color: 0x451a03, // Deep mahogany
    trimColor: 0xb91c1c, // Blood crimson
    sailColorA: 0xef4444,
    sailColorB: 0xfafaf9,
    wedgeOffset: new THREE.Vector3(58, 0, 26),
    lineOffset: new THREE.Vector3(72, 0, 0),
    convoyOffset: new THREE.Vector3(18, 0, 32),
    leaderTitle: 'Vanguard Assault Chief',
  },
  {
    id: 'valhalla_guard',
    name: 'Valhöll Vörðr (Valhalla Guard)',
    color: 0x27272a, // Deep slate
    trimColor: 0x15803d, // Emerald Valknut
    sailColorA: 0x22c55e,
    sailColorB: 0x064e3b,
    wedgeOffset: new THREE.Vector3(-78, 0, -36),
    lineOffset: new THREE.Vector3(-108, 0, 0),
    convoyOffset: new THREE.Vector3(0, 0, -114),
    leaderTitle: 'Rearguard Hornblower',
  },
  {
    id: 'aegir_wrath',
    name: "Ægir's Heift (Aegir's Wrath)",
    color: 0x0f172a, // Deep oceanic navy
    trimColor: 0x0d9488, // Sea teal
    sailColorA: 0x14b8a6,
    sailColorB: 0x042f2e,
    wedgeOffset: new THREE.Vector3(78, 0, -34),
    lineOffset: new THREE.Vector3(108, 0, 0),
    convoyOffset: new THREE.Vector3(0, 0, -152),
    leaderTitle: 'Heavy Drakkar Captain',
  },
];

const BATTLE_SHOUTS = [
  'HEAVE FOR VALHALLA!',
  "THOR'S TEMPEST FEEDS OUR BLADES!",
  'HOLD FAST TO THE GUNWALES!',
  'SHIELDS UP! ROUGH SWELL TO PORT!',
  'CRUSH THE FROSTFANG CITADEL!',
  'THE GODS FAVOR OUR INVASION!',
  'BLOW THE HORNS FOR KATFJORD!',
  'ROW, SHIELD-BROTHERS! SKOL!',
];

export class VikingFleetManager {
  private scene: THREE.Scene;
  private getWaterHeight: (x: number, z: number, t?: number) => number;
  private spawnSeaSpray?: (pos: THREE.Vector3, intensity: number) => void;
  public boats: FleetBoatData[] = [];
  public currentFormation: FleetFormationType = 'wedge';
  private shoutIntervalTimer: number = 6.0;
  public isFleetActive: boolean = true;

  constructor(
    scene: THREE.Scene,
    getWaterHeight: (x: number, z: number, t?: number) => number,
    spawnSeaSpray?: (pos: THREE.Vector3, intensity: number) => void
  ) {
    this.scene = scene;
    this.getWaterHeight = getWaterHeight;
    this.spawnSeaSpray = spawnSeaSpray;
    this.buildFleetArmada();
  }

  /**
   * Assemble the 6 Drakkar Warships with detailed hulls, oars, sails, braziers, and 24 NPC Vikings
   */
  private buildFleetArmada() {
    FLEET_CONFIGS.forEach((cfg, idx) => {
      const boatGroup = new THREE.Group();
      // Initial docked / offshore harbor anchor position (near Katfjord bay before sail)
      const initialAnchorPos = new THREE.Vector3(
        22 + cfg.wedgeOffset.x,
        0,
        95 + cfg.wedgeOffset.z
      );
      boatGroup.position.copy(initialAnchorPos);

      // 1. Longship Wooden Hull (Sturdy clinker-built Norse warship)
      const hullMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.82,
        metalness: 0.1,
      });
      const trimMat = new THREE.MeshStandardMaterial({
        color: cfg.trimColor,
        roughness: 0.75,
      });

      // Main Hull Box
      const hull = new THREE.Mesh(new THREE.BoxGeometry(8.2, 4.0, 29), hullMat);
      hull.position.set(0, 2.0, 0);
      hull.castShadow = true;
      hull.receiveShadow = true;
      boatGroup.add(hull);

      // Dragon Prow (Front Stem)
      const prow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 8.2, 2.6), trimMat);
      prow.position.set(0, 5.5, 15.2);
      prow.rotation.x = Math.PI / 8;
      prow.castShadow = true;
      boatGroup.add(prow);

      // Dragon Head Carving atop Prow
      const headCarving = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.8, 2.4),
        new THREE.MeshStandardMaterial({ color: cfg.trimColor, metalness: 0.5, roughness: 0.4 })
      );
      headCarving.position.set(0, 8.8, 17.0);
      boatGroup.add(headCarving);

      // Dragon Tail (Stern)
      const stern = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.2, 2.2), trimMat);
      stern.position.set(0, 4.5, -15.0);
      stern.rotation.x = -Math.PI / 8;
      stern.castShadow = true;
      boatGroup.add(stern);

      // Deck Plank overlay
      const deckMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });
      const deck = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.4, 26), deckMat);
      deck.position.set(0, 3.8, 0);
      boatGroup.add(deck);

      // Mast
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x2e1d11, roughness: 0.85 });
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 21, 6), mastMat);
      mast.position.set(0, 11, 0);
      mast.castShadow = true;
      boatGroup.add(mast);

      // Sail Yard
      const yardMat = new THREE.MeshStandardMaterial({ color: 0x45220d });
      const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 19, 6), yardMat);
      yard.position.set(0, 18.5, 0.3);
      yard.rotation.z = Math.PI / 2;
      boatGroup.add(yard);

      // Striped Canvas Sail
      const sailMat = new THREE.MeshStandardMaterial({
        color: cfg.sailColorA,
        roughness: 0.9,
        side: THREE.DoubleSide,
      });
      const sail = new THREE.Mesh(new THREE.BoxGeometry(17, 12, 0.15), sailMat);
      sail.position.set(0, 12.5, 0.5);
      boatGroup.add(sail);

      // Sail Striping overlay
      const stripeMat = new THREE.MeshStandardMaterial({
        color: cfg.sailColorB,
        roughness: 0.9,
        side: THREE.DoubleSide,
      });
      [-5.5, 0, 5.5].forEach((sx) => {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.6, 11.9, 0.18), stripeMat);
        stripe.position.set(sx, 12.5, 0.51);
        boatGroup.add(stripe);
      });

      // Masthead War Pennant
      const pennantMat = new THREE.MeshStandardMaterial({
        color: cfg.trimColor,
        side: THREE.DoubleSide,
      });
      const pennant = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.6), pennantMat);
      pennant.position.set(0, 21.8, 1.4);
      pennant.rotation.y = Math.PI / 2;
      boatGroup.add(pennant);

      // Gunwale Round Shields along Port & Starboard (6 per side)
      const shieldMatA = new THREE.MeshStandardMaterial({ color: cfg.sailColorA, roughness: 0.6 });
      const shieldMatB = new THREE.MeshStandardMaterial({ color: cfg.sailColorB, roughness: 0.6 });
      const shieldBossMat = new THREE.MeshStandardMaterial({
        color: 0xd4d4d8,
        metalness: 0.8,
        roughness: 0.2,
      });

      for (let s = 0; s < 6; s++) {
        const sz = -10 + s * 4.0;
        [-3.9, 3.9].forEach((sx) => {
          const sGroup = new THREE.Group();
          sGroup.position.set(sx, 4.1, sz);
          const mat = s % 2 === 0 ? shieldMatA : shieldMatB;

          const shieldRim = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.12, 12), mat);
          shieldRim.rotation.z = Math.PI / 2;
          sGroup.add(shieldRim);

          const boss = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 8, 8),
            shieldBossMat
          );
          boss.position.set(sx > 0 ? 0.08 : -0.08, 0, 0);
          sGroup.add(boss);

          boatGroup.add(sGroup);
        });
      }

      // Animated Rowing Oars (2 port, 2 starboard)
      const oars: { group: THREE.Group; side: 'port' | 'starboard'; baseAngle: number }[] = [];
      const oarMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.8 });

      [-5, 5].forEach((oz) => {
        // Port oar
        const oarPortGroup = new THREE.Group();
        oarPortGroup.position.set(-3.8, 3.6, oz);
        const oarShaftP = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 11, 6), oarMat);
        oarShaftP.position.set(-3.2, -2.4, 0);
        oarShaftP.rotation.z = 0.72; // Angled down into water
        oarPortGroup.add(oarShaftP);
        // Oar Blade
        const bladeP = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.2, 0.1), oarMat);
        bladeP.position.set(-5.6, -4.6, 0);
        bladeP.rotation.z = 0.72;
        oarPortGroup.add(bladeP);
        boatGroup.add(oarPortGroup);
        oars.push({ group: oarPortGroup, side: 'port', baseAngle: 0.72 });

        // Starboard oar
        const oarStarGroup = new THREE.Group();
        oarStarGroup.position.set(3.8, 3.6, oz);
        const oarShaftS = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 11, 6), oarMat);
        oarShaftS.position.set(3.2, -2.4, 0);
        oarShaftS.rotation.z = -0.72;
        oarStarGroup.add(oarShaftS);
        // Oar Blade
        const bladeS = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.2, 0.1), oarMat);
        bladeS.position.set(5.6, -4.6, 0);
        bladeS.rotation.z = -0.72;
        oarStarGroup.add(bladeS);
        boatGroup.add(oarStarGroup);
        oars.push({ group: oarStarGroup, side: 'starboard', baseAngle: -0.72 });
      });

      // Fiery Iron Brazier Lantern at Prow
      const brazierMount = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.55, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.85 })
      );
      brazierMount.position.set(0, 4.6, 13.8);
      boatGroup.add(brazierMount);

      const brazierFire = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 1),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      brazierFire.position.set(0, 5.4, 13.8);
      boatGroup.add(brazierFire);

      const brazierLight = new THREE.PointLight(0xf59e0b, 1.8, 22);
      brazierLight.position.set(0, 5.6, 13.8);
      boatGroup.add(brazierLight);

      // Steering Rudder / Steering Oar at Stern
      const rudderGroup = new THREE.Group();
      rudderGroup.position.set(3.6, 2.8, -12.5);
      const rudderBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 5.5, 1.6),
        new THREE.MeshStandardMaterial({ color: 0x3d2817 })
      );
      rudderBlade.position.set(0, -1.8, 0);
      rudderGroup.add(rudderBlade);
      boatGroup.add(rudderGroup);

      // ==============================================================
      // 4 ANIMATED NPC VIKINGS ON BOARD EACH BOAT
      // ==============================================================
      const npcs: FleetNPCData[] = [];

      // NPC 1: Helmsman at Stern (Controls the steering rudder)
      const helmsman = this.createDeckNPC({
        name: `Helmsman of ${cfg.name}`,
        shirtColor: cfg.trimColor,
        pantsColor: 0x1f2937,
        helmetColor: 0x475569,
        role: 'helmsman',
        position: new THREE.Vector3(1.6, 4.0, -11.0),
      });
      boatGroup.add(helmsman.group);
      npcs.push(helmsman);

      // NPC 2: War Leader / Lookout at Bow Dragon Prow (Points spear/axe toward fortress)
      const leader = this.createDeckNPC({
        name: `${cfg.leaderTitle}`,
        shirtColor: cfg.sailColorA,
        pantsColor: 0x292524,
        helmetColor: 0xd97706, // Gilded helmet
        hasCrown: true,
        hasCape: true,
        role: 'leader',
        position: new THREE.Vector3(0, 4.0, 11.5),
      });
      boatGroup.add(leader.group);
      npcs.push(leader);

      // NPC 3: Port Shield Rower (Rowing cadence)
      const portRower = this.createDeckNPC({
        name: 'Katfjord Shield-Brother',
        shirtColor: 0x334155,
        pantsColor: 0x111827,
        helmetColor: 0x64748b,
        role: 'rower',
        position: new THREE.Vector3(-2.2, 4.0, -2.0),
      });
      boatGroup.add(portRower.group);
      npcs.push(portRower);

      // NPC 4: Starboard Berserker (Raises axe & shield in war defiance)
      const stbdBerserker = this.createDeckNPC({
        name: 'Katfjord Berserker',
        shirtColor: cfg.sailColorB,
        pantsColor: 0x18181b,
        helmetColor: 0x71717a,
        role: 'berserker',
        position: new THREE.Vector3(2.2, 4.0, 2.0),
      });
      boatGroup.add(stbdBerserker.group);
      npcs.push(stbdBerserker);

      // Speech bubble sprite for battle cries
      const { sprite: speechBubble, canvas: speechCanvas, texture: speechTexture } =
        this.createSpeechBubbleCanvas();
      speechBubble.position.set(0, 10.5, 10.5);
      speechBubble.visible = false;
      boatGroup.add(speechBubble);

      this.scene.add(boatGroup);

      this.boats.push({
        id: cfg.id,
        name: cfg.name,
        group: boatGroup,
        hullMesh: hull,
        mastMesh: mast,
        sailMesh: sail,
        yardMesh: yard,
        prowMesh: prow,
        sternMesh: stern,
        brazierLight,
        oars,
        npcs,
        formationOffset: cfg.wedgeOffset.clone(),
        worldPos: initialAnchorPos.clone(),
        worldRotY: 0,
        pitch: 0,
        roll: 0,
        crestSprayTimer: 0,
        speechBubble,
        speechCanvas,
        speechTexture,
        speechTimer: 0,
        clanColor: cfg.trimColor,
        sailStripes: idx,
      });
    });
  }

  /**
   * Procedural Roblox-aesthetic blocky NPC for longship deck
   */
  private createDeckNPC(config: {
    name: string;
    shirtColor: number;
    pantsColor: number;
    helmetColor: number;
    hasCrown?: boolean;
    hasCape?: boolean;
    role: 'helmsman' | 'leader' | 'rower' | 'berserker';
    position: THREE.Vector3;
  }): FleetNPCData {
    const group = new THREE.Group();
    const scale = 0.55;
    group.scale.set(scale, scale, scale);
    group.position.copy(config.position);

    // Torso (Blocky Roblox chest)
    const torsoMat = new THREE.MeshStandardMaterial({ color: config.shirtColor, roughness: 0.75 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 1.3), torsoMat);
    torso.position.y = 3.4;
    group.add(torso);

    if (config.hasCape) {
      const capeMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.9 });
      const cape = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3.2, 0.15), capeMat);
      cape.position.set(0, 3.2, -0.72);
      cape.rotation.x = -0.1;
      group.add(cape);
    }

    // Head
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), headMat);
    head.position.y = 5.6;
    group.add(head);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.05), eyeMat);
    eyeL.position.set(-0.38, 0.1, 0.81);
    head.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.05), eyeMat);
    eyeR.position.set(0.38, 0.1, 0.81);
    head.add(eyeR);

    // Beard
    const beard = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 1.2, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.85 })
    );
    beard.position.set(0, -0.65, 0.75);
    head.add(beard);

    // Helmet
    const helmet = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.9, 1.75),
      new THREE.MeshStandardMaterial({ color: config.helmetColor, metalness: 0.7, roughness: 0.3 })
    );
    helmet.position.y = 0.55;
    head.add(helmet);

    // Horns on helmet
    [-1.0, 1.0].forEach((side) => {
      const horn = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.8, 0.35),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7 })
      );
      horn.position.set(side, 0.75, 0);
      horn.rotation.z = -side * 0.45;
      helmet.add(horn);
    });

    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: config.shirtColor, roughness: 0.75 });

    const leftArm = new THREE.Group();
    leftArm.position.set(-1.8, 4.6, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.7, 1.0), armMat);
    leftArmMesh.position.y = -1.2;
    leftArm.add(leftArmMesh);
    group.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(1.8, 4.6, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.7, 1.0), armMat);
    rightArmMesh.position.y = -1.2;
    rightArm.add(rightArmMesh);
    group.add(rightArm);

    // Equip weapons & tools based on role
    if (config.role === 'leader') {
      // Spear raised high
      const spearMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const spearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.5, 6), spearMat);
      spearShaft.position.set(0, 0.8, 0.6);
      spearShaft.rotation.x = Math.PI / 4;
      rightArm.add(spearShaft);
      // Spear tip
      const tipMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 4), tipMat);
      tip.position.set(0, 2.8, 2.6);
      tip.rotation.x = Math.PI / 4;
      rightArm.add(tip);
      // Shield in left hand
      const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.3, 0.18, 12),
        new THREE.MeshStandardMaterial({ color: config.shirtColor })
      );
      shield.rotation.z = Math.PI / 2;
      shield.position.set(-0.6, -1.2, 0.6);
      leftArm.add(shield);
    } else if (config.role === 'berserker') {
      // Twin Bearded War Axes
      [-1, 1].forEach((hand) => {
        const arm = hand === 1 ? rightArm : leftArm;
        const axeHandle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 3.2, 6),
          new THREE.MeshStandardMaterial({ color: 0x451a03 })
        );
        axeHandle.position.set(0, -0.6, 0.5);
        axeHandle.rotation.x = Math.PI / 6;
        arm.add(axeHandle);
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1.1, 0.8),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
        );
        blade.position.set(0, 0.6, 0.8);
        arm.add(blade);
      });
    }

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: config.pantsColor, roughness: 0.8 });
    [-0.65, 0.65].forEach((lx) => {
      const leg = new THREE.Group();
      leg.position.set(lx, 2.2, 0);
      const legMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.8, 1.1), legMat);
      legMesh.position.y = -1.2;
      leg.add(legMesh);
      group.add(leg);
    });

    return {
      group,
      leftArm,
      rightArm,
      head,
      role: config.role,
      baseY: config.position.y,
    };
  }

  /**
   * Create billboard cartoon chat bubble canvas
   */
  private createSpeechBubbleCanvas(): {
    sprite: THREE.Sprite;
    canvas: HTMLCanvasElement;
    texture: THREE.CanvasTexture;
  } {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 128;
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(7.5, 2.5, 1.0);
    return { sprite, canvas, texture };
  }

  /**
   * Draw speech text onto speech bubble canvas
   */
  private drawSpeech(canvas: HTMLCanvasElement, text: string) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Rounded bubble
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.beginPath();
    ctx.roundRect(10, 8, w - 20, 80, 16);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Downward tail
    ctx.beginPath();
    ctx.moveTo(w / 2 - 14, 88);
    ctx.lineTo(w / 2, 108);
    ctx.lineTo(w / 2 + 14, 88);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fill();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, w / 2, 54);
  }

  /**
   * Set fleet formation geometry
   */
  public setFormation(formation: FleetFormationType) {
    this.currentFormation = formation;
    FLEET_CONFIGS.forEach((cfg) => {
      const boat = this.boats.find((b) => b.id === cfg.id);
      if (!boat) return;
      if (formation === 'wedge') boat.formationOffset.copy(cfg.wedgeOffset);
      else if (formation === 'line') boat.formationOffset.copy(cfg.lineOffset);
      else if (formation === 'convoy') boat.formationOffset.copy(cfg.convoyOffset);
    });
  }

  /**
   * Trigger fleet-wide war horn & cheer
   */
  public rallyFleetHorn() {
    sound.playWarHorn();
    this.boats.forEach((boat, i) => {
      const shout = BATTLE_SHOUTS[i % BATTLE_SHOUTS.length];
      this.triggerBoatShout(boat, shout, 5.0);

      // Animate arms raised high
      boat.npcs.forEach((npc) => {
        npc.rightArm.rotation.x = -Math.PI * 0.85;
        npc.leftArm.rotation.x = -Math.PI * 0.85;
      });
    });
  }

  /**
   * Trigger single boat speech bubble
   */
  public triggerBoatShout(boat: FleetBoatData, text: string, duration: number = 4.0) {
    if (!boat.speechBubble || !boat.speechCanvas || !boat.speechTexture) return;
    this.drawSpeech(boat.speechCanvas, text);
    boat.speechTexture.needsUpdate = true;
    boat.speechBubble.visible = true;
    boat.speechTimer = duration;
  }

  /**
   * Main per-frame update loop:
   * Hydrodynamic wave physics, formation following, oar strokes, NPC crew animations, sea spray
   */
  public update(
    delta: number,
    elapsed: number,
    flagshipPos: THREE.Vector3,
    flagshipRotY: number,
    flagshipSpeed: number,
    isShipMounted: boolean,
    weather: string
  ) {
    if (!this.isFleetActive) return;

    const isStormy = weather === 'stormy';

    // 1. Periodic ambient battle shouts during Thor's Tempest
    if (isStormy && isShipMounted) {
      this.shoutIntervalTimer -= delta;
      if (this.shoutIntervalTimer <= 0) {
        this.shoutIntervalTimer = 10.0 + Math.random() * 8.0;
        const randomBoat = this.boats[Math.floor(Math.random() * this.boats.length)];
        const shout = BATTLE_SHOUTS[Math.floor(Math.random() * BATTLE_SHOUTS.length)];
        this.triggerBoatShout(randomBoat, shout, 4.5);
      }
    }

    // Flagship orientation vectors
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), flagshipRotY);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), flagshipRotY);

    this.boats.forEach((boat, bIdx) => {
      // ==============================================================
      // FORMATION POSITION FOLLOWING
      // ==============================================================
      if (isShipMounted) {
        // Calculate target position in world coordinates relative to moving flagship
        const targetX =
          flagshipPos.x +
          right.x * boat.formationOffset.x +
          forward.x * boat.formationOffset.z;
        const targetZ =
          flagshipPos.z +
          right.z * boat.formationOffset.x +
          forward.z * boat.formationOffset.z;

        // Smooth nautical follow
        const followSpeed = 3.5 + Math.min(8.0, Math.abs(flagshipSpeed) * 0.4);
        boat.worldPos.x = THREE.MathUtils.lerp(boat.worldPos.x, targetX, delta * followSpeed);
        boat.worldPos.z = THREE.MathUtils.lerp(boat.worldPos.z, targetZ, delta * followSpeed);

        // Heading aligns with flagship rotation with slight organic wave drift
        const waveYawOffset = Math.sin(elapsed * 1.5 + bIdx * 1.2) * 0.04;
        boat.worldRotY = THREE.MathUtils.lerp(
          boat.worldRotY,
          flagshipRotY + waveYawOffset,
          delta * 3.0
        );
      } else {
        // When not sailing, gentle anchored harbor sway near Katfjord Pier
        const anchorX = 22 + boat.formationOffset.x;
        const anchorZ = 95 + boat.formationOffset.z;
        boat.worldPos.x = THREE.MathUtils.lerp(boat.worldPos.x, anchorX, delta * 2.0);
        boat.worldPos.z = THREE.MathUtils.lerp(boat.worldPos.z, anchorZ, delta * 2.0);
        boat.worldRotY = THREE.MathUtils.lerp(boat.worldRotY, 0, delta * 2.0);
      }

      // ==============================================================
      // THOR'S TEMPEST HYDRODYNAMIC WAVE BUOYANCY (HEAVE, PITCH, ROLL)
      // ==============================================================
      const boatForward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        boat.worldRotY
      );
      const boatRight = new THREE.Vector3(1, 0, 0).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        boat.worldRotY
      );

      const bowPos = boat.worldPos.clone().addScaledVector(boatForward, 13.5);
      const sternPos = boat.worldPos.clone().addScaledVector(boatForward, -13.5);
      const portPos = boat.worldPos.clone().addScaledVector(boatRight, -4.0);
      const starPos = boat.worldPos.clone().addScaledVector(boatRight, 4.0);

      const centerH = this.getWaterHeight(boat.worldPos.x, boat.worldPos.z, elapsed);
      const bowH = this.getWaterHeight(bowPos.x, bowPos.z, elapsed);
      const sternH = this.getWaterHeight(sternPos.x, sternPos.z, elapsed);
      const portH = this.getWaterHeight(portPos.x, portPos.z, elapsed);
      const starH = this.getWaterHeight(starPos.x, starPos.z, elapsed);

      // Heave (Elevation with nautical draft offset 1.2m)
      const targetY = centerH + 1.2;
      const heaveRate = isStormy ? 7.2 : 3.8;
      boat.worldPos.y = THREE.MathUtils.lerp(boat.worldPos.y, targetY, delta * heaveRate);

      // Pitch (bow vs stern over 27m hull)
      const targetPitch = Math.atan2(bowH - sternH, 27);
      // Roll (port vs starboard over 8m beam)
      const targetRoll = Math.atan2(portH - starH, 8);

      const rotRate = isStormy ? 7.8 : 4.2;
      boat.pitch = THREE.MathUtils.lerp(boat.pitch, targetPitch, delta * rotRate);
      boat.roll = THREE.MathUtils.lerp(boat.roll, targetRoll, delta * rotRate);

      // Apply transformations to Group
      boat.group.position.copy(boat.worldPos);
      boat.group.rotation.set(boat.pitch, boat.worldRotY, boat.roll);

      // ==============================================================
      // BOW SEA SPRAY IN THOR'S TEMPEST
      // ==============================================================
      if ((isStormy || Math.abs(flagshipSpeed) > 4) && this.spawnSeaSpray) {
        boat.crestSprayTimer += delta;
        if (boat.crestSprayTimer > 0.35 + Math.random() * 0.25) {
          boat.crestSprayTimer = 0;
          this.spawnSeaSpray(bowPos, isStormy ? 1.0 : 0.4);
        }
      }

      // Brazier light flicker
      boat.brazierLight.intensity = 1.6 + Math.sin(elapsed * 8 + bIdx * 2.1) * 0.4;

      // ==============================================================
      // ANIMATED ROWING OARS
      // ==============================================================
      const strokeFreq = isShipMounted ? 2.4 : 1.2;
      const strokeAngle = Math.sin(elapsed * strokeFreq + bIdx * 0.7) * 0.35;
      const verticalDip = Math.cos(elapsed * strokeFreq + bIdx * 0.7) * 0.15;

      boat.oars.forEach((oar) => {
        if (oar.side === 'port') {
          oar.group.rotation.y = strokeAngle;
          oar.group.rotation.z = oar.baseAngle + verticalDip;
        } else {
          oar.group.rotation.y = -strokeAngle;
          oar.group.rotation.z = oar.baseAngle - verticalDip;
        }
      });

      // ==============================================================
      // NPC CREW ANIMATIONS (Swaying, Rowing, Cheering)
      // ==============================================================
      boat.npcs.forEach((npc) => {
        if (npc.role === 'rower') {
          // Rowers rock back and forth in sync with oars
          const lean = Math.sin(elapsed * strokeFreq + bIdx * 0.7) * 0.35;
          npc.group.rotation.x = lean;
        } else if (npc.role === 'helmsman') {
          // Steering tiller sway
          const tillerSway = Math.sin(elapsed * 1.8 + bIdx) * 0.18;
          npc.group.rotation.y = tillerSway;
          npc.rightArm.rotation.x = -0.4 + Math.sin(elapsed * 1.5) * 0.1;
        } else if (npc.role === 'leader') {
          // Lookout pointing / rallying
          const pointCycle = Math.sin(elapsed * 1.6 + bIdx);
          npc.rightArm.rotation.x = -Math.PI * 0.45 + pointCycle * 0.18;
          npc.head.rotation.y = Math.sin(elapsed * 0.8) * 0.25;
        } else if (npc.role === 'berserker') {
          // Berserker war cry pump
          const warCry = Math.sin(elapsed * 3.2 + bIdx);
          npc.rightArm.rotation.x = -Math.PI * 0.6 + warCry * 0.3;
          npc.leftArm.rotation.x = -Math.PI * 0.5 - warCry * 0.3;
        }
      });

      // ==============================================================
      // SPEECH BUBBLE TIMER
      // ==============================================================
      if (boat.speechTimer > 0) {
        boat.speechTimer -= delta;
        if (boat.speechTimer <= 0 && boat.speechBubble) {
          boat.speechBubble.visible = false;
        }
      }
    });
  }

  /**
   * Cleanup Three.js resources
   */
  public dispose() {
    this.boats.forEach((boat) => {
      this.scene.remove(boat.group);
      if (boat.speechTexture) boat.speechTexture.dispose();
    });
    this.boats = [];
  }
}
