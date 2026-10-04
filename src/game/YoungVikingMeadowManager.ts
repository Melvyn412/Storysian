import * as THREE from 'three';
import { MeadowGatherNode, MeadowItemCategory } from '../types';
import { CharacterController } from './CharacterController';

interface MeadowNodeInstance {
  data: MeadowGatherNode;
  group: THREE.Group;
  itemMesh: THREE.Object3D;
  ringMesh: THREE.Mesh;
  labelSprite: THREE.Sprite;
}

interface WanderingYoungNpc {
  name: string;
  title: string;
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  targetNodeIndex: number;
  walkTime: number;
  gatherPauseTimer: number;
  labelSprite: THREE.Sprite;
  labelCanvas: HTMLCanvasElement;
  labelTexture: THREE.CanvasTexture;
  currentStatus: string;
}

export const MEADOW_CENTER = { x: 135, z: -135 };
export const KATFJORD_MEADOW_ARCHWAY = { x: 28, z: 16 };
export const MEADOW_RETURN_ARCHWAY = { x: 135, z: -107 };
export const MEADOW_CAMPFIRE_POS = { x: 135, z: -153 };

export const INITIAL_MEADOW_NODES: MeadowGatherNode[] = [
  {
    id: 'node_berries_1',
    category: 'berries',
    name: 'Wild Fjord Berries',
    x: 123,
    z: -124,
    silverReward: 35,
    xpReward: 25,
    valorReward: 10,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_mushrooms_1',
    category: 'mushrooms',
    name: 'Glowing Moon-Mushrooms',
    x: 116,
    z: -136,
    silverReward: 45,
    xpReward: 35,
    valorReward: 15,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_honeycomb_1',
    category: 'honeycomb',
    name: 'Golden Mead Honeycomb',
    x: 121,
    z: -148,
    silverReward: 55,
    xpReward: 40,
    valorReward: 18,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_amber_1',
    category: 'amber',
    name: 'Baltic Sea Amber',
    x: 131,
    z: -131,
    silverReward: 65,
    xpReward: 45,
    valorReward: 22,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_herbs_1',
    category: 'herbs',
    name: "Freya's Healing Herbs",
    x: 147,
    z: -123,
    silverReward: 40,
    xpReward: 30,
    valorReward: 12,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_apples_1',
    category: 'golden_apples',
    name: "Idunn's Golden Apple",
    x: 154,
    z: -137,
    silverReward: 85,
    xpReward: 60,
    valorReward: 30,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_runestones_1',
    category: 'runestones',
    name: 'Ancient Mini Runestone',
    x: 148,
    z: -150,
    silverReward: 70,
    xpReward: 50,
    valorReward: 25,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_driftwood_1',
    category: 'driftwood',
    name: 'Elder Birch Driftwood',
    x: 138,
    z: -118,
    silverReward: 38,
    xpReward: 28,
    valorReward: 12,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_berries_2',
    category: 'berries',
    name: 'Sweet Sun-Berries',
    x: 155,
    z: -126,
    silverReward: 35,
    xpReward: 25,
    valorReward: 10,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_mushrooms_2',
    category: 'mushrooms',
    name: 'Starlight Shroom Patch',
    x: 114,
    z: -120,
    silverReward: 45,
    xpReward: 35,
    valorReward: 15,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_herbs_2',
    category: 'herbs',
    name: 'Nordic Mint & Sage',
    x: 126,
    z: -141,
    silverReward: 40,
    xpReward: 30,
    valorReward: 12,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_amber_2',
    category: 'amber',
    name: 'Sunstone Amber Shard',
    x: 141,
    z: -139,
    silverReward: 65,
    xpReward: 45,
    valorReward: 22,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_apples_2',
    category: 'golden_apples',
    name: "Idunn's Orchard Apple",
    x: 115,
    z: -152,
    silverReward: 85,
    xpReward: 60,
    valorReward: 30,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_honeycomb_2',
    category: 'honeycomb',
    name: 'Wild Clover Honeycomb',
    x: 156,
    z: -146,
    silverReward: 55,
    xpReward: 40,
    valorReward: 18,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_runestones_2',
    category: 'runestones',
    name: 'Glowing Fjord Pebble',
    x: 129,
    z: -115,
    silverReward: 70,
    xpReward: 50,
    valorReward: 25,
    isAvailable: true,
    respawnAt: 0,
  },
  {
    id: 'node_driftwood_2',
    category: 'driftwood',
    name: 'Carved Pine Branch',
    x: 144,
    z: -130,
    silverReward: 38,
    xpReward: 28,
    valorReward: 12,
    isAvailable: true,
    respawnAt: 0,
  },
];

