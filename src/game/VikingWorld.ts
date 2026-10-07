import * as THREE from 'three';
import { BattleId, TycoonBuilding, DrakkarCustomization, WindSailingStats } from '../types';
import { sound } from '../audio/soundEngine';
import { INITIAL_TYCOON_BUILDINGS } from './robloxFeaturesConfig';
import { getNavalItemById, DEFAULT_DRAKKAR_CUSTOMIZATION } from './navalArmoryConfig';

export type WeatherCondition = 'sunny' | 'foggy' | 'snowy' | 'stormy';

export interface DestructibleBarricade {
  id: string;
  name: string;
  group: THREE.Group;
  position: THREE.Vector3;
  health: number;
  maxHealth: number;
  sprite: THREE.Sprite;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  isDestroyed: boolean;
}

export interface InteractiveObject {
  id: string;
  type: 'tree' | 'ore' | 'ship_helm' | 'runestone' | 'chest' | 'fire' | 'obby_chest' | 'territory_flag' | 'tycoon_pad';
  mesh: THREE.Object3D;
  position: THREE.Vector3;
  health: number;
  maxHealth: number;
  name: string;
  interactionPrompt: string;
}

export interface ObbyPlatformBox {
  x: number;
  y: number; // Top surface height
  z: number;
  halfW: number;
  halfD: number;
}

export class VikingWorld {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public waterMesh: THREE.Mesh | null = null;
  public shipGroup: THREE.Group | null = null;
  public shipFigureheadGroup: THREE.Group = new THREE.Group();
  public shipSailGroup: THREE.Group = new THREE.Group();
  public shipShieldsGroup: THREE.Group = new THREE.Group();
  public currentShipCustomization: DrakkarCustomization = { ...DEFAULT_DRAKKAR_CUSTOMIZATION };

  // Wind Dynamics & WebGL Sail Billowing Physics
  public windAngle: number = 0.52; // Wind blowing towards angle (radians)
  public windBaseSpeed: number = 18; // Knots
  public windGustTime: number = 0;
  public sailTackAngle: number = 0; // Current yard rotation (radians)
  public sailBillowDepth: number = 2.8; // Current billow depth (meters)
  public shipSailPlaneMesh: THREE.Mesh | null = null;
  public shipSailYardMesh: THREE.Mesh | null = null;
  public shipMastPennantGroup: THREE.Group | null = null;
  public sailBasePositions: Float32Array | null = null;
  public windStreamersGroup: THREE.Group | null = null;
  public shipLeftSheet: THREE.Line | null = null;
  public shipRightSheet: THREE.Line | null = null;
  private sailNormalTimer: number = 0;

  // Cinematic Camera & Drakkar Onboarding Showcase
  public isCinematicActive: boolean = false;
  public cinematicCamPos: THREE.Vector3 = new THREE.Vector3();
  public cinematicCamTarget: THREE.Vector3 = new THREE.Vector3();
  public targetCinematicPos: THREE.Vector3 = new THREE.Vector3();
  public targetCinematicTarget: THREE.Vector3 = new THREE.Vector3();
  public pierWaypointBeacon: THREE.Group | null = null;
  public isTrackingPierWaypoint: boolean = false;

  public interactiveObjects: InteractiveObject[] = [];
  public placedBarricades: THREE.Mesh[] = [];
  public fireLights: THREE.PointLight[] = [];
  private clock: THREE.Clock;
  private animId: number = 0;
  public isShipMounted: boolean = false;
  public shipSpeed: number = 0;
  public shipRotation: number = 0;

  // Realistic Campaign Battlefield Fortifications & Visual FX
  public campaignBarricades: DestructibleBarricade[] = [];
  public combatParticles: {
    points: THREE.Points;
    velocities: Float32Array;
    positions: Float32Array;
    life: number;
    maxLife: number;
  }[] = [];
  public activeShockwaves: {
    mesh: THREE.Mesh;
    radius: number;
    maxRadius: number;
    opacity: number;
  }[] = [];

  // Roblox Sky Obby Platforms, Tycoon Structures & Territory Flag
  public obbyPlatforms: ObbyPlatformBox[] = [];
  public tycoonGroup: THREE.Group = new THREE.Group();
  public tycoonPadMesh: THREE.Mesh | null = null;
  public territoryFlagMesh: THREE.Mesh | null = null;

  // Dynamic Weather System
  public weather: WeatherCondition = 'sunny';
  public ambientLight!: THREE.AmbientLight;
  public sunLight!: THREE.DirectionalLight;
  public hemiLight!: THREE.HemisphereLight;
  public snowParticles: THREE.Points | null = null;
  public mistParticles: THREE.Points | null = null;
  public rainParticles: THREE.Points | null = null;
  public seaSprayParticles: THREE.Points | null = null;
  private snowVelocities: Float32Array | null = null;
  private mistVelocities: Float32Array | null = null;
  private rainVelocities: Float32Array | null = null;
  private seaSprayVelocities: Float32Array | null = null;
  private seaSprayLifetimes: Float32Array | null = null;

  // Rough Sea & Wave Geometry State
  private waterGeo: THREE.PlaneGeometry | null = null;
  private waterPositions: Float32Array | null = null;
  private waterColors: Float32Array | null = null;
  private waveCrestNormalTimer: number = 0;

  // Storm Lightning System
  private lightningTimer: number = 6.0;
  private isLightningFlashing: boolean = false;
  private lightningFlashDuration: number = 0;

  // Smooth weather transition targets
  private currentBgColor: THREE.Color = new THREE.Color(0x87ceeb);
  private targetBgColor: THREE.Color = new THREE.Color(0x87ceeb);
  private currentFogColor: THREE.Color = new THREE.Color(0x9dd6f5);
  private targetFogColor: THREE.Color = new THREE.Color(0x9dd6f5);
  private currentFogDensity: number = 0.003;
  private targetFogDensity: number = 0.003;
  private targetSunIntensity: number = 2.4;
  private targetSunColor: THREE.Color = new THREE.Color(0xfffdf5);
  private targetAmbientIntensity: number = 1.65;
  private targetAmbientColor: THREE.Color = new THREE.Color(0xf2f8ff);
  private targetHemiIntensity: number = 1.15;
  private targetHemiSkyColor: THREE.Color = new THREE.Color(0xa8dcff);
  private targetHemiGroundColor: THREE.Color = new THREE.Color(0x788f64);

  constructor(container: HTMLDivElement) {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    // Bright Nordic Daylight Atmosphere
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0x9dd6f5, 0.003);

    // Safe width and height calculation to prevent NaN aspect ratio and 0x0 canvas
    const width = container.clientWidth > 0 ? container.clientWidth : (window.innerWidth || 800);
    const height = container.clientHeight > 0 ? container.clientHeight : (window.innerHeight || 600);
    const aspect = height > 0 ? width / height : 16 / 9;