export class YoungVikingMeadowManager {
  private scene: THREE.Scene;
  private meadowGroup: THREE.Group;
  private nodeInstances: MeadowNodeInstance[] = [];
  private wanderingNpcs: WanderingYoungNpc[] = [];
  private portalRings: THREE.Mesh[] = [];
  private campfireFlame: THREE.Mesh | null = null;
  private currentTargetNodeId: string | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.meadowGroup = new THREE.Group();
    this.scene.add(this.meadowGroup);

    this.buildKatfjordEntranceArchway();
    this.buildGoldenMeadowSanctuary();
    this.buildGatherNodes();
    this.buildWanderingYoungVikings();
  }

  private buildKatfjordEntranceArchway() {
    const archGroup = new THREE.Group();
    archGroup.position.set(KATFJORD_MEADOW_ARCHWAY.x, 3.0, KATFJORD_MEADOW_ARCHWAY.z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.4,
    });

    const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 6.2, 8), woodMat);
    leftPost.position.set(-2.4, 3.1, 0);
    archGroup.add(leftPost);

    const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 6.2, 8), woodMat);
    rightPost.position.set(2.4, 3.1, 0);
    archGroup.add(rightPost);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.8, 1.0), woodMat);
    topBeam.position.set(0, 6.2, 0);
    archGroup.add(topBeam);

    // Golden portal shimmer ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.16, 10, 28),
      new THREE.MeshStandardMaterial({
        color: 0x34d399,
        emissive: 0x10b981,
        emissiveIntensity: 1.5,
      })
    );
    ring.position.set(0, 3.2, 0);
    archGroup.add(ring);
    this.portalRings.push(ring);

    // Floral vines on archway
    for (let i = -2; i <= 2; i++) {
      const vine = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), leafMat);
      vine.position.set(i * 1.1, 6.6, 0);
      archGroup.add(vine);
    }

    const label = this.createBannerSprite(
      '🌿 YOUNG VIKING MEADOW REALM',
      'Press [E] or [Y] · Peaceful Foraging Sanctuary',
      '#10b981'
    );
    label.position.set(0, 8.2, 0);
    archGroup.add(label);

    this.meadowGroup.add(archGroup);
  }

  private buildGoldenMeadowSanctuary() {
    const cx = MEADOW_CENTER.x;
    const cz = MEADOW_CENTER.z;

    // 1. Lush Sunlit Meadow Island Platform (68x68 at Y=3.0)
    const islandBase = new THREE.Mesh(
      new THREE.BoxGeometry(68, 6, 68),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 })
    );
    islandBase.position.set(cx, 0, cz);
    islandBase.receiveShadow = true;
    this.meadowGroup.add(islandBase);

    // Golden-green soft inner meadow lawn
    const innerLawn = new THREE.Mesh(
      new THREE.CylinderGeometry(31, 32, 0.25, 32),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 })
    );
    innerLawn.position.set(cx, 3.05, cz);
    innerLawn.receiveShadow = true;
    this.meadowGroup.add(innerLawn);

    // 2. Crystal Healing Spring Pond at the center (X: 135, Z: -135)
    const pondRim = new THREE.Mesh(
      new THREE.TorusGeometry(4.8, 0.5, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 })
    );
    pondRim.rotation.x = Math.PI / 2;
    pondRim.position.set(cx, 3.15, cz);
    this.meadowGroup.add(pondRim);

    const pondWater = new THREE.Mesh(
      new THREE.CylinderGeometry(4.6, 4.6, 0.2, 24),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      })
    );
    pondWater.position.set(cx, 3.12, cz);
    this.meadowGroup.add(pondWater);

    // 3. Cozy Nordic Forager's Homestead & Crackling Campfire (X: 135, Z: -153)
    const hutGroup = new THREE.Group();
    hutGroup.position.set(MEADOW_CAMPFIRE_POS.x, 3.1, MEADOW_CAMPFIRE_POS.z - 5.5);

    const cabinWalls = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 4.2, 6.5),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
    );
    cabinWalls.position.y = 2.1;
    hutGroup.add(cabinWalls);

    const turfRoof = new THREE.Mesh(
      new THREE.ConeGeometry(6.8, 3.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 })
    );
    turfRoof.position.y = 5.8;
    turfRoof.rotation.y = Math.PI / 4;
    hutGroup.add(turfRoof);

    const hutLabel = this.createBannerSprite(
      '🏕️ FORAGER HOMESTEAD & HERB POT',
      'Brew Berry Tea & Trade Full Baskets [Y]',
      '#f59e0b'
    );
    hutLabel.position.set(0, 8.5, 2.5);
    hutGroup.add(hutLabel);
    this.meadowGroup.add(hutGroup);

    // Campfire in front of Homestead
    const fireGroup = new THREE.Group();
    fireGroup.position.set(MEADOW_CAMPFIRE_POS.x, 3.15, MEADOW_CAMPFIRE_POS.z);

    const fireRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.28, 8, 14),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 })
    );
    fireRing.rotation.x = Math.PI / 2;
    fireGroup.add(fireRing);

    this.campfireFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.85, 2.1, 8),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf97316,
        emissiveIntensity: 1.6,
      })
    );
    this.campfireFlame.position.y = 1.05;
    fireGroup.add(this.campfireFlame);
    this.meadowGroup.add(fireGroup);

    // 4. Golden Apple & Silver Birch Trees around the Meadow perimeter
    const treePositions = [
      { x: cx - 22, z: cz - 18, golden: true },
      { x: cx + 22, z: cz - 16, golden: true },
      { x: cx - 24, z: cz + 14, golden: false },
      { x: cx + 24, z: cz + 15, golden: true },
      { x: cx - 12, z: cz - 24, golden: false },
      { x: cx + 14, z: cz - 23, golden: false },
      { x: cx - 20, z: cz - 2, golden: true },
      { x: cx + 21, z: cz + 1, golden: false },
    ];

    treePositions.forEach((tp) => {
      const tree = new THREE.Group();
      tree.position.set(tp.x, 3.1, tp.z);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.65, 4.8, 8),
        new THREE.MeshStandardMaterial({
          color: tp.golden ? 0x78350f : 0xe2e8f0,
          roughness: 0.8,
        })
      );
      trunk.position.y = 2.4;
      tree.add(trunk);

      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(3.2, 1),
        new THREE.MeshStandardMaterial({
          color: tp.golden ? 0x16a34a : 0x4ade80,
          roughness: 0.75,
        })
      );
      canopy.position.y = 5.8;
      tree.add(canopy);

      if (tp.golden) {
        for (let a = 0; a < 4; a++) {
          const ang = (a / 4) * Math.PI * 2;
          const apple = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 8, 8),
            new THREE.MeshStandardMaterial({
              color: 0xfacc15,
              emissive: 0xd97706,
              emissiveIntensity: 0.6,
            })
          );
          apple.position.set(Math.cos(ang) * 2.3, 4.8, Math.sin(ang) * 2.3);
          tree.add(apple);
        }
      }

      this.meadowGroup.add(tree);
    });

    // 5. Return Archway back to Katfjord Village (X: 135, Z: -107)
    const retGroup = new THREE.Group();
    retGroup.position.set(MEADOW_RETURN_ARCHWAY.x, 3.1, MEADOW_RETURN_ARCHWAY.z);

    const retRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.18, 10, 28),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.5,
      })
    );
    retRing.position.y = 3.0;
    retGroup.add(retRing);
    this.portalRings.push(retRing);

    const retLabel = this.createBannerSprite(
      '⚓ RETURN TO KATFJORD VILLAGE',
      'Press [E] to Return to Main Viking Village',
      '#38bdf8'
    );
    retLabel.position.set(0, 6.6, 0);
    retGroup.add(retLabel);

    this.meadowGroup.add(retGroup);
  }

  private buildGatherNodes() {
    INITIAL_MEADOW_NODES.forEach((nodeData) => {
      const copy: MeadowGatherNode = { ...nodeData };
      const group = new THREE.Group();
      group.position.set(copy.x, 3.15, copy.z);

      // Glowing ground ring
      const ringColor = this.getCategoryColor(copy.category);
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 1.25, 20),
        new THREE.MeshBasicMaterial({
          color: ringColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        })
      );
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.05;
      group.add(ringMesh);

      // Distinct 3D item mesh
      const itemMesh = this.createCategoryMesh(copy.category);
      itemMesh.position.y = 0.9;
      group.add(itemMesh);

      // Overhead item nameplate
      const labelSprite = this.createSmallItemLabel(copy.name, `+${copy.silverReward} Silver`, ringColor);
      labelSprite.position.set(0, 2.5, 0);
      group.add(labelSprite);

      this.meadowGroup.add(group);
      this.nodeInstances.push({
        data: copy,
        group,
        itemMesh,
        ringMesh,
        labelSprite,
      });
    });
  }

  private buildWanderingYoungVikings() {
    const npcConfigs = [
      {
        name: 'Leif the Young Forager',
        title: 'Apprentice Berry Gatherer',
        tunicColor: 0x059669,
        startNode: 0,
        startX: 128,
        startZ: -128,
      },
      {
        name: 'Astrid the Young Herbalist',
        title: 'Meadow Herb Seeker',
        tunicColor: 0xd97706,
        startNode: 5,
        startX: 144,
        startZ: -136,
      },
    ];

    npcConfigs.forEach((cfg) => {
      const group = new THREE.Group();
      // Youthful Young Viking scale
      group.scale.set(0.46, 0.46, 0.46);
      group.position.set(cfg.startX, 3.15, cfg.startZ);

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.6 });
      const tunicMat = new THREE.MeshStandardMaterial({ color: cfg.tunicColor, roughness: 0.8 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });

      const torso = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.7, 1.25), tunicMat);
      torso.position.y = 3.3;
      group.add(torso);

      const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), skinMat);
      head.position.y = 5.5;
      group.add(head);

      // Youthful eyes & smile
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 0.05), eyeMat);
      eyeL.position.set(-0.38, 5.6, 0.82);
      group.add(eyeL);
      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 0.05), eyeMat);
      eyeR.position.set(0.38, 5.6, 0.82);
      group.add(eyeR);

      // Woven Forager Basket on back
      const basket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.6, 1.7, 10),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
      );
      basket.position.set(0, 3.4, -1.05);
      group.add(basket);

      const leftArm = new THREE.Group();
      leftArm.position.set(-1.7, 4.5, 0);
      const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.5, 0.95), tunicMat);
      lArmMesh.position.y = -1.1;
      leftArm.add(lArmMesh);
      group.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(1.7, 4.5, 0);
      const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.5, 0.95), tunicMat);
      rArmMesh.position.y = -1.1;
      rightArm.add(rArmMesh);
      group.add(rightArm);

      const leftLeg = new THREE.Group();
      leftLeg.position.set(-0.6, 2.1, 0);
      const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.6, 1.0), pantsMat);
      lLegMesh.position.y = -1.1;
      leftLeg.add(lLegMesh);
      group.add(leftLeg);

      const rightLeg = new THREE.Group();
      rightLeg.position.set(0.6, 2.1, 0);
      const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.6, 1.0), pantsMat);
      rLegMesh.position.y = -1.1;
      rightLeg.add(rLegMesh);
      group.add(rightLeg);

      // Dynamic canvas status nameplate
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
      const labelSprite = new THREE.Sprite(spriteMat);
      labelSprite.scale.set(9.5, 2.4, 1);
      labelSprite.position.set(0, 8.4, 0);
      group.add(labelSprite);

      const npcObj: WanderingYoungNpc = {
        name: cfg.name,
        title: cfg.title,
        group,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        targetNodeIndex: cfg.startNode,
        walkTime: 0,
        gatherPauseTimer: 0,
        labelSprite,
        labelCanvas: canvas,
        labelTexture: texture,
        currentStatus: 'Wandering the Meadow...',
      };
      this.drawNpcLabel(npcObj);
      this.meadowGroup.add(group);
      this.wanderingNpcs.push(npcObj);
    });
  }

  private drawNpcLabel(npc: WanderingYoungNpc) {
    const ctx = npc.labelCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 512, 128);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(16, 12, 480, 104, 18);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🧒 ${npc.name}`, 256, 52);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 21px sans-serif';
    ctx.fillText(npc.currentStatus, 256, 92);

    npc.labelTexture.needsUpdate = true;
  }

  public update(
    dt: number,
    player: CharacterController,
    isAutoWandering: boolean,
    onGatherNode: (node: MeadowGatherNode) => void
  ) {
    const now = Date.now();

    // 1. Animate archway rings & campfire
    this.portalRings.forEach((ring, idx) => {
      ring.rotation.z += dt * (idx === 0 ? 1.2 : -1.2);
    });
    if (this.campfireFlame) {
      this.campfireFlame.scale.y = 0.9 + Math.sin(now * 0.012) * 0.18;
      this.campfireFlame.rotation.y += dt * 2.5;
    }

    // 2. Update Gatherable Nodes (respawn after 10s + bobbing animation + proximity pickup)
    const isPlayerInMeadow =
      Math.abs(player.position.x - MEADOW_CENTER.x) < 38 &&
      Math.abs(player.position.z - MEADOW_CENTER.z) < 38;

    for (const inst of this.nodeInstances) {
      if (!inst.data.isAvailable && now >= inst.data.respawnAt) {
        inst.data.isAvailable = true;
        inst.group.visible = true;
      }

      if (inst.data.isAvailable) {
        inst.itemMesh.rotation.y += dt * 1.6;
        inst.itemMesh.position.y = 0.9 + Math.sin(now * 0.004 + inst.data.x) * 0.22;
        inst.ringMesh.scale.setScalar(0.95 + Math.sin(now * 0.005 + inst.data.z) * 0.08);

        // Automatic walk-over gathering when the Young Viking gets within 3.6m!
        if (isPlayerInMeadow) {
          const dist = Math.hypot(
            player.position.x - inst.data.x,
            player.position.z - inst.data.z
          );
          if (dist <= 3.6) {
            this.collectNodeInstance(inst, player, onGatherNode);
          }
        }
      }
    }

    // 3. Autonomous Young Viking Player Wander & Gather Mode
    if (isAutoWandering && isPlayerInMeadow) {
      let targetInst = this.nodeInstances.find(
        (n) => n.data.id === this.currentTargetNodeId && n.data.isAvailable
      );

      if (!targetInst) {
        // Pick nearest available gatherable item
        let bestDist = Infinity;
        for (const candidate of this.nodeInstances) {
          if (!candidate.data.isAvailable) continue;
          const d = Math.hypot(
            player.position.x - candidate.data.x,
            player.position.z - candidate.data.z
          );
          if (d < bestDist) {
            bestDist = d;
            targetInst = candidate;
          }
        }
        this.currentTargetNodeId = targetInst ? targetInst.data.id : null;
      }

      if (targetInst) {
        const dx = targetInst.data.x - player.position.x;
        const dz = targetInst.data.z - player.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 1.2) {
          const dirX = dx / dist;
          const dirZ = dz / dist;
          const wanderSpeed = 9.2;
          player.position.x += dirX * wanderSpeed * dt;
          player.position.z += dirZ * wanderSpeed * dt;
          player.group.rotation.y = Math.atan2(dirX, dirZ);

          // Animate Young Viking legs & arms while wandering
          const t = now * 0.01;
          player.leftLeg.rotation.x = Math.sin(t) * 0.65;
          player.rightLeg.rotation.x = -Math.sin(t) * 0.65;
          player.leftArm.rotation.x = -Math.sin(t) * 0.5;
          player.rightArm.rotation.x = Math.sin(t) * 0.5;
        }
      }
    }

    // 4. Animate the 2 Wandering Young Viking Companion NPCs in the Meadow
    for (const npc of this.wanderingNpcs) {
      if (npc.gatherPauseTimer > 0) {
        npc.gatherPauseTimer -= dt;
        // Reaching down foraging motion
        npc.rightArm.rotation.x = -0.9 + Math.sin(now * 0.015) * 0.35;
        npc.leftArm.rotation.x = -0.5;
        npc.leftLeg.rotation.x = 0;
        npc.rightLeg.rotation.x = 0;
        if (npc.gatherPauseTimer <= 0) {
          npc.targetNodeIndex =
            (npc.targetNodeIndex + 1 + Math.floor(Math.random() * 3)) %
            this.nodeInstances.length;
          const nextNode = this.nodeInstances[npc.targetNodeIndex].data;
          npc.currentStatus = `Wandering to ${nextNode.name}...`;
          this.drawNpcLabel(npc);
        }
        continue;
      }

      const targetNode = this.nodeInstances[npc.targetNodeIndex]?.data;
      if (!targetNode) continue;

      const dx = targetNode.x - npc.group.position.x;
      const dz = targetNode.z - npc.group.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 2.0) {
        const speed = 5.2;
        npc.group.position.x += (dx / dist) * speed * dt;
        npc.group.position.z += (dz / dist) * speed * dt;
        npc.group.rotation.y = Math.atan2(dx, dz);
        npc.walkTime += dt * 8;
        npc.leftLeg.rotation.x = Math.sin(npc.walkTime) * 0.6;
        npc.rightLeg.rotation.x = -Math.sin(npc.walkTime) * 0.6;
        npc.leftArm.rotation.x = -Math.sin(npc.walkTime) * 0.45;
        npc.rightArm.rotation.x = Math.sin(npc.walkTime) * 0.45;
      } else {
        npc.gatherPauseTimer = 2.6;
        npc.currentStatus = `Gathering ${targetNode.name}!`;
        this.drawNpcLabel(npc);
      }
    }
  }

  public gatherNearestAvailableNode(
    player: CharacterController,
    onGatherNode: (node: MeadowGatherNode) => void
  ): boolean {
    let nearest: MeadowNodeInstance | null = null;
    let bestDist = 12.0;

    for (const inst of this.nodeInstances) {
      if (!inst.data.isAvailable) continue;
      const d = Math.hypot(
        player.position.x - inst.data.x,
        player.position.z - inst.data.z
      );
      if (d < bestDist) {
        bestDist = d;
        nearest = inst;
      }
    }

    if (nearest) {
      this.collectNodeInstance(nearest, player, onGatherNode);
      return true;
    }
    return false;
  }

  private collectNodeInstance(
    inst: MeadowNodeInstance,
    player: CharacterController,
    onGatherNode: (node: MeadowGatherNode) => void
  ) {
    if (!inst.data.isAvailable) return;
    inst.data.isAvailable = false;
    inst.data.respawnAt = Date.now() + 9000; // Respawns in 9 seconds
    inst.group.visible = false;
    player.triggerAttack();
    onGatherNode({ ...inst.data });
  }

  public getNodesSnapshot(): MeadowGatherNode[] {
    return this.nodeInstances.map((n) => ({ ...n.data }));
  }

  private getCategoryColor(cat: MeadowItemCategory): number {
    switch (cat) {
      case 'berries':
        return 0xf43f5e;
      case 'mushrooms':
        return 0x38bdf8;
      case 'honeycomb':
        return 0xf59e0b;
      case 'amber':
        return 0xf97316;
      case 'herbs':
        return 0x10b981;
      case 'golden_apples':
        return 0xfacc15;
      case 'runestones':
        return 0xa855f7;
      case 'driftwood':
        return 0xd97706;
    }
  }

  private createCategoryMesh(cat: MeadowItemCategory): THREE.Object3D {
    const holder = new THREE.Group();
    switch (cat) {
      case 'berries': {
        const bush = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.65, 0),
          new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
        );
        holder.add(bush);
        for (let i = 0; i < 5; i++) {
          const berry = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshStandardMaterial({
              color: 0xf43f5e,
              emissive: 0xe11d48,
              emissiveIntensity: 0.7,
            })
          );
          const ang = (i / 5) * Math.PI * 2;
          berry.position.set(Math.cos(ang) * 0.5, 0.2, Math.sin(ang) * 0.5);
          holder.add(berry);
        }
        break;
      }
      case 'mushrooms': {
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.24, 0.7, 8),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc })
        );
        holder.add(stem);
        const cap = new THREE.Mesh(
          new THREE.ConeGeometry(0.65, 0.55, 10),
          new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.9,
          })
        );
        cap.position.y = 0.45;
        holder.add(cap);
        break;
      }
      case 'honeycomb': {
        const comb = new THREE.Mesh(
          new THREE.CylinderGeometry(0.55, 0.55, 0.35, 6),
          new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            emissive: 0xd97706,
            emissiveIntensity: 0.7,
            roughness: 0.3,
          })
        );
        comb.rotation.x = Math.PI / 3;
        holder.add(comb);
        break;
      }
      case 'amber': {
        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.6, 0),
          new THREE.MeshStandardMaterial({
            color: 0xf97316,
            emissive: 0xea580c,
            emissiveIntensity: 0.9,
            metalness: 0.3,
            roughness: 0.2,
          })
        );
        holder.add(gem);
        break;
      }
      case 'herbs': {
        for (let i = 0; i < 3; i++) {
          const leaf = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.85, 0.12),
            new THREE.MeshStandardMaterial({
              color: 0x10b981,
              emissive: 0x059669,
              emissiveIntensity: 0.5,
            })
          );
          leaf.rotation.z = (i - 1) * 0.45;
          holder.add(leaf);
        }
        break;
      }
      case 'golden_apples': {
        const apple = new THREE.Mesh(
          new THREE.SphereGeometry(0.52, 12, 12),
          new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0xca8a04,
            emissiveIntensity: 0.8,
            metalness: 0.4,
            roughness: 0.25,
          })
        );
        holder.add(apple);
        break;
      }
      case 'runestones': {
        const stone = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 0.95, 0.35),
          new THREE.MeshStandardMaterial({
            color: 0xa855f7,
            emissive: 0x7e22ce,
            emissiveIntensity: 0.85,
          })
        );
        holder.add(stone);
        break;
      }
      case 'driftwood': {
        const log = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.26, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
        );
        log.rotation.z = Math.PI / 2.4;
        holder.add(log);
        break;
      }
    }
    return holder;
  }

  private createSmallItemLabel(title: string, subtitle: string, hexColor: number): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.beginPath();
      ctx.roundRect(12, 10, 360, 76, 14);
      ctx.fill();
      ctx.strokeStyle = `#${hexColor.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, 192, 44);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(subtitle, 192, 72);
    }
    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    );
    sprite.scale.set(5.2, 1.3, 1);
    return sprite;
  }

  private createBannerSprite(title: string, subtitle: string, borderColor: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(16, 12, 608, 116, 20);
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, 320, 58);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(subtitle, 320, 98);
    }
    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    );
    sprite.scale.set(11.5, 2.5, 1);
    return sprite;
  }
}