    // Camera setup with safe initial position looking down at village center
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 14, 36);
    this.camera.lookAt(0, 6, 20);

    // WebGL Renderer setup with fallback
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'default',
      });
    } catch {
      this.renderer = new THREE.WebGLRenderer({ antialias: false });
    }

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;

    // Ensure canvas fills the container completely and is positioned properly
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';

    // Clear any previous canvas child to handle StrictMode cleanly
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.buildTerrain();
    this.buildLonghouse();
    this.buildBlacksmith();
    this.buildRunestoneCircle();
    this.buildVillageDefenses();
    this.buildVegetationAndOre();
    this.buildVikingLongship();
    this.buildRivalOutpost();
    this.buildSkyObbyCourse();
    this.buildTycoonPlot();
    this.buildSnowParticles();
    this.buildMistParticles();
    this.buildRainParticles();
    this.buildSeaSprayParticles();
  }

  private setupLighting() {
    // Bright ambient light - vivid nordic daylight
    this.ambientLight = new THREE.AmbientLight(0xf2f8ff, 1.65);
    this.scene.add(this.ambientLight);

    // Sunlight - warm directional light casting crisp shadows
    this.sunLight = new THREE.DirectionalLight(0xfffdf5, 2.4);
    this.sunLight.position.set(70, 110, 60);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 300;
    this.sunLight.shadow.camera.left = -120;
    this.sunLight.shadow.camera.right = 120;
    this.sunLight.shadow.camera.top = 120;
    this.sunLight.shadow.camera.bottom = -120;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Secondary fill directional light to eliminate dark shadows on buildings and ships
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.95);
    fillLight.position.set(-65, 85, -55);
    this.scene.add(fillLight);

    // Bright sky-to-ground hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0xa8dcff, 0x788f64, 1.15);
    this.scene.add(this.hemiLight);
  }


  /**
   * Blocky Stepped Norse Terrain (Classic Roblox Voxel Aesthetic)
   */
  private buildTerrain() {
    // Village Island / Coast Ground (High Grass Plateau)
    const islandGeo = new THREE.BoxGeometry(160, 6, 160);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x5f9e49, // Bright lush Norse meadow green
      roughness: 0.85,
    });
    const mainIsland = new THREE.Mesh(islandGeo, islandMat);
    mainIsland.position.set(0, 0, 0);
    mainIsland.receiveShadow = true;
    this.scene.add(mainIsland);

    // Lower Sand/Gravel Shore near Harbor
    const shoreGeo = new THREE.BoxGeometry(180, 4, 70);
    const shoreMat = new THREE.MeshStandardMaterial({
      color: 0xa89d7c, // Bright warm shoreline sand & gravel
      roughness: 0.9,
    });
    const shore = new THREE.Mesh(shoreGeo, shoreMat);
    shore.position.set(0, -1, 75);
    shore.receiveShadow = true;
    this.scene.add(shore);

    // Snowy Mountains at back
    const mountainColors = [0x758696, 0xf0f6fc];
    for (let i = 0; i < 9; i++) {
      const h = 40 + Math.random() * 50;
      const w = 30 + Math.random() * 25;
      const mGeo = new THREE.BoxGeometry(w, h, w);
      const mMat = new THREE.MeshStandardMaterial({
        color: mountainColors[i % 2],
        roughness: 0.8,
      });
      const mountain = new THREE.Mesh(mGeo, mMat);
      mountain.position.set(
        -80 + i * 22 + (Math.random() * 10 - 5),
        h / 2 - 2,
        -90 - (Math.random() * 25)
      );
      mountain.rotation.y = (Math.PI / 4) * (i % 2);
      mountain.castShadow = true;
      mountain.receiveShadow = true;
      this.scene.add(mountain);
    }

    // Fjord Ocean Water with High-Fidelity 3D Dynamic Waves & Whitecap Foam
    const waterSegments = 100;
    this.waterGeo = new THREE.PlaneGeometry(600, 600, waterSegments, waterSegments);

    const vCount = this.waterGeo.attributes.position.count;
    this.waterPositions = new Float32Array(vCount * 3);
    this.waterPositions.set(this.waterGeo.attributes.position.array as Float32Array);

    this.waterColors = new Float32Array(vCount * 3);
    for (let i = 0; i < vCount; i++) {
      this.waterColors[i * 3] = 0.20;
      this.waterColors[i * 3 + 1] = 0.52;
      this.waterColors[i * 3 + 2] = 0.74;
    }
    this.waterGeo.setAttribute('color', new THREE.BufferAttribute(this.waterColors, 3));

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.15,
      metalness: 0.45,
      transparent: true,
      opacity: 0.94,
    });
    this.waterMesh = new THREE.Mesh(this.waterGeo, waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(0, -1.8, 180);
    this.waterMesh.receiveShadow = true;
    this.scene.add(this.waterMesh);

    // Distant Isle of Runes in the Ocean
    const isleGeo = new THREE.BoxGeometry(70, 8, 70);
    const isleMat = new THREE.MeshStandardMaterial({ color: 0x528c44, roughness: 0.85 });
    const isle = new THREE.Mesh(isleGeo, isleMat);
    isle.position.set(40, -1, 230);
    isle.receiveShadow = true;
    this.scene.add(isle);
  }

  /**
   * The Great Viking Longhouse (Mead Hall of the Jarl)
   */
  private buildLonghouse() {
    const longhouse = new THREE.Group();
    longhouse.position.set(0, 3, -15);

    // Floor
    const floorGeo = new THREE.BoxGeometry(36, 1, 52);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x5c3d24, roughness: 0.85 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.5;
    floor.receiveShadow = true;
    longhouse.add(floor);

    // Wooden Log Walls (blocky timber beams)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x7c5434, roughness: 0.8 });
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x5c3a20, roughness: 0.9 });

    // Left & Right Walls
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 9, 52), wallMat);
    wallL.position.set(-17.5, 5, 0);
    wallL.castShadow = true;
    wallL.receiveShadow = true;
    longhouse.add(wallL);

    const wallR = new THREE.Mesh(new THREE.BoxGeometry(1.5, 9, 52), wallMat);
    wallR.position.set(17.5, 5, 0);
    wallR.castShadow = true;
    wallR.receiveShadow = true;
    longhouse.add(wallR);

    // Back Wall
    const wallBack = new THREE.Mesh(new THREE.BoxGeometry(36, 9, 1.5), wallMat);
    wallBack.position.set(0, 5, -25.5);
    wallBack.castShadow = true;
    wallBack.receiveShadow = true;
    longhouse.add(wallBack);

    // Front Wall with grand arched entrance
    const frontL = new THREE.Mesh(new THREE.BoxGeometry(13, 9, 1.5), wallMat);
    frontL.position.set(-11.5, 5, 25.5);
    frontL.castShadow = true;
    longhouse.add(frontL);

    const frontR = new THREE.Mesh(new THREE.BoxGeometry(13, 9, 1.5), wallMat);
    frontR.position.set(11.5, 5, 25.5);
    frontR.castShadow = true;
    longhouse.add(frontR);

    const frontLintel = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 1.5), beamMat);
    frontLintel.position.set(0, 8, 25.5);
    frontLintel.castShadow = true;
    longhouse.add(frontLintel);

    // Pitched Thatched/Wood Shingle Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x4d3624, roughness: 0.9 });
    const roofL = new THREE.Mesh(new THREE.BoxGeometry(23, 1, 56), roofMat);
    roofL.position.set(-9.5, 13, 0);
    roofL.rotation.z = Math.PI / 4.5;
    roofL.castShadow = true;
    longhouse.add(roofL);

    const roofR = new THREE.Mesh(new THREE.BoxGeometry(23, 1, 56), roofMat);
    roofR.position.set(9.5, 13, 0);
    roofR.rotation.z = -Math.PI / 4.5;
    roofR.castShadow = true;
    longhouse.add(roofR);

    // Carved Dragon Prow Totems at the roof ridges
    const dragonMat = new THREE.MeshStandardMaterial({ color: 0x8a381e });
    [-27, 27].forEach((zPos) => {
      const dragonHead = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 3), dragonMat);
      dragonHead.position.set(0, 18, zPos);
      dragonHead.castShadow = true;
      longhouse.add(dragonHead);
    });

    // Central Firepit
    const pitGeo = new THREE.BoxGeometry(6, 1.2, 14);
    const pitMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const firepit = new THREE.Mesh(pitGeo, pitMat);
    firepit.position.set(0, 1, 0);
    longhouse.add(firepit);

    // Glowing Fire Light
    const fireLight = new THREE.PointLight(0xff7722, 2.5, 30);
    fireLight.position.set(0, 3.5, 0);
    fireLight.castShadow = true;
    longhouse.add(fireLight);
    this.fireLights.push(fireLight);

    // Fire embers block
    const fireMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1.5, 8),
      new THREE.MeshBasicMaterial({ color: 0xff4500 })
    );
    fireMesh.position.set(0, 1.8, 0);
    longhouse.add(fireMesh);

    // Great Feast Tables & Benches
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x482d16 });
    [-8, 8].forEach((xPos) => {
      const table = new THREE.Mesh(new THREE.BoxGeometry(4, 2.2, 24), tableMat);
      table.position.set(xPos, 2, 0);
      table.castShadow = true;
      longhouse.add(table);
    });

    // Jarl's Throne at the far end
    const throneMat = new THREE.MeshStandardMaterial({ color: 0x6e2814 });
    const throne = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 4), throneMat);
    throne.position.set(0, 4.5, -20);
    throne.castShadow = true;
    longhouse.add(throne);

    // Hanging Shields on the walls
    const shieldColors = [0xb83227, 0x1e3799, 0xf6b93b, 0x079992];
    for (let i = -4; i <= 4; i += 2) {
      const shieldMeshL = this.createRoundShield(shieldColors[Math.abs(i) % shieldColors.length]);
      shieldMeshL.position.set(-16.6, 6, i * 5);
      shieldMeshL.rotation.y = Math.PI / 2;
      longhouse.add(shieldMeshL);

      const shieldMeshR = this.createRoundShield(shieldColors[(Math.abs(i) + 1) % shieldColors.length]);
      shieldMeshR.position.set(16.6, 6, i * 5);
      shieldMeshR.rotation.y = -Math.PI / 2;
      longhouse.add(shieldMeshR);
    }

    this.scene.add(longhouse);
  }

  /**
   * Blacksmith Forge & Anvil
   */
  private buildBlacksmith() {
    const forgeGroup = new THREE.Group();
    forgeGroup.position.set(38, 3, -8);

    // Stone Forge Chimney & Hearth
    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(8, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.9 })
    );
    chimney.position.set(0, 6, 0);
    chimney.castShadow = true;
    forgeGroup.add(chimney);

    // Glowing coals
    const coals = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1, 4),
      new THREE.MeshBasicMaterial({ color: 0xff3b00 })
    );
    coals.position.set(0, 3, 4);
    forgeGroup.add(coals);

    const forgeLight = new THREE.PointLight(0xff5500, 2.2, 18);
    forgeLight.position.set(0, 4.5, 4);
    forgeGroup.add(forgeLight);
    this.fireLights.push(forgeLight);

    // Heavy Iron Anvil
    const anvilMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, metalness: 0.9, roughness: 0.3 });
    const anvilBase = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 2), anvilMat);
    anvilBase.position.set(0, 1.25, 8);
    anvilBase.castShadow = true;
    forgeGroup.add(anvilBase);

    const anvilTop = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 1.6), anvilMat);
    anvilTop.position.set(0, 2.7, 8);
    anvilTop.castShadow = true;
    forgeGroup.add(anvilTop);

    // Open Shed Roof
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x4a2e1b })
    );
    roof.position.set(0, 9, 5);
    roof.castShadow = true;
    forgeGroup.add(roof);

    // 4 Support Wooden Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x3b2415 });
    [[-7, -2], [7, -2], [-7, 12], [7, 12]].forEach(([px, pz]) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9, 1.2), pillarMat);
      p.position.set(px, 4.5, pz);
      p.castShadow = true;
      forgeGroup.add(p);
    });

    this.scene.add(forgeGroup);
  }

  /**
   * Sacred Runestone Circle (buffs & ancient magic)
   */
  private buildRunestoneCircle() {
    const runeGroup = new THREE.Group();
    runeGroup.position.set(-42, 3, 10);

    const runeMat = new THREE.MeshStandardMaterial({
      color: 0x4b5358,
      roughness: 0.85,
    });
    const runeGlowMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee, // Mystic Cyan Norse runes
    });

    const numRunes = 6;
    for (let i = 0; i < numRunes; i++) {
      const angle = (i / numRunes) * Math.PI * 2;
      const rx = Math.cos(angle) * 14;
      const rz = Math.sin(angle) * 14;

      const stone = new THREE.Mesh(new THREE.BoxGeometry(2.5, 8 + (i % 3), 1.8), runeMat);
      stone.position.set(rx, 4, rz);
      stone.rotation.y = -angle;
      stone.castShadow = true;
      runeGroup.add(stone);

      // Glowing rune inscription strip
      const runeStrip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 1.9), runeGlowMat);
      runeStrip.position.set(rx, 4, rz);
      runeStrip.rotation.y = -angle;
      runeGroup.add(runeStrip);

      this.interactiveObjects.push({
        id: `runestone_${i}`,
        type: 'runestone',
        mesh: stone,
        position: new THREE.Vector3(runeGroup.position.x + rx, 3, runeGroup.position.z + rz),
        health: 100,
        maxHealth: 100,
        name: 'Sacred Runestone of Thor',
        interactionPrompt: 'Press E to Pray for Blessing',
      });
    }

    // Central runic altar
    const altar = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4.5, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x333b40, roughness: 0.9 })
    );
    altar.position.set(0, 0.75, 0);
    altar.receiveShadow = true;
    runeGroup.add(altar);

    const runeLight = new THREE.PointLight(0x06b6d4, 1.8, 20);
    runeLight.position.set(0, 3, 0);
    runeGroup.add(runeLight);

    this.scene.add(runeGroup);
  }

  /**
   * Village Wooden Palisades & Watchtowers
   */
  private buildVillageDefenses() {
    const palisadeMat = new THREE.MeshStandardMaterial({ color: 0x4a331c, roughness: 0.9 });
    const logGeo = new THREE.CylinderGeometry(0.6, 0.7, 7, 6);

    // North-West wall section
    for (let x = -60; x <= -20; x += 1.4) {
      const log = new THREE.Mesh(logGeo, palisadeMat);
      log.position.set(x, 6.5, -45);
      log.castShadow = true;
      this.scene.add(log);
    }
    // North-East wall section
    for (let x = 20; x <= 60; x += 1.4) {
      const log = new THREE.Mesh(logGeo, palisadeMat);
      log.position.set(x, 6.5, -45);
      log.castShadow = true;
      this.scene.add(log);
    }

    // High Watchtower near Harbor
    const tower = new THREE.Group();
    tower.position.set(-25, 3, 45);

    // 4 legs
    [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([tx, tz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(1.4, 20, 1.4), palisadeMat);
      leg.position.set(tx, 10, tz);
      leg.castShadow = true;
      tower.add(leg);
    });

    // Platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(9, 1.2, 9),
      new THREE.MeshStandardMaterial({ color: 0x3a2212 })
    );
    platform.position.set(0, 19, 0);
    platform.castShadow = true;
    tower.add(platform);

    // Railing
    const railMat = new THREE.MeshStandardMaterial({ color: 0x4a331c });
    const railF = new THREE.Mesh(new THREE.BoxGeometry(9, 2.5, 0.6), railMat);
    railF.position.set(0, 20.5, 4.2);
    tower.add(railF);

    // Horn War Banner on Tower
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 8, 4),
      new THREE.MeshStandardMaterial({ color: 0x991b1b }) // Blood Red Clan Banner
    );
    banner.position.set(4.2, 17, 0);
    tower.add(banner);

    this.scene.add(tower);
  }

  /**
   * Blocky Pine Trees & Minable Iron Ore Boulders
   */
  private buildVegetationAndOre() {
    const pineLeafMat = new THREE.MeshStandardMaterial({ color: 0x2f6638, roughness: 0.85 });
    const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });

    // Procedural Blocky Pine Trees
    const treePositions = [
      [-55, -20], [-68, -5], [-50, 30], [-62, 45],
      [55, 10], [65, -15], [52, -35], [68, 30],
      [-30, -35], [30, -38], [15, -42], [-15, -42],
      [-40, 25], [42, 28], [58, 48], [-68, -35]
    ];

    treePositions.forEach(([tx, tz], idx) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 3, tz);

      // Trunk
      const trunk = new THREE.Mesh(new THREE.BoxGeometry(2, 10, 2), pineTrunkMat);
      trunk.position.set(0, 5, 0);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // 3 Tiered Foliage Cubes
      const foliage1 = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), pineLeafMat);
      foliage1.position.set(0, 10, 0);
      foliage1.castShadow = true;
      tree.add(foliage1);

      const foliage2 = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 7), pineLeafMat);
      foliage2.position.set(0, 14, 0);
      foliage2.castShadow = true;
      tree.add(foliage2);

      const foliage3 = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), pineLeafMat);
      foliage3.position.set(0, 17.5, 0);
      foliage3.castShadow = true;
      tree.add(foliage3);

      this.scene.add(tree);

      this.interactiveObjects.push({
        id: `tree_${idx}`,
        type: 'tree',
        mesh: tree,
        position: new THREE.Vector3(tx, 3, tz),
        health: 100,
        maxHealth: 100,
        name: 'Great Norse Pine',
        interactionPrompt: 'Equip Axe [1] and Click to Chop',
      });
    });

    // Minable Iron Ore Boulders
    const oreMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      metalness: 0.6,
      roughness: 0.5,
    });
    const oreVeinMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd, // Silver-blue raw iron glistening
      metalness: 0.95,
      roughness: 0.2,
    });

    const orePositions = [
      [-48, -5], [-58, 18], [48, -25], [62, 5], [-20, 32], [28, 40]
    ];

    orePositions.forEach(([ox, oz], idx) => {
      const rock = new THREE.Group();
      rock.position.set(ox, 3, oz);

      const baseRock = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.5, 4.5), oreMat);
      baseRock.position.set(0, 1.75, 0);
      baseRock.castShadow = true;
      rock.add(baseRock);

      const oreVein = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 4.6), oreVeinMat);
      oreVein.position.set(0, 1.75, 0);
      rock.add(oreVein);

      this.scene.add(rock);

      this.interactiveObjects.push({
        id: `ore_${idx}`,
        type: 'ore',
        mesh: rock,
        position: new THREE.Vector3(ox, 3, oz),
        health: 120,
        maxHealth: 120,
        name: 'Iron Ore Deposit',
        interactionPrompt: 'Equip Axe [1] and Click to Mine',
      });
    });
  }

  /**
   * The Viking Longship (Drakkar) at the Docks
   */
  private buildVikingLongship() {
    // Dock pier
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x3a2514, roughness: 0.85 });
    const pier = new THREE.Mesh(new THREE.BoxGeometry(12, 1.5, 42), pierMat);
    pier.position.set(0, 0, 75);
    pier.castShadow = true;
    pier.receiveShadow = true;
    this.scene.add(pier);

    // Ship Group
    this.shipGroup = new THREE.Group();
    this.shipGroup.position.set(22, -0.6, 95);

    const hullMat = new THREE.MeshStandardMaterial({ color: 0x6b3e23, roughness: 0.8 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xa64424 });

    // Main Hull (chunky blocky Viking ship)
    const hull = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 34), hullMat);
    hull.position.set(0, 2.25, 0);
    hull.castShadow = true;
    this.shipGroup.add(hull);

    // Dragon Prow (Front Stem)
    const prow = new THREE.Mesh(new THREE.BoxGeometry(2, 9, 3), trimMat);
    prow.position.set(0, 6, 18);
    prow.rotation.x = Math.PI / 8;
    prow.castShadow = true;
    this.shipGroup.add(prow);

    // Dragon Tail (Stern)
    const stern = new THREE.Mesh(new THREE.BoxGeometry(2, 7, 2.5), trimMat);
    stern.position.set(0, 5, -17.5);
    stern.rotation.x = -Math.PI / 8;
    stern.castShadow = true;
    this.shipGroup.add(stern);

    // Mast
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.7, 24, 6),
      new THREE.MeshStandardMaterial({ color: 0x3b2415 })
    );
    mast.position.set(0, 12, 0);
    mast.castShadow = true;
    this.shipGroup.add(mast);

    // Dynamic Drakkar Customization Groups (Sail patterns, Gunwale shields, Bow figureheads)
    this.shipGroup.add(this.shipFigureheadGroup);
    this.shipGroup.add(this.shipSailGroup);
    this.shipGroup.add(this.shipShieldsGroup);

    // Masthead Wind Pennant & Bronze Vane (Viking Vejrfløj)
    this.shipMastPennantGroup = new THREE.Group();
    this.shipMastPennantGroup.position.set(0, 24.5, 0);
    const vaneMount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 1.4, 6),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
    );
    this.shipMastPennantGroup.add(vaneMount);
    const streamerGeo = new THREE.PlaneGeometry(3.6, 0.7, 8, 2);
    const streamerMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      side: THREE.DoubleSide,
      roughness: 0.8,
    });
    const streamerMesh = new THREE.Mesh(streamerGeo, streamerMat);
    streamerMesh.position.set(0, 0.35, 1.8);
    streamerMesh.rotation.y = Math.PI / 2;
    this.shipMastPennantGroup.add(streamerMesh);
    this.shipGroup.add(this.shipMastPennantGroup);

    // Floating Wind Breeze Streamers over Fjord Waters
    this.windStreamersGroup = new THREE.Group();
    for (let i = 0; i < 20; i++) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 10),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.4,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.position.set(
        -90 + Math.random() * 220,
        0.8 + Math.random() * 5.5,
        -40 + Math.random() * 230
      );
      this.windStreamersGroup.add(line);
    }
    this.scene.add(this.windStreamersGroup);

    this.updateShipCustomization(this.currentShipCustomization);

    // Steering Helm
    const helmGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.4, 8);
    const helm = new THREE.Mesh(helmGeo, new THREE.MeshStandardMaterial({ color: 0x27190e }));
    helm.position.set(0, 5, -12);
    helm.rotation.x = Math.PI / 4;
    this.shipGroup.add(helm);

    // Port & Starboard Runic Frost-Ballista Turrets for Multi-Crew Naval Combat
    [-3.8, 3.8].forEach((sideX) => {
      const turretGroup = new THREE.Group();
      turretGroup.position.set(sideX, 3.9, 5.5);
      turretGroup.rotation.y = sideX < 0 ? -Math.PI / 3 : Math.PI / 3;

      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.85, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75 })
      );
      pedestal.position.y = 0.7;
      turretGroup.add(pedestal);

      const bowLimb = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.25, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 })
      );
      bowLimb.position.set(0, 1.55, 0.8);
      turretGroup.add(bowLimb);

      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.35, 2.6),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      rail.position.set(0, 1.45, 0.2);
      turretGroup.add(rail);

      this.shipGroup?.add(turretGroup);
    });

    this.scene.add(this.shipGroup);

    // Add interactive prompt for ship helm
    this.interactiveObjects.push({
      id: 'ship_helm',
      type: 'ship_helm',
      mesh: helm,
      position: new THREE.Vector3(22, 2, 83),
      health: 999,
      maxHealth: 999,
      name: 'Viking Warship Drakkar',
      interactionPrompt: 'Press E to Mount/Steer Ship',
    });

    // Glowing Golden Runic Beacon Pillar at Katfjord Pier for onboarding & waypoint guidance
    this.pierWaypointBeacon = new THREE.Group();
    this.pierWaypointBeacon.position.set(22, 1.5, 83);
    this.pierWaypointBeacon.visible = false;

    // Vertical ethereal golden beam of light
    const beaconBeamMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const beaconBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 1.6, 36, 16, 1, true),
      beaconBeamMat
    );
    beaconBeam.position.y = 18;
    this.pierWaypointBeacon.add(beaconBeam);

    // Glowing concentric ground rings on wooden pier
    const beaconRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const beaconRing = new THREE.Mesh(
      new THREE.RingGeometry(1.8, 2.4, 32),
      beaconRingMat
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.y = 0.2;
    this.pierWaypointBeacon.add(beaconRing);

    // Floating rotating runic diamond beacon marker
    const beaconGlyphMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.85,
      metalness: 0.8,
      roughness: 0.2,
    });
    const beaconGlyph = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.2, 0),
      beaconGlyphMat
    );
    beaconGlyph.position.y = 3.8;
    this.pierWaypointBeacon.add(beaconGlyph);

    this.scene.add(this.pierWaypointBeacon);
  }

  /**
   * Rival Frost Outpost (Hostile Camp across the Fjord on the Isle)
   */
  private buildRivalOutpost() {
    const outpostGroup = new THREE.Group();
    outpostGroup.position.set(40, 3, 230);

    // Wooden stockade tents
    const tentMat = new THREE.MeshStandardMaterial({ color: 0x3b4d66, roughness: 0.85 });
    const tent = new THREE.Mesh(new THREE.ConeGeometry(7, 8, 4), tentMat);
    tent.position.set(0, 4, 0);
    tent.castShadow = true;
    outpostGroup.add(tent);

    // Outpost Watchtower
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(6, 16, 6),
      new THREE.MeshStandardMaterial({ color: 0x382215 })
    );
    tower.position.set(15, 8, 12);
    tower.castShadow = true;
    outpostGroup.add(tower);

    // Frostfang Clan Flag (Icy blue dragon emblem)
    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    flag.position.set(15, 16, 12);
    outpostGroup.add(flag);

    // Treasure Chest with Relic
    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.7 })
    );
    chest.position.set(-10, 1, -5);
    chest.castShadow = true;
    outpostGroup.add(chest);

    this.scene.add(outpostGroup);

    this.interactiveObjects.push({
      id: 'relic_chest',
      type: 'chest',
      mesh: chest,
      position: new THREE.Vector3(30, 3, 225),
      health: 100,
      maxHealth: 100,
      name: 'Frostfang Golden Relic',
      interactionPrompt: 'Press E to Loot Relic',
    });

    // King of the Hill Territory Capture Banner
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 11, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 })
    );
    pole.position.set(24, 8.5, 214);
    this.scene.add(pole);

    this.territoryFlagMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3.2, 5.2),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d, emissiveIntensity: 0.35 })
    );
    this.territoryFlagMesh.position.set(24, 12.2, 216.5);
    this.scene.add(this.territoryFlagMesh);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(4.2, 4.8, 24),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(24, 3.08, 214);
    this.scene.add(ring);

    this.interactiveObjects.push({
      id: 'outpost_territory_flag',
      type: 'territory_flag',
      mesh: this.territoryFlagMesh,
      position: new THREE.Vector3(24, 3, 214),
      health: 100,
      maxHealth: 100,
      name: 'Frostfang Territory Banner',
      interactionPrompt: 'Press E to Capture Territory for Clan (+Honor)',
    });
  }

  public setTerritoryCaptured(captured: boolean) {
    if (!this.territoryFlagMesh) return;
    const mat = this.territoryFlagMesh.material as THREE.MeshStandardMaterial;
    if (!mat || !('color' in mat) || !mat.color) return;
    if (captured) {
      mat.color.setHex(0xfacc15);
      if (mat.emissive) mat.emissive.setHex(0xca8a04);
    } else {
      mat.color.setHex(0xef4444);
      if (mat.emissive) mat.emissive.setHex(0x7f1d1d);
    }
  }

  /**
   * Valhalla Sky Obby (Floating Parkour Obstacle Course in the Clouds)
   */
  private buildSkyObbyCourse() {
    const obbyGroup = new THREE.Group();

    // Bifrost Entry Pad in Katfjord Village (x: -22, y: 3.1, z: 12)
    const startPad = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.5, 0.5, 16),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        metalness: 0.6,
        roughness: 0.2,
      })
    );
    startPad.position.set(-22, 3.25, 12);
    obbyGroup.add(startPad);

    // Ascending floating sky steps
    const steps: Array<{ x: number; y: number; z: number; w: number; d: number; color: number }> = [
      { x: -22, y: 5.2, z: 4, w: 5.5, d: 5.5, color: 0x38bdf8 },
      { x: -25, y: 7.6, z: -4, w: 5.0, d: 5.0, color: 0x60a5fa },
      { x: -20, y: 10.0, z: -12, w: 4.8, d: 4.8, color: 0x818cf8 },
      { x: -14, y: 12.4, z: -18, w: 4.6, d: 4.6, color: 0xa78bfa },
      { x: -19, y: 14.8, z: -25, w: 4.5, d: 4.5, color: 0xc084fc },
      { x: -26, y: 17.2, z: -31, w: 4.5, d: 4.5, color: 0xe879f9 },
      { x: -21, y: 19.6, z: -38, w: 4.4, d: 4.4, color: 0xf472b6 },
      { x: -14, y: 22.0, z: -44, w: 4.4, d: 4.4, color: 0xfb7185 },
      { x: -18, y: 24.5, z: -51, w: 5.0, d: 5.0, color: 0xfbbf24 },
      // Summit Sanctuary Platform
      { x: -18, y: 27.0, z: -61, w: 12.0, d: 12.0, color: 0xfacc15 },
    ];

    steps.forEach((st) => {
      const thickness = 0.9;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(st.w, thickness, st.d),
        new THREE.MeshStandardMaterial({
          color: st.color,
          emissive: st.color,
          emissiveIntensity: 0.25,
          roughness: 0.3,
          metalness: 0.5,
        })
      );
      mesh.position.set(st.x, st.y - thickness / 2, st.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      obbyGroup.add(mesh);

      this.obbyPlatforms.push({
        x: st.x,
        y: st.y,
        z: st.z,
        halfW: st.w / 2 + 0.35,
        halfD: st.d / 2 + 0.35,
      });
    });

    // Golden Summit Chest at top of Valhalla Sky Obby
    const summitChest = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.0, 2.0),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xca8a04,
        emissiveIntensity: 0.5,
        metalness: 0.9,
        roughness: 0.15,
      })
    );
    summitChest.position.set(-18, 28.0, -63);
    obbyGroup.add(summitChest);

    // Golden pillars on summit
    [-4.5, 4.5].forEach((px) => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.8, roughness: 0.2 })
      );
      pillar.position.set(-18 + px, 30.0, -64);
      obbyGroup.add(pillar);
    });

    this.scene.add(obbyGroup);

    this.interactiveObjects.push({
      id: 'obby_summit_chest',
      type: 'obby_chest',
      mesh: summitChest,
      position: new THREE.Vector3(-18, 27.2, -63),
      health: 100,
      maxHealth: 100,
      name: 'Valhalla Sky Obby Chest',
      interactionPrompt: 'Press E to Claim Sky Walker Spoils (+800 Silver)',
    });
  }

  /**
   * Katfjord Village Tycoon Plot & Collector Pad
   */
  private buildTycoonPlot() {
    this.scene.add(this.tycoonGroup);

    // Glowing Green Tycoon Treasury Collector Pad (x: 16, y: 3.15, z: 16)
    const padGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.4, 20);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.65,
      metalness: 0.5,
      roughness: 0.25,
    });
    this.tycoonPadMesh = new THREE.Mesh(padGeo, padMat);
    this.tycoonPadMesh.position.set(16, 3.2, 16);
    this.scene.add(this.tycoonPadMesh);

    this.interactiveObjects.push({
      id: 'tycoon_collector_pad',
      type: 'tycoon_pad',
      mesh: this.tycoonPadMesh,
      position: new THREE.Vector3(16, 3.2, 16),
      health: 100,
      maxHealth: 100,
      name: 'Tycoon Treasury Collector',
      interactionPrompt: 'Press E (or Step On Pad) to Collect Tycoon Silver',
    });

    this.updateTycoonStructures(INITIAL_TYCOON_BUILDINGS);
  }

  public updateTycoonStructures(buildings: TycoonBuilding[]) {
    this.tycoonGroup.clear();

    buildings.forEach((b) => {
      const bx = b.position.x;
      const bz = b.position.z;

      // Foundation pad
      const basePad = new THREE.Mesh(
        new THREE.BoxGeometry(7, 0.4, 7),
        new THREE.MeshStandardMaterial({
          color: b.level > 0 ? 0x64748b : 0x334155,
          roughness: 0.8,
        })
      );
      basePad.position.set(bx, 3.2, bz);
      this.tycoonGroup.add(basePad);

      if (b.level <= 0) return;

      const heightBoost = b.level * 1.2;

      if (b.id === 'tycoon_lumber_mill') {
        const mill = new THREE.Mesh(
          new THREE.BoxGeometry(5, 3.2 + heightBoost, 5),
          new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75 })
        );
        mill.position.set(bx, 3.4 + (3.2 + heightBoost) / 2, bz);
        mill.castShadow = true;
        this.tycoonGroup.add(mill);

        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(2.2, 2.2, 0.6, 12),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4 })
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(bx + 2.8, 5.2, bz);
        this.tycoonGroup.add(wheel);
      } else if (b.id === 'tycoon_runic_forge') {
        const smelter = new THREE.Mesh(
          new THREE.CylinderGeometry(2.2, 2.8, 4.0 + heightBoost, 8),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.4 })
        );
        smelter.position.set(bx, 3.4 + (4.0 + heightBoost) / 2, bz);
        smelter.castShadow = true;
        this.tycoonGroup.add(smelter);

        const core = new THREE.Mesh(
          new THREE.SphereGeometry(1.1, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        core.position.set(bx, 4.5 + heightBoost, bz);
        this.tycoonGroup.add(core);
      } else if (b.id === 'tycoon_mead_hall') {
        const hall = new THREE.Mesh(
          new THREE.BoxGeometry(6, 3.8 + heightBoost, 5.5),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
        );
        hall.position.set(bx, 3.4 + (3.8 + heightBoost) / 2, bz);
        hall.castShadow = true;
        this.tycoonGroup.add(hall);

        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(4.8, 3.2, 4),
          new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 })
        );
        roof.rotation.y = Math.PI / 4;
        roof.position.set(bx, 3.4 + 3.8 + heightBoost + 1.5, bz);
        this.tycoonGroup.add(roof);
      } else if (b.id === 'tycoon_allfather_sanctum') {
        const obelisk = new THREE.Mesh(
          new THREE.ConeGeometry(2.0, 6.5 + heightBoost * 1.5, 6),
          new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0xca8a04,
            emissiveIntensity: 0.4,
            metalness: 0.9,
            roughness: 0.15,
          })
        );
        obelisk.position.set(bx, 3.4 + (6.5 + heightBoost * 1.5) / 2, bz);
        obelisk.castShadow = true;
        this.tycoonGroup.add(obelisk);
      }
    });
  }

  /**
   * Spawn dramatic vertical Lightning Bolt + Shockwave for Thor's Lightning Leap Skill
   */
  public triggerLightningBoltAt(pos: THREE.Vector3) {
    this.triggerBossShockwave(pos);
    this.spawnCombatSparks(new THREE.Vector3(pos.x, pos.y + 1.5, pos.z), 'frost');
    this.spawnCombatSparks(new THREE.Vector3(pos.x, pos.y + 2.5, pos.z), 'sparks');

    const boltGeo = new THREE.CylinderGeometry(0.35, 0.8, 45, 8);
    const boltMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.95,
    });
    const bolt = new THREE.Mesh(boltGeo, boltMat);
    bolt.position.set(pos.x, pos.y + 22, pos.z);
    this.scene.add(bolt);

    setTimeout(() => {
      this.scene.remove(bolt);
      boltGeo.dispose();
      boltMat.dispose();
    }, 260);
  }

  /**
   * Helper to create a classic wooden & iron rim round shield
   */
  public createRoundShield(centerColor: number = 0xb83227, bossColor: number = 0x222222): THREE.Group {
    const group = new THREE.Group();

    // Wood body
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 0.25, 12),
      new THREE.MeshStandardMaterial({ color: centerColor, roughness: 0.7 })
    );
    disc.rotation.x = Math.PI / 2;
    group.add(disc);

    // Iron Boss (center knob)
    const boss = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshStandardMaterial({ color: bossColor, metalness: 0.8, roughness: 0.3 })
    );
    boss.scale.z = 0.5;
    boss.position.z = 0.2;
    group.add(boss);

    // Iron rim
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.12, 6, 16),
      new THREE.MeshStandardMaterial({ color: bossColor, metalness: 0.8 })
    );
    group.add(rim);

    return group;
  }

  /**
   * Procedural canvas texture generator for authentic Viking longship square sails
   */
  private createSailCanvasTexture(sailItem: any): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const color1 = sailItem?.sailColor || '#cc2929';
    const color2 = sailItem?.sailStripeColor || '#f8fafc';

    // 8 vertical panels
    const stripeW = canvas.width / 8;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? color1 : color2;
      ctx.fillRect(i * stripeW, 0, stripeW, canvas.height);
    }

    // Realistic woven linen thread crosshatch
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
    for (let x = 0; x < canvas.width; x += 4) {
      ctx.fillRect(x, 0, 1, canvas.height);
    }

    // Border stitching and corner leather reinforcements
    ctx.strokeStyle = '#27190e';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    // Corner grommets
    const grommets = [
      [12, 12],
      [canvas.width - 12, 12],
      [12, canvas.height - 12],
      [canvas.width - 12, canvas.height - 12],
    ];
    grommets.forEach(([gx, gy]) => {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(gx, gy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(gx, gy, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Central runic emblem
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const emblem = sailItem?.sailEmblem || 'crossed_axes';

    // Decorative emblem outer medallion ring
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.arc(cx, cy, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Inner emblem drawing
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (emblem === 'raven') {
      // Raven of Odin
      ctx.beginPath();
      ctx.arc(cx, cy - 14, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy - 18);
      ctx.lineTo(cx + 32, cy - 14);
      ctx.lineTo(cx + 8, cy - 10);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 24, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wings spread
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy);
      ctx.quadraticCurveTo(cx - 48, cy - 24, cx - 40, cy + 14);
      ctx.quadraticCurveTo(cx - 28, cy + 18, cx - 10, cy + 10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 15, cy);
      ctx.quadraticCurveTo(cx + 48, cy - 24, cx + 40, cy + 14);
      ctx.quadraticCurveTo(cx + 28, cy + 18, cx + 10, cy + 10);
      ctx.fill();
    } else if (emblem === 'valkyrie_wings') {
      // Golden Sunburst & Valkyrie wings
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22);
        ctx.lineTo(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44);
        ctx.stroke();
      }
    } else if (emblem === 'frost_snowflake') {
      // Runic ice snowflake
      for (let a = 0; a < Math.PI; a += Math.PI / 3) {
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(a) * 40, cy - Math.sin(a) * 40);
        ctx.lineTo(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.stroke();
    } else if (emblem === 'serpent_coil') {
      // Midgard serpent coils
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 1.6);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#34d399';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 18, Math.PI * 0.8, Math.PI * 2.3);
      ctx.stroke();
    } else if (emblem === 'runic_skull') {
      // Horned Norse skull
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 12, cy + 8, 24, 14);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx - 7, cy - 6, 5, 0, Math.PI * 2);
      ctx.arc(cx + 7, cy - 6, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Crossed Viking battle axes
      ctx.beginPath();
      ctx.moveTo(cx - 28, cy + 28);
      ctx.lineTo(cx + 28, cy - 28);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#78350f';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 28, cy + 28);
      ctx.lineTo(cx - 28, cy - 28);
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(cx + 24, cy - 24, 11, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - 24, cy - 24, 11, 0, Math.PI);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  /**
   * Calculate current wind and sailing efficiency metrics
   */
  public getWindSailingStats(): WindSailingStats {
    let relWind = this.windAngle - this.shipRotation;
    while (relWind > Math.PI) relWind -= Math.PI * 2;
    while (relWind < -Math.PI) relWind += Math.PI * 2;

    const absRel = Math.abs(relWind);
    let pointOfSail = 'Running (Downwind)';
    let windEfficiency = 1.0;

    if (absRel < Math.PI * 0.28) {
      pointOfSail = 'Running (Downwind)';
      windEfficiency = 1.35;
    } else if (absRel < Math.PI * 0.65) {
      pointOfSail = 'Broad Reach (Crosswind)';
      windEfficiency = 1.25;
    } else if (absRel < Math.PI * 0.82) {
      pointOfSail = 'Close-Hauled (Beating)';
      windEfficiency = 0.75;
    } else {
      pointOfSail = 'In Irons (Headwind)';
      windEfficiency = 0.35;
    }

    const gust = 1.0 + Math.sin(this.windGustTime * 1.5) * 0.15;
    const knots = Math.round(this.windBaseSpeed * (this.weather === 'stormy' ? 1.5 : 1.0) * gust);

    return {
      windAngle: this.windAngle,
      windSpeedKnots: knots,
      relativeWindAngle: relWind,
      windEfficiency,
      pointOfSail,
      tackAngle: this.sailTackAngle,
      billowDepth: this.sailBillowDepth,
    };
  }

  public getWindEfficiency(): number {
    return this.getWindSailingStats().windEfficiency;
  }

  /**
   * Smoothly moves the camera to cinematic showcase positions for onboarding
   */
  public setCinematicCamera(pos: THREE.Vector3, target: THREE.Vector3, instant = false): void {
    this.isCinematicActive = true;
    this.targetCinematicPos.copy(pos);
    this.targetCinematicTarget.copy(target);
    if (instant || this.cinematicCamPos.lengthSq() === 0) {
      this.cinematicCamPos.copy(pos);
      this.cinematicCamTarget.copy(target);
      this.camera.position.copy(pos);
      this.camera.lookAt(target);
    }
  }

  public clearCinematicCamera(): void {
    this.isCinematicActive = false;
  }

  public setPierWaypointActive(active: boolean): void {
    this.isTrackingPierWaypoint = active;
    if (this.pierWaypointBeacon) {
      this.pierWaypointBeacon.visible = active;
    }
  }

  /**
   * Dynamically customize Drakkar Longship Sail patterns, Hull Gunwale shields, and Bow Figureheads
   */
  public updateShipCustomization(customization: DrakkarCustomization): void {
    this.currentShipCustomization = { ...customization };
    if (!this.shipGroup) return;

    // 1. UPDATE SAIL PATTERN & DEFORMABLE WEBGL BILLOWING MESH
    this.shipSailGroup.clear();
    const sailItem = getNavalItemById(customization.sailId) || getNavalItemById('sail_crimson_raider');

    // Horizontal Sail Yard Beam at top of sail (Y = 18)
    const yard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.42, 18, 8),
      new THREE.MeshStandardMaterial({ color: 0x3b2415, roughness: 0.75 })
    );
    yard.rotation.z = Math.PI / 2;
    yard.position.set(0, 18, 0);
    yard.castShadow = true;
    this.shipSailYardMesh = yard;
    this.shipSailGroup.add(yard);

    // Deformable 3D Square Sail Plane (24 subdivisions x 16 subdivisions)
    const sailGeo = new THREE.PlaneGeometry(16, 12, 24, 16);
    this.sailBasePositions = sailGeo.attributes.position.array.slice() as Float32Array;

    const sailTexture = this.createSailCanvasTexture(sailItem);
    const sailMat = new THREE.MeshStandardMaterial({
      map: sailTexture,
      roughness: 0.88,
      metalness: 0.05,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    const sailPlane = new THREE.Mesh(sailGeo, sailMat);
    sailPlane.position.set(0, 12, 0);
    sailPlane.castShadow = true;
    this.shipSailPlaneMesh = sailPlane;
    this.shipSailGroup.add(sailPlane);

    // Dynamic Rigging Ropes (Braces & Sheets from yard and sail corners to deck)
    const ropeMat = new THREE.LineBasicMaterial({ color: 0x27190e });
    const leftSheet = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-8, 6, 0), new THREE.Vector3(-4.8, 3.6, -6)]),
      ropeMat
    );
    this.shipLeftSheet = leftSheet;
    this.shipSailGroup.add(leftSheet);
    const rightSheet = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(8, 6, 0), new THREE.Vector3(4.8, 3.6, -6)]),
      ropeMat
    );
    this.shipRightSheet = rightSheet;
    this.shipSailGroup.add(rightSheet);

    // 2. UPDATE HULL SHIELDS
    this.shipShieldsGroup.clear();
    const shieldsItem = getNavalItemById(customization.shieldsId) || getNavalItemById('shields_clan_iron');
    const colorAHex = shieldsItem?.shieldColorA ? parseInt(shieldsItem.shieldColorA.replace('#', '0x'), 16) : 0xdc2626;
    const colorBHex = shieldsItem?.shieldColorB ? parseInt(shieldsItem.shieldColorB.replace('#', '0x'), 16) : 0xd97706;
    const bossHex = shieldsItem?.shieldBossColor ? parseInt(shieldsItem.shieldBossColor.replace('#', '0x'), 16) : 0xcbd5e1;

    for (let s = -12; s <= 12; s += 4) {
      const useColorA = s % 8 === 0;
      const shieldL = this.createRoundShield(useColorA ? colorAHex : colorBHex, bossHex);
      shieldL.position.set(-5.2, 3.6, s);
      shieldL.rotation.y = -Math.PI / 2;
      this.shipShieldsGroup.add(shieldL);

      const shieldR = this.createRoundShield(useColorA ? colorBHex : colorAHex, bossHex);
      shieldR.position.set(5.2, 3.6, s);
      shieldR.rotation.y = Math.PI / 2;
      this.shipShieldsGroup.add(shieldR);
    }

    // 3. UPDATE BOW FIGUREHEAD
    this.shipFigureheadGroup.clear();
    const figItem = getNavalItemById(customization.figureheadId) || getNavalItemById('fig_drakkar_dragon');
    const figColorHex = figItem?.figureheadColor ? parseInt(figItem.figureheadColor.replace('#', '0x'), 16) : 0xa64424;
    const emissiveHex = figItem?.emissiveColor ? parseInt(figItem.emissiveColor.replace('#', '0x'), 16) : 0x7c2d12;
    const figType = figItem?.figureheadType || 'dragon';

    const figureheadMat = new THREE.MeshStandardMaterial({
      color: figColorHex,
      roughness: 0.65,
      metalness: figItem?.rarity === 'mythic' || figItem?.rarity === 'legendary' ? 0.6 : 0.2,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: emissiveHex,
      emissive: emissiveHex,
      emissiveIntensity: 1.4,
    });

    const prowAnchor = new THREE.Group();
    prowAnchor.position.set(0, 10.5, 19.5);

    if (figType === 'dragon') {
      // Main dragon head snout
      const mainHead = new THREE.Mesh(new THREE.BoxGeometry(3, 3.8, 3.6), figureheadMat);
      mainHead.castShadow = true;
      prowAnchor.add(mainHead);

      // Upper jaw snout extending forward
      const snout = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 3.2), figureheadMat);
      snout.position.set(0, -0.6, 2.8);
      snout.castShadow = true;
      prowAnchor.add(snout);

      // Left and right curved horns
      [-1.4, 1.4].forEach((sideX) => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.8, 6), figureheadMat);
        horn.position.set(sideX, 2.2, -0.8);
        horn.rotation.x = -Math.PI / 4;
        horn.rotation.z = sideX > 0 ? -Math.PI / 8 : Math.PI / 8;
        horn.castShadow = true;
        prowAnchor.add(horn);
      });

      // Glowing Runic Eyes
      [-1.1, 1.1].forEach((sideX) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), eyeMat);
        eye.position.set(sideX, 0.4, 1.4);
        prowAnchor.add(eye);
      });
    } else if (figType === 'wolf') {
      // Fenrir wolf head
      const wolfBase = new THREE.Mesh(new THREE.BoxGeometry(3, 3.6, 3.4), figureheadMat);
      prowAnchor.add(wolfBase);

      const wolfMuzzle = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 3.5), figureheadMat);
      wolfMuzzle.position.set(0, -0.6, 2.7);
      prowAnchor.add(wolfMuzzle);

      // Pointed ears
      [-1.1, 1.1].forEach((sideX) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.2, 5), figureheadMat);
        ear.position.set(sideX, 2.4, -0.5);
        prowAnchor.add(ear);
      });

      // Iron fangs
      const fangMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.8 });
      [-0.7, 0.7].forEach((sideX) => {
        const fang = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.9, 4), fangMat);
        fang.position.set(sideX, -1.6, 3.6);
        fang.rotation.x = Math.PI;
        prowAnchor.add(fang);
      });

      // Glowing Cyan / Ice Eyes
      [-0.95, 0.95].forEach((sideX) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), eyeMat);
        eye.position.set(sideX, 0.35, 1.5);
        prowAnchor.add(eye);
      });
    } else if (figType === 'raven') {
      // Odin's Raven
      const ravenHead = new THREE.Mesh(new THREE.SphereGeometry(1.8, 10, 10), figureheadMat);
      prowAnchor.add(ravenHead);

      // Curved downward beak
      const beakMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.6, 6), beakMat);
      beak.rotation.x = Math.PI / 2.3;
      beak.position.set(0, -0.4, 2.8);
      prowAnchor.add(beak);

      // Side feather ruffs
      [-1.3, 1.3].forEach((sideX) => {
        const wingPlume = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, 3.0), figureheadMat);
        wingPlume.position.set(sideX, 0.8, -0.8);
        wingPlume.rotation.z = sideX > 0 ? -0.3 : 0.3;
        prowAnchor.add(wingPlume);
      });

      // Amber glowing eyes
      [-1.1, 1.1].forEach((sideX) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), eyeMat);
        eye.position.set(sideX, 0.5, 1.2);
        prowAnchor.add(eye);
      });
    } else if (figType === 'ram') {
      // Thor's Battering Ram
      const ramSkull = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.0, 3.5), figureheadMat);
      prowAnchor.add(ramSkull);

      // Front iron bumper / reinforced ram face
      const bumperMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
      const bumper = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 1.2, 8), bumperMat);
      bumper.rotation.x = Math.PI / 2;
      bumper.position.set(0, 0, 2.2);
      prowAnchor.add(bumper);

      // Curled ram horns on both sides
      [-1.7, 1.7].forEach((sideX) => {
        const hornTorus = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.45, 8, 16, Math.PI * 1.3), figureheadMat);
        hornTorus.position.set(sideX, 0.8, 0);
        hornTorus.rotation.y = sideX > 0 ? Math.PI / 2 : -Math.PI / 2;
        hornTorus.rotation.z = Math.PI / 4;
        prowAnchor.add(hornTorus);
      });

      // Glowing golden runes on forehead
      const runeLight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.3), eyeMat);
      runeLight.position.set(0, 1.4, 1.8);
      prowAnchor.add(runeLight);
    } else if (figType === 'serpent') {
      // Jörmungandr Sea Serpent
      const serpentHead = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 3.6, 8), figureheadMat);
      serpentHead.rotation.x = Math.PI / 3;
      serpentHead.position.set(0, 0.5, 0.8);
      prowAnchor.add(serpentHead);

      const snakeSnout = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.2, 8), figureheadMat);
      snakeSnout.rotation.x = Math.PI / 2.2;
      snakeSnout.position.set(0, -0.4, 3.2);
      prowAnchor.add(snakeSnout);

      // Flared cobra hood flaps
      [-1.6, 1.6].forEach((sideX) => {
        const hood = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.6, 2.4), figureheadMat);
        hood.position.set(sideX, 0.4, -0.2);
        hood.rotation.y = sideX > 0 ? -0.4 : 0.4;
        prowAnchor.add(hood);
      });

      // Emerald glowing eyes
      [-1.1, 1.1].forEach((sideX) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), eyeMat);
        eye.position.set(sideX, 0.5, 2.0);
        prowAnchor.add(eye);
      });
    } else if (figType === 'valkyrie') {
      // Golden Winged Valkyrie Maiden
      const maidenHead = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 10), figureheadMat);
      prowAnchor.add(maidenHead);

      // Golden winged helmet
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 });
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.6, 10), crownMat);
      crown.position.set(0, 1.2, 0);
      prowAnchor.add(crown);

      // Swept wings
      [-1.6, 1.6].forEach((sideX) => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 2.6), crownMat);
        wing.position.set(sideX, 1.4, -1.0);
        wing.rotation.x = -Math.PI / 6;
        wing.rotation.z = sideX > 0 ? -0.3 : 0.3;
        prowAnchor.add(wing);
      });

      // Sun halo disc with radiant emissive glow
      const halo = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.2, 8, 20), eyeMat);
      halo.position.set(0, 0.8, -0.8);
      prowAnchor.add(halo);
    }

    this.shipFigureheadGroup.add(prowAnchor);
  }

  /**
   * Build wooden barricade at position (using Hammer tool)
   */
  public placeBarricade(position: THREE.Vector3, yRot: number): THREE.Mesh {
    const barricadeGeo = new THREE.BoxGeometry(5, 3.5, 1.2);
    const barricadeMat = new THREE.MeshStandardMaterial({
      color: 0x4a2a16,
      roughness: 0.85,
    });
    const mesh = new THREE.Mesh(barricadeGeo, barricadeMat);
    mesh.position.copy(position);
    mesh.position.y += 1.75;
    mesh.rotation.y = yRot;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.placedBarricades.push(mesh);
    return mesh;
  }

  /**
   * Clear any active campaign fortifications from scene
   */
  public clearCampaignFortifications() {
    this.campaignBarricades.forEach((b) => {
      this.scene.remove(b.group);
      if (b.sprite) this.scene.remove(b.sprite);
    });
    this.campaignBarricades = [];
  }

  /**
   * Setup authentic campaign destructible fortifications & palisades
   */
  public setupCampaignFortifications(battleId: BattleId) {
    // Clean up existing campaign barricades
    this.clearCampaignFortifications();

    const barricadeConfigs: { id: string; name: string; pos: THREE.Vector3; rot: number; health: number }[] = [];

    if (battleId === 'frostfang_siege') {
      barricadeConfigs.push(
        { id: 'ff_gate_1', name: 'Beachhead Spiked Stockade', pos: new THREE.Vector3(26, 3, 202), rot: 0.2, health: 70 },
        { id: 'ff_gate_2', name: 'Palisade Defense Gate', pos: new THREE.Vector3(38, 3, 198), rot: 0, health: 90 },
        { id: 'ff_gate_3', name: 'Iron-Bound Perimeter Wall', pos: new THREE.Vector3(50, 3, 204), rot: -0.25, health: 70 }
      );
    } else if (battleId === 'katfjord_defense') {
      barricadeConfigs.push(
        { id: 'kd_gate_1', name: 'Raider Assault Barricade', pos: new THREE.Vector3(-4, 3, 34), rot: 0.12, health: 65 },
        { id: 'kd_gate_2', name: 'Siege Spiked Barrier', pos: new THREE.Vector3(8, 3, 34), rot: -0.15, health: 65 }
      );
    } else if (battleId === 'glacial_stronghold') {
      barricadeConfigs.push(
        { id: 'gs_gate_1', name: 'Highland Outer Gate', pos: new THREE.Vector3(30, 3, 218), rot: 0.3, health: 80 },
        { id: 'gs_gate_2', name: 'Citadel Palisade Wall', pos: new THREE.Vector3(42, 3, 215), rot: 0, health: 100 },
        { id: 'gs_gate_3', name: 'Iron Stronghold Barricade', pos: new THREE.Vector3(54, 3, 220), rot: -0.28, health: 80 }
      );
    } else if (battleId === 'rune_ambush') {
      barricadeConfigs.push(
        { id: 'ra_gate_1', name: 'Desecrator Pine Barricade', pos: new THREE.Vector3(-32, 3, 6), rot: 0.35, health: 60 },
        { id: 'ra_gate_2', name: 'Runic Trail Barrier', pos: new THREE.Vector3(-36, 3, 18), rot: -0.3, health: 60 }
      );
    }

    barricadeConfigs.forEach((cfg) => {
      const group = new THREE.Group();
      group.position.copy(cfg.pos);
      group.rotation.y = cfg.rot;

      // Heavy wooden logs with pointed spikes
      const logMat = new THREE.MeshStandardMaterial({ color: 0x452312, roughness: 0.85 });
      const spikeMat = new THREE.MeshStandardMaterial({ color: 0x331a0d, roughness: 0.8 });
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.4 });

      // 5 Vertical logs
      for (let i = -2; i <= 2; i++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 4.2, 8), logMat);
        log.position.set(i * 0.9, 2.1, (Math.random() - 0.5) * 0.2);
        log.castShadow = true;
        group.add(log);

        // Pointed spike cap
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 8), spikeMat);
        spike.position.set(i * 0.9, 4.6, log.position.z);
        group.add(spike);
      }

      // Horizontal crossbeams
      const cross1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 0.4), logMat);
      cross1.position.set(0, 1.5, 0.35);
      group.add(cross1);

      const cross2 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 0.4), logMat);
      cross2.position.set(0, 3.2, 0.35);
      group.add(cross2);

      // Iron strapping bands
      const ironBand1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.15, 0.45), ironMat);
      ironBand1.position.set(0, 1.5, 0.36);
      group.add(ironBand1);

      const ironBand2 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.15, 0.45), ironMat);
      ironBand2.position.set(0, 3.2, 0.36);
      group.add(ironBand2);

      // Diagonal cross-brace
      const diag = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.3, 0.3), logMat);
      diag.position.set(0, 2.35, -0.3);
      diag.rotation.z = Math.PI / 4.5;
      group.add(diag);

      this.scene.add(group);

      // Overhead Roblox Billboard Health Bar
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      this.drawBarricadeHealthBar(ctx, canvas.width, canvas.height, cfg.name, 1.0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(4.5, 1.2, 1.0);
      sprite.position.copy(cfg.pos);
      sprite.position.y += 5.8;
      this.scene.add(sprite);

      this.campaignBarricades.push({
        id: cfg.id,
        name: cfg.name,
        group,
        position: cfg.pos,
        health: cfg.health,
        maxHealth: cfg.health,
        sprite,
        canvas,
        texture,
        isDestroyed: false,
      });
    });
  }

  private drawBarricadeHealthBar(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    name: string,
    pct: number
  ) {
    ctx.clearRect(0, 0, w, h);

    // Pill background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(10, 8, w - 20, h - 16, 8);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Name label
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, w / 2, 26);

    // Health bar track
    const barX = 22;
    const barY = 34;
    const barW = w - 44;
    const barH = 12;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barW, barH);

    // Fill
    const fillW = Math.max(0, barW * pct);
    ctx.fillStyle = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(barX, barY, fillW, barH);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);
  }

  /**
   * Apply damage to a campaign barricade
   */
  public damageBarricade(barricade: DestructibleBarricade, amount: number): boolean {
    if (barricade.isDestroyed) return false;

    barricade.health = Math.max(0, barricade.health - amount);
    const pct = barricade.health / barricade.maxHealth;

    // Shake barricade mesh
    barricade.group.position.x += (Math.random() - 0.5) * 0.4;
    setTimeout(() => {
      barricade.group.position.x = barricade.position.x;
    }, 70);

    // Spawn wood chip splinters
    this.spawnCombatSparks(
      new THREE.Vector3(barricade.position.x, barricade.position.y + 2.5, barricade.position.z),
      'wood'
    );

    // Update sprite
    const ctx = barricade.canvas.getContext('2d')!;
    this.drawBarricadeHealthBar(ctx, barricade.canvas.width, barricade.canvas.height, barricade.name, pct);
    barricade.texture.needsUpdate = true;

    if (barricade.health <= 0) {
      barricade.isDestroyed = true;
      sound.playBarricadeBreak();

      // Splinter burst animation
      this.spawnCombatSparks(
        new THREE.Vector3(barricade.position.x, barricade.position.y + 2.5, barricade.position.z),
        'wood'
      );
      this.spawnCombatSparks(
        new THREE.Vector3(barricade.position.x, barricade.position.y + 3.5, barricade.position.z),
        'wood'
      );

      this.scene.remove(barricade.group);
      if (barricade.sprite) {
        this.scene.remove(barricade.sprite);
      }
      return true; // Successfully destroyed
    }
    return false;
  }

  /**
   * Spawn 3D directional combat sparks / wood chips / blood puffs
   */
  public spawnCombatSparks(pos: THREE.Vector3, type: 'sparks' | 'wood' | 'blood' | 'frost' = 'sparks') {
    const count = type === 'wood' ? 24 : 16;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      velocities[i * 3] = (Math.random() - 0.5) * (type === 'sparks' ? 12 : 7);
      velocities[i * 3 + 1] = Math.random() * (type === 'sparks' ? 9 : 6) + 1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * (type === 'sparks' ? 12 : 7);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    let color = 0xfacc15; // Golden sparks
    let size = 0.35;
    if (type === 'wood') {
      color = 0x854d0e;
      size = 0.5;
    } else if (type === 'blood') {
      color = 0xdc2626;
      size = 0.4;
    } else if (type === 'frost') {
      color = 0x38bdf8;
      size = 0.45;
    }

    const mat = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.combatParticles.push({
      points,
      velocities,
      positions,
      life: 0.45,
      maxLife: 0.45,
    });
  }

  /**
   * Trigger Boss Ground Stomp expanding Frost Shockwave Ring
   */
  public triggerBossShockwave(center: THREE.Vector3) {
    const ringGeo = new THREE.RingGeometry(0.8, 1.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(ringGeo, ringMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(center.x, 3.08, center.z);
    this.scene.add(mesh);

    this.activeShockwaves.push({
      mesh,
      radius: 1.8,
      maxRadius: 18.0,
      opacity: 0.95,
    });
  }

  /**
   * Build atmospheric snow particle system for Fimbulwinter snowy weather
   */
  private buildSnowParticles() {
    const count = 2200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3); // [fallSpeed, swayPhase, swayRadius]

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 260;
      positions[i * 3 + 1] = Math.random() * 58;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 260;

      velocities[i * 3] = 5 + Math.random() * 9; // fall speed
      velocities[i * 3 + 1] = Math.random() * Math.PI * 2; // sway phase
      velocities[i * 3 + 2] = 0.8 + Math.random() * 1.8; // sway radius
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.snowVelocities = velocities;

    // Procedural soft glowing snowflake sprite
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.35, 'rgba(235, 245, 255, 0.9)');
      gradient.addColorStop(0.75, 'rgba(200, 225, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(16, 16, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 1.8,
      map: texture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
    });

    this.snowParticles = new THREE.Points(geometry, material);
    this.snowParticles.visible = false;
    this.scene.add(this.snowParticles);
  }

  /**
   * Build atmospheric low-hanging mist particle system for Niflheim foggy weather
   */
  private buildMistParticles() {
    const count = 240;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 240;
      positions[i * 3 + 1] = 0.5 + Math.random() * 5.0; // low hanging over water and village
      positions[i * 3 + 2] = -40 + Math.random() * 180;

      velocities[i * 3] = 0.6 + Math.random() * 1.4; // drift speed
      velocities[i * 3 + 1] = Math.random() * Math.PI * 2;
      velocities[i * 3 + 2] = 0.5 + Math.random() * 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.mistVelocities = velocities;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(215, 228, 240, 0.45)');
      gradient.addColorStop(0.5, 'rgba(195, 210, 225, 0.2)');
      gradient.addColorStop(1, 'rgba(180, 200, 220, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(32, 32, 31, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 20.0,
      map: texture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      color: 0xccd9e6,
    });

    this.mistParticles = new THREE.Points(geometry, material);
    this.mistParticles.visible = false;
    this.scene.add(this.mistParticles);
  }

  /**
   * Build driving tempest rain particles for Thor's storm weather
   */
  private buildRainParticles() {
    const count = 750;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 320;
      positions[i * 3 + 1] = Math.random() * 65;
      positions[i * 3 + 2] = -60 + Math.random() * 340;

      velocities[i * 3] = 48 + Math.random() * 24; // Rapid downward fall
      velocities[i * 3 + 1] = 10 + Math.random() * 8; // Gale wind drift X
      velocities[i * 3 + 2] = 8 + Math.random() * 6; // Gale wind drift Z
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainVelocities = velocities;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(8, 0, 8, 64);
      grad.addColorStop(0, 'rgba(180, 215, 245, 0)');
      grad.addColorStop(0.3, 'rgba(195, 225, 250, 0.45)');
      grad.addColorStop(1, 'rgba(235, 248, 255, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(6, 0, 4, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 3.2,
      map: texture,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0x93c5fd,
    });

    this.rainParticles = new THREE.Points(geometry, material);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  /**
   * Build churning sea spray & prow bow wave foam particles
   */
  private buildSeaSprayParticles() {
    const count = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -999; // Stowed until emitted
      positions[i * 3 + 2] = 0;

      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
      lifetimes[i] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.seaSprayVelocities = velocities;
    this.seaSprayLifetimes = lifetimes;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.4, 'rgba(224, 242, 254, 0.6)');
      grad.addColorStop(1, 'rgba(186, 230, 253, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 2.4,
      map: texture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xf0f9ff,
    });

    this.seaSprayParticles = new THREE.Points(geometry, material);
    this.scene.add(this.seaSprayParticles);
  }

  /**
   * Spawn frothing ocean spray at world position
   */
  public spawnSeaSpray(pos: THREE.Vector3, intensity: number = 1.0) {
    if (!this.seaSprayParticles || !this.seaSprayVelocities || !this.seaSprayLifetimes) return;
    const posAttr = this.seaSprayParticles.geometry.attributes.position as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const v = this.seaSprayVelocities;
    const life = this.seaSprayLifetimes;
    const count = positions.length / 3;

    const spawnCount = Math.min(5, Math.max(1, Math.round(intensity * 2)));
    let spawned = 0;

    for (let i = 0; i < count && spawned < spawnCount; i++) {
      if (life[i] <= 0) {
        const i3 = i * 3;
        positions[i3] = pos.x + (Math.random() - 0.5) * 4.0;
        positions[i3 + 1] = pos.y + 0.5 + Math.random() * 1.0;
        positions[i3 + 2] = pos.z + (Math.random() - 0.5) * 3.0;

        v[i3] = (Math.random() - 0.5) * 5.0;
        v[i3 + 1] = 4.0 + Math.random() * 4.5 * Math.min(2.0, intensity);
        v[i3 + 2] = (Math.random() - 0.5) * 5.0;

        life[i] = 0.45 + Math.random() * 0.35;
        spawned++;
      }
    }
    posAttr.needsUpdate = true;
  }

  /**
   * Trigger lightning flash sequence in stormy skies
   */
  public triggerLightning(playSound: boolean = true) {
    this.isLightningFlashing = true;
    this.lightningFlashDuration = 0.14; // Quick sharp double-burst
    this.lightningTimer = 8.0 + Math.random() * 8.0;

    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.setHex(0x9ec5eb);
    }
    if (this.sunLight) {
      this.sunLight.intensity = 4.5;
      this.sunLight.color.setHex(0xffffff);
    }
    if (this.ambientLight) {
      this.ambientLight.intensity = 2.6;
      this.ambientLight.color.setHex(0xf0f8ff);
    }

    if (playSound) {
      sound.playThunder();
    }
  }

  /**
   * Calculate precise 3D water surface elevation at any world (X, Z) coordinate
   */
  public getWaterHeight(worldX: number, worldZ: number, customTime?: number): number {
    const t = customTime ?? this.clock.getElapsedTime();
    const baseWaterY = -1.8;

    // Coastline damping: calm near the docks (Z < 80), wild rough open ocean (Z >= 90)
    const shoreFactor = THREE.MathUtils.clamp((worldZ - 60) / 45, 0.3, 1.0);

    if (this.weather === 'stormy') {
      // Formidable Norse tempest: tall rolling swells + turbulent cross-waves + sharp whitecap chops
      const swell1 = Math.sin(worldZ * 0.038 + t * 2.3 + worldX * 0.014) * 2.2 * shoreFactor;
      const swell2 = Math.cos(worldX * 0.05 - t * 1.85 + worldZ * 0.018) * 1.35 * shoreFactor;
      const chop = Math.sin((worldX * 0.11 + worldZ * 0.09) + t * 3.6) * 0.7 * shoreFactor;
      const ripple = Math.cos((worldX * 0.22 - worldZ * 0.17) + t * 4.8) * 0.28 * shoreFactor;
      return baseWaterY + swell1 + swell2 + chop + ripple;
    } else if (this.weather === 'snowy') {
      const swell = Math.sin(worldZ * 0.04 + t * 1.6) * 0.75 * shoreFactor;
      const chop = Math.cos(worldX * 0.07 + t * 2.2) * 0.35 * shoreFactor;
      return baseWaterY + swell + chop;
    } else if (this.weather === 'foggy') {
      return baseWaterY + Math.sin(worldZ * 0.025 + t * 1.1) * 0.45 * shoreFactor;
    } else {
      return baseWaterY + (Math.sin(worldZ * 0.032 + t * 1.5) * 0.25 + Math.cos(worldX * 0.04 + t * 1.2) * 0.15) * shoreFactor;
    }
  }

  /**
   * Set world weather condition with smooth atmospheric lerping
   */
  public setWeather(weather: WeatherCondition, instant = false) {
    this.weather = weather;

    if (weather === 'sunny') {
      this.targetBgColor.setHex(0x87ceeb);
      this.targetFogColor.setHex(0x9dd6f5);
      this.targetFogDensity = 0.003;
      this.targetSunIntensity = 2.4;
      this.targetSunColor.setHex(0xfffdf5);
      this.targetAmbientIntensity = 1.65;
      this.targetAmbientColor.setHex(0xf2f8ff);
      this.targetHemiIntensity = 1.15;
      this.targetHemiSkyColor.setHex(0xa8dcff);
      this.targetHemiGroundColor.setHex(0x788f64);

      if (this.snowParticles) this.snowParticles.visible = false;
      if (this.mistParticles) this.mistParticles.visible = false;
      if (this.rainParticles) this.rainParticles.visible = false;
    } else if (weather === 'foggy') {
      this.targetBgColor.setHex(0xc2d8ec);
      this.targetFogColor.setHex(0xcce0f2);
      this.targetFogDensity = 0.0065;
      this.targetSunIntensity = 1.85;
      this.targetSunColor.setHex(0xfffbeb);
      this.targetAmbientIntensity = 1.5;
      this.targetAmbientColor.setHex(0xf0f7ff);
      this.targetHemiIntensity = 1.05;
      this.targetHemiSkyColor.setHex(0xd4e6f6);
      this.targetHemiGroundColor.setHex(0x7a8a7d);

      if (this.snowParticles) this.snowParticles.visible = false;
      if (this.mistParticles) this.mistParticles.visible = true;
      if (this.rainParticles) this.rainParticles.visible = false;
    } else if (weather === 'snowy') {
      this.targetBgColor.setHex(0xc8e2f8);
      this.targetFogColor.setHex(0xd4eafc);
      this.targetFogDensity = 0.005;
      this.targetSunIntensity = 2.1;
      this.targetSunColor.setHex(0xffffff);
      this.targetAmbientIntensity = 1.6;
      this.targetAmbientColor.setHex(0xf5faff);
      this.targetHemiIntensity = 1.1;
      this.targetHemiSkyColor.setHex(0xe0f0ff);
      this.targetHemiGroundColor.setHex(0x8c9eab);

      if (this.snowParticles) this.snowParticles.visible = true;
      if (this.mistParticles) this.mistParticles.visible = false;
      if (this.rainParticles) this.rainParticles.visible = false;
    } else if (weather === 'stormy') {
      // Thor's Tempest: Bright daytime silver-blue coastal squall with clear visibility
      this.targetBgColor.setHex(0x688fb5);
      this.targetFogColor.setHex(0x7a9ec2);
      this.targetFogDensity = 0.005;
      this.targetSunIntensity = 1.8;
      this.targetSunColor.setHex(0xf0f7ff);
      this.targetAmbientIntensity = 1.45;
      this.targetAmbientColor.setHex(0xe2f0ff);
      this.targetHemiIntensity = 1.0;
      this.targetHemiSkyColor.setHex(0x94bce0);
      this.targetHemiGroundColor.setHex(0x627568);

      if (this.snowParticles) this.snowParticles.visible = false;
      if (this.mistParticles) this.mistParticles.visible = false;
      if (this.rainParticles) this.rainParticles.visible = true;
      this.lightningTimer = 3.5;
    }

    if (instant) {
      this.currentBgColor.copy(this.targetBgColor);
      this.currentFogColor.copy(this.targetFogColor);
      this.currentFogDensity = this.targetFogDensity;

      if (this.scene.background instanceof THREE.Color) {
        this.scene.background.copy(this.currentBgColor);
      }
      if (this.scene.fog instanceof THREE.FogExp2 && this.scene.fog.color) {
        this.scene.fog.color.copy(this.currentFogColor);
        this.scene.fog.density = this.currentFogDensity;
      }
      if (this.sunLight && this.sunLight.color) {
        this.sunLight.intensity = this.targetSunIntensity;
        this.sunLight.color.copy(this.targetSunColor);
      }
      if (this.ambientLight && this.ambientLight.color) {
        this.ambientLight.intensity = this.targetAmbientIntensity;
        this.ambientLight.color.copy(this.targetAmbientColor);
      }
      if (this.hemiLight && this.hemiLight.color) {
        this.hemiLight.intensity = this.targetHemiIntensity;
        this.hemiLight.color.copy(this.targetHemiSkyColor);
        this.hemiLight.groundColor.copy(this.targetHemiGroundColor);
      }
    }
  }

  /**
   * Update animation loop (weather transition, particles, water, firelights, ship, sail billowing)
   */
  public update(delta: number) {
    const elapsed = this.clock.getElapsedTime();

    // Smooth weather lighting and atmospheric lerp
    const lerpSpeed = 2.5 * delta;
    this.currentBgColor.lerp(this.targetBgColor, lerpSpeed);
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.copy(this.currentBgColor);
    }
    if (this.scene.fog instanceof THREE.FogExp2 && this.scene.fog.color) {
      this.currentFogColor.lerp(this.targetFogColor, lerpSpeed);
      this.scene.fog.color.copy(this.currentFogColor);
      this.currentFogDensity = THREE.MathUtils.lerp(this.currentFogDensity, this.targetFogDensity, lerpSpeed);
      this.scene.fog.density = this.currentFogDensity;
    }
    if (this.sunLight && this.sunLight.color) {
      this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, this.targetSunIntensity, lerpSpeed);
      this.sunLight.color.lerp(this.targetSunColor, lerpSpeed);
    }
    if (this.ambientLight && this.ambientLight.color) {
      this.ambientLight.intensity = THREE.MathUtils.lerp(this.ambientLight.intensity, this.targetAmbientIntensity, lerpSpeed);
      this.ambientLight.color.lerp(this.targetAmbientColor, lerpSpeed);
    }
    if (this.hemiLight && this.hemiLight.color) {
      this.hemiLight.intensity = THREE.MathUtils.lerp(this.hemiLight.intensity, this.targetHemiIntensity, lerpSpeed);
      this.hemiLight.color.lerp(this.targetHemiSkyColor, lerpSpeed);
      this.hemiLight.groundColor.lerp(this.targetHemiGroundColor, lerpSpeed);
    }

    // Cinematic Camera interpolation during Drakkar onboarding tour
    if (this.isCinematicActive) {
      this.cinematicCamPos.lerp(this.targetCinematicPos, delta * 3.5);
      this.cinematicCamTarget.lerp(this.targetCinematicTarget, delta * 4.0);
      this.camera.position.copy(this.cinematicCamPos);
      this.camera.lookAt(this.cinematicCamTarget);
    }

    // Pier Waypoint Beacon rotation & pulse animation
    if (this.pierWaypointBeacon && this.pierWaypointBeacon.visible) {
      this.pierWaypointBeacon.rotation.y += 1.2 * delta;
      const pulse = 1.0 + Math.sin(elapsed * 4.0) * 0.12;
      this.pierWaypointBeacon.scale.set(pulse, 1.0, pulse);
    }

    // Update snowflake particles
    if (this.snowParticles && this.snowParticles.visible && this.snowVelocities) {
      const posAttr = this.snowParticles.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const v = this.snowVelocities;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const fallSpeed = v[i3];
        const swayPhase = v[i3 + 1];
        const swayRadius = v[i3 + 2];

        // Downward fall
        positions[i3 + 1] -= fallSpeed * delta;

        // Swirling Norse blizzard drift
        positions[i3] += (Math.sin(elapsed * 1.5 + swayPhase) * swayRadius + 1.5) * delta * 2.5;
        positions[i3 + 2] += Math.cos(elapsed * 1.2 + swayPhase) * swayRadius * delta * 2.0;

        // Wrap around vertically
        if (positions[i3 + 1] < -2) {
          positions[i3 + 1] = 55 + Math.random() * 5;
          positions[i3] = (Math.random() - 0.5) * 260;
          positions[i3 + 2] = (Math.random() - 0.5) * 260;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Update low-lying fjord mist particles
    if (this.mistParticles && this.mistParticles.visible && this.mistVelocities) {
      const posAttr = this.mistParticles.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const v = this.mistVelocities;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const speed = v[i3];
        const phase = v[i3 + 1];

        positions[i3] += Math.sin(elapsed * 0.4 + phase) * speed * delta * 1.5;
        positions[i3 + 2] += Math.cos(elapsed * 0.3 + phase) * speed * delta * 0.8;
        positions[i3 + 1] = 1.0 + Math.sin(elapsed * 0.5 + phase) * 1.2;
      }
      posAttr.needsUpdate = true;
    }

    // Update rain particles in tempest
    if (this.rainParticles && this.rainParticles.visible && this.rainVelocities) {
      const posAttr = this.rainParticles.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const v = this.rainVelocities;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const fall = v[i3];
        const driftX = v[i3 + 1];
        const driftZ = v[i3 + 2];

        positions[i3 + 1] -= fall * delta;
        positions[i3] += driftX * delta;
        positions[i3 + 2] += driftZ * delta;

        if (positions[i3 + 1] < -2) {
          positions[i3 + 1] = 60 + Math.random() * 5;
          positions[i3] = (Math.random() - 0.5) * 320;
          positions[i3 + 2] = -60 + Math.random() * 340;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Update active sea spray particles
    if (this.seaSprayParticles && this.seaSprayVelocities && this.seaSprayLifetimes) {
      const posAttr = this.seaSprayParticles.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const v = this.seaSprayVelocities;
      const life = this.seaSprayLifetimes;
      const count = positions.length / 3;
      let hasActiveSpray = false;

      for (let i = 0; i < count; i++) {
        if (life[i] > 0) {
          hasActiveSpray = true;
          life[i] -= delta;
          const i3 = i * 3;
          positions[i3] += v[i3] * delta;
          v[i3 + 1] -= 9.8 * delta; // Gravity
          positions[i3 + 1] += v[i3 + 1] * delta;
          positions[i3 + 2] += v[i3 + 2] * delta;

          if (life[i] <= 0) {
            positions[i3 + 1] = -999;
          }
        }
      }
      if (hasActiveSpray) {
        posAttr.needsUpdate = true;
      }
    }

    // Storm Lightning Flash and Thunder Sequence
    if (this.weather === 'stormy') {
      this.lightningTimer -= delta;
      if (this.lightningTimer <= 0 && !this.isLightningFlashing) {
        this.triggerLightning(true);
      }

      if (this.isLightningFlashing) {
        this.lightningFlashDuration -= delta;
        if (this.lightningFlashDuration <= 0) {
          this.isLightningFlashing = false;
          this.currentBgColor.copy(this.targetBgColor);
          if (this.scene.background instanceof THREE.Color) {
            this.scene.background.copy(this.currentBgColor);
          }
          if (this.sunLight && this.sunLight.color) {
            this.sunLight.intensity = this.targetSunIntensity;
            this.sunLight.color.copy(this.targetSunColor);
          }
          if (this.ambientLight && this.ambientLight.color) {
            this.ambientLight.intensity = this.targetAmbientIntensity;
            this.ambientLight.color.copy(this.targetAmbientColor);
          }
        }
      }
    }

    // Update active combat particles (sparks, wood chips, blood)
    for (let pIdx = this.combatParticles.length - 1; pIdx >= 0; pIdx--) {
      const p = this.combatParticles[pIdx];
      p.life -= delta;
      if (p.life <= 0) {
        this.scene.remove(p.points);
        p.points.geometry.dispose();
        if (Array.isArray(p.points.material)) {
          p.points.material.forEach((m) => m.dispose());
        } else {
          p.points.material.dispose();
        }
        this.combatParticles.splice(pIdx, 1);
        continue;
      }

      const count = p.positions.length / 3;
      const progress = 1 - p.life / p.maxLife;
      const mat = p.points.material as THREE.PointsMaterial;
      mat.opacity = 1 - progress;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        p.positions[i3] += p.velocities[i3] * delta;
        p.velocities[i3 + 1] -= 18 * delta; // Gravity
        p.positions[i3 + 1] += p.velocities[i3 + 1] * delta;
        p.positions[i3 + 2] += p.velocities[i3 + 2] * delta;
      }
      p.points.geometry.attributes.position.needsUpdate = true;
    }

    // Update Boss expanding shockwaves
    for (let sIdx = this.activeShockwaves.length - 1; sIdx >= 0; sIdx--) {
      const sw = this.activeShockwaves[sIdx];
      sw.radius += 24 * delta;
      const progress = sw.radius / sw.maxRadius;
      sw.opacity = Math.max(0, 0.95 * (1 - progress));

      const scale = sw.radius;
      sw.mesh.scale.set(scale, scale, scale);
      const mat = sw.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = sw.opacity;

      if (sw.radius >= sw.maxRadius || sw.opacity <= 0) {
        this.scene.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        mat.dispose();
        this.activeShockwaves.splice(sIdx, 1);
      }
    }

    // Dynamic 3D Ocean Waves Vertex Simulation with Foaming Crest Colors
    if (this.waterMesh && this.waterGeo && this.waterPositions && this.waterColors) {
      const posAttr = this.waterGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const colorAttr = this.waterGeo.attributes.color as THREE.BufferAttribute;
      const colors = colorAttr.array as Float32Array;
      const count = positions.length / 3;
      const isStorm = this.weather === 'stormy';

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const lx = this.waterPositions[i3];
        const ly = this.waterPositions[i3 + 1];
        const wx = lx;
        const wz = 180 - ly;

        const waveElevation = this.getWaterHeight(wx, wz, elapsed);
        // Plane is rotated x = -PI/2, so local Z is vertical elevation offset from -1.8
        const crest = waveElevation - (-1.8);
        positions[i3 + 2] = crest;

        // Dynamic Whitecap Seafoam on wave crests
        if (isStorm) {
          if (crest > 1.1) {
            // Foaming wave crest tip
            const foam = Math.min(1.0, (crest - 1.1) / 1.7);
            colors[i3] = THREE.MathUtils.lerp(0.22, 0.96, foam);
            colors[i3 + 1] = THREE.MathUtils.lerp(0.52, 0.99, foam);
            colors[i3 + 2] = THREE.MathUtils.lerp(0.74, 1.0, foam);
          } else {
            // Bright teal-blue stormy swell
            const depth = Math.max(0, (crest + 2.4) / 3.5);
            colors[i3] = THREE.MathUtils.lerp(0.14, 0.24, depth);
            colors[i3 + 1] = THREE.MathUtils.lerp(0.38, 0.54, depth);
            colors[i3 + 2] = THREE.MathUtils.lerp(0.58, 0.76, depth);
          }
        } else {
          // Bright crystal Nordic blue water
          const factor = Math.max(0, Math.min(1, (crest + 0.8) / 1.6));
          colors[i3] = THREE.MathUtils.lerp(0.16, 0.30, factor);
          colors[i3 + 1] = THREE.MathUtils.lerp(0.46, 0.66, factor);
          colors[i3 + 2] = THREE.MathUtils.lerp(0.68, 0.86, factor);
        }
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // Recalculate surface lighting normals periodically for high performance
      this.waveCrestNormalTimer += delta;
      if (this.waveCrestNormalTimer > 0.08) {
        this.waveCrestNormalTimer = 0;
        this.waterGeo.computeVertexNormals();
      }
    }

    // Firelight flickering (warm hearth glow)
    this.fireLights.forEach((light, i) => {
      light.intensity = 2.0 + Math.sin(elapsed * 7 + i * 2.5) * 0.45;
    });

    // Drakkar Longship Physical Wave Dynamics (Heave, Pitch, Roll & Sea Spray)
    if (this.shipGroup) {
      const shipPos = this.shipGroup.position;
      const rad = this.shipRotation;
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rad);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rad);

      if (this.isShipMounted) {
        // Move ship forward with speed
        this.shipGroup.rotation.y = this.shipRotation;
        this.shipGroup.position.addScaledVector(forward, this.shipSpeed * delta);
      }

      // Sample wave heights at 5 key nautical points along the Drakkar
      const bowPos = shipPos.clone().addScaledVector(forward, 15);
      const sternPos = shipPos.clone().addScaledVector(forward, -15);
      const portPos = shipPos.clone().addScaledVector(right, -4.5);
      const starPos = shipPos.clone().addScaledVector(right, 4.5);

      const centerH = this.getWaterHeight(shipPos.x, shipPos.z, elapsed);
      const bowH = this.getWaterHeight(bowPos.x, bowPos.z, elapsed);
      const sternH = this.getWaterHeight(sternPos.x, sternPos.z, elapsed);
      const portH = this.getWaterHeight(portPos.x, portPos.z, elapsed);
      const starH = this.getWaterHeight(starPos.x, starPos.z, elapsed);

      // Ship target elevation follows water surface with nautical draft offset (1.25m)
      const targetY = centerH + 1.25;
      const heaveSpeed = this.weather === 'stormy' ? 7.5 : 4.0;
      this.shipGroup.position.y = THREE.MathUtils.lerp(this.shipGroup.position.y, targetY, delta * heaveSpeed);

      // Pitch angle (bow vs stern over 30m hull length)
      const targetPitch = Math.atan2(bowH - sternH, 30);
      // Roll angle (port vs starboard over 9m beam)
      const targetRoll = Math.atan2(portH - starH, 9);
      // Turn lean
      const steerLean = this.isShipMounted ? -this.shipSpeed * 0.006 : 0;

      const rotSpeed = this.weather === 'stormy' ? 8.0 : 4.5;
      this.shipGroup.rotation.x = THREE.MathUtils.lerp(this.shipGroup.rotation.x, targetPitch, delta * rotSpeed);
      this.shipGroup.rotation.z = THREE.MathUtils.lerp(this.shipGroup.rotation.z, targetRoll + steerLean, delta * rotSpeed);

      // Spawn sea spray at dragon prow when sailing in rough stormy sea or moving at speed
      if (this.weather === 'stormy' || Math.abs(this.shipSpeed) > 5) {
        const sprayIntensity = this.weather === 'stormy'
          ? 1.2 + Math.abs(this.shipSpeed) * 0.08
          : 0.6;
        this.spawnSeaSpray(bowPos, sprayIntensity);
      }
    }

    // ==============================================================
    // WIND DYNAMICS & WEBGL BILLOWING SAIL VERTEX ANIMATION
    // ==============================================================
    this.windGustTime += delta;
    // Gentle natural drift in wind angle over time (oscillates naturally)
    this.windAngle += Math.sin(elapsed * 0.04) * 0.012 * delta;

    const windStats = this.getWindSailingStats();
    const relWind = windStats.relativeWindAngle;
    const absRel = Math.abs(relWind);
    const gust = 1.0 + Math.sin(this.windGustTime * 1.5) * 0.15 + (this.weather === 'stormy' ? 0.35 : 0);

    // 1. DYNAMIC YARD TACK ANGLE (Square-sail bracing based on wind heading)
    let targetTack = 0;
    if (absRel < Math.PI * 0.28) {
      // Downwind (Running): Yard squared perpendicular across hull
      targetTack = 0;
    } else if (absRel < Math.PI * 0.65) {
      // Crosswind (Broad Reach): Yard trimmed ~23 degrees to catch wind across beam
      targetTack = (relWind > 0 ? 1 : -1) * 0.40;
    } else if (absRel < Math.PI * 0.82) {
      // Close-Hauled (Beating): Yard braced hard to side ~36 degrees
      targetTack = (relWind > 0 ? 1 : -1) * 0.62;
    } else {
      // In Irons (Headwind): Flutters and quivers slightly around center
      targetTack = Math.sin(elapsed * 6.5) * 0.05;
    }

    this.sailTackAngle = THREE.MathUtils.lerp(this.sailTackAngle, targetTack, delta * 3.5);
    if (this.shipSailYardMesh) {
      this.shipSailYardMesh.rotation.y = this.sailTackAngle;
    }
    if (this.shipSailPlaneMesh) {
      this.shipSailPlaneMesh.rotation.y = this.sailTackAngle;
    }

    // 2. DYNAMIC BILLOW DEPTH
    let targetBillow = 2.8 * gust;
    if (absRel < Math.PI * 0.28) {
      targetBillow = 3.5 * gust; // Deepest belly with full following wind
    } else if (absRel < Math.PI * 0.65) {
      targetBillow = 2.9 * gust; // Strong aerodynamic crosswind curve
    } else if (absRel < Math.PI * 0.82) {
      targetBillow = 1.6 * gust; // Shallow, taut belly
    } else {
      targetBillow = 0.25; // In Irons: deflated, flapping canvas
    }
    if (this.weather === 'stormy') {
      targetBillow += 0.7;
    }

    this.sailBillowDepth = THREE.MathUtils.lerp(this.sailBillowDepth, targetBillow, delta * 4.0);

    // 3. WEBGL VERTEX DEFORMATION ANIMATION ON SAIL MESH
    if (this.shipSailPlaneMesh && this.sailBasePositions) {
      const posAttr = this.shipSailPlaneMesh.geometry.attributes.position as THREE.BufferAttribute;
      const pos = posAttr.array as Float32Array;
      const base = this.sailBasePositions;
      const vCount = pos.length / 3;
      const isInIrons = absRel >= Math.PI * 0.82;

      for (let i = 0; i < vCount; i++) {
        const i3 = i * 3;
        const bx = base[i3];
        const by = base[i3 + 1];
        const bz = base[i3 + 2];

        // Sail dimensions: width 16 (bx in [-8, 8]), height 12 (by in [-6, 6])
        const nx = bx / 8; // -1 to 1
        const ny = (by - (-6)) / 12; // 0 (bottom sheet edge) to 1 (top yard attachment)

        // Top edge attached to yard beam, displacement must be 0 at ny=1
        const topRestraint = Math.max(0, 1 - Math.pow(ny, 1.6));
        // Lateral arc profile (catenary curve, peak at center x=0)
        const lateralArc = Math.max(0, 1 - nx * nx);
        // Vertical belly profile: peak in lower-middle section
        const verticalBelly = Math.sin(ny * Math.PI * 0.95);

        if (isInIrons) {
          // Luffing flutter (frantic small ripples from headwind)
          const luffFreq = elapsed * 15;
          const luff1 = Math.sin(luffFreq + bx * 1.5 + by * 1.1) * 0.35;
          const luff2 = Math.cos(luffFreq * 1.4 + bx * 2.2) * 0.18;
          const totalLuff = (luff1 + luff2) * topRestraint * (0.3 + 0.7 * lateralArc);

          pos[i3] = bx + Math.sin(luffFreq * 0.7 + by) * 0.08 * topRestraint;
          pos[i3 + 1] = by;
          pos[i3 + 2] = bz - 0.25 * topRestraint + totalLuff;
        } else {
          // Dynamic wind billow with organic cloth ripples
          const leewardShift = (relWind > 0 ? 0.22 : -0.22) * (1 - Math.abs(nx)) * topRestraint;
          const ripple1 = Math.sin(elapsed * 7.0 + bx * 0.85 + by * 0.55) * 0.15;
          const ripple2 = Math.cos(elapsed * 11.5 + bx * 1.3 - by * 0.75) * 0.07;
          const clothRipple = (ripple1 + ripple2) * (0.25 + 0.75 * topRestraint);

          const billowAmount = this.sailBillowDepth * topRestraint * lateralArc * verticalBelly;

          pos[i3] = bx + leewardShift;
          pos[i3 + 1] = by;
          pos[i3 + 2] = bz + billowAmount + clothRipple;
        }
      }

      posAttr.needsUpdate = true;

      this.sailNormalTimer += delta;
      if (this.sailNormalTimer > 0.05) {
        this.sailNormalTimer = 0;
        this.shipSailPlaneMesh.geometry.computeVertexNormals();
      }

      // Update dynamic rigging sheets
      if (this.shipLeftSheet && this.shipRightSheet) {
        const billowLead = this.sailBillowDepth * 0.35;
        const leftSheetPos = this.shipLeftSheet.geometry.attributes.position as THREE.BufferAttribute;
        (leftSheetPos.array as Float32Array)[2] = billowLead;
        leftSheetPos.needsUpdate = true;

        const rightSheetPos = this.shipRightSheet.geometry.attributes.position as THREE.BufferAttribute;
        (rightSheetPos.array as Float32Array)[2] = billowLead;
        rightSheetPos.needsUpdate = true;
      }
    }

    // 4. MASTHEAD PENNANT & WIND VANE ALIGNMENT
    if (this.shipMastPennantGroup) {
      this.shipMastPennantGroup.rotation.y = THREE.MathUtils.lerp(
        this.shipMastPennantGroup.rotation.y,
        relWind,
        delta * 5.0
      );
    }

    // 5. FJORD WIND STREAMERS DRIFT
    if (this.windStreamersGroup) {
      const windDirX = Math.sin(this.windAngle);
      const windDirZ = Math.cos(this.windAngle);
      const streamerSpeed = (this.windBaseSpeed / 18) * 20 * delta;

      this.windStreamersGroup.children.forEach((line) => {
        line.position.x += windDirX * streamerSpeed;
        line.position.z += windDirZ * streamerSpeed;
        line.rotation.y = this.windAngle;

        // Wrap around boundaries of the Katfjord bay
        if (line.position.x > 140) line.position.x -= 240;
        else if (line.position.x < -100) line.position.x += 240;
        if (line.position.z > 200) line.position.z -= 250;
        else if (line.position.z < -50) line.position.z += 250;
      });
    }
  }

  public resize(width: number, height: number) {
    if (!width || !height || width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public dispose() {
    cancelAnimationFrame(this.animId);
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    if (this.snowParticles) {
      this.snowParticles.geometry.dispose();
      if (Array.isArray(this.snowParticles.material)) {
        this.snowParticles.material.forEach((m) => m.dispose());
      } else {
        this.snowParticles.material.dispose();
      }
    }
    if (this.mistParticles) {
      this.mistParticles.geometry.dispose();
      if (Array.isArray(this.mistParticles.material)) {
        this.mistParticles.material.forEach((m) => m.dispose());
      } else {
        this.mistParticles.material.dispose();
      }
    }
    if (this.rainParticles) {
      this.rainParticles.geometry.dispose();
      if (Array.isArray(this.rainParticles.material)) {
        this.rainParticles.material.forEach((m) => m.dispose());
      } else {
        this.rainParticles.material.dispose();
      }
    }
    if (this.seaSprayParticles) {
      this.seaSprayParticles.geometry.dispose();
      if (Array.isArray(this.seaSprayParticles.material)) {
        this.seaSprayParticles.material.forEach((m) => m.dispose());
      } else {
        this.seaSprayParticles.material.dispose();
      }
    }
    if (this.waterGeo) {
      this.waterGeo.dispose();
    }
    this.renderer.dispose();
  }
}

