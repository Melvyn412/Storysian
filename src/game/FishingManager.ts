import * as THREE from 'three';
import { FishSpecies, FishingState, CaughtFishRecord } from '../types';
import { NORSE_FISH_SPECIES } from './robloxFeaturesConfig';
import { sound } from '../audio/soundEngine';

export class FishingManager {
  static PIER_FISHING_POS = new THREE.Vector3(0, 1.2, 74);
  static PIER_FACING_DIR = new THREE.Vector3(0, 0, 1);

  scene: THREE.Scene;
  state: FishingState;
  bobberMesh: THREE.Group | null = null;
  fishingLine: THREE.Line | null = null;
  waterRipples: THREE.Mesh[] = [];
  castTimer: number = 0;
  biteTimer: number = 0;
  biteWindow: number = 0;
  tensionDecayRate: number = 25;
  tensionBuildRate: number = 38;
  fishCaughtLog: CaughtFishRecord[] = [];
  activeLure: 'standard' | 'speed' | 'rare' = 'standard';

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.state = {
      status: 'idle',
      bobberPos: null,
      targetFish: null,
      targetFishWeight: 0,
      tension: 25,
      reelProgress: 0,
    };
    this.createBobberMesh();
  }

  createBobberMesh() {
    const group = new THREE.Group();

    // Red and White Floater Sphere
    const topGeo = new THREE.SphereGeometry(0.3, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.2,
      emissive: 0x991b1b,
      emissiveIntensity: 0.2,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    group.add(topMesh);

    const btmGeo = new THREE.SphereGeometry(0.3, 12, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const btmMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const btmMesh = new THREE.Mesh(btmGeo, btmMat);
    group.add(btmMesh);

    // Antenna & Feather
    const antennaGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const antennaMesh = new THREE.Mesh(antennaGeo, antennaMat);
    antennaMesh.position.y = 0.3;
    group.add(antennaMesh);

    // Glow Ring
    const ringGeo = new THREE.RingGeometry(0.35, 0.5, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.05;
    group.add(ringMesh);

    group.visible = false;
    this.scene.add(group);
    this.bobberMesh = group;

    // Line geometry
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.8,
    });
    this.fishingLine = new THREE.Line(lineGeo, lineMat);
    this.fishingLine.visible = false;
    this.scene.add(this.fishingLine);
  }

  isNearWater(playerPos: THREE.Vector3): boolean {
    // Katfjord Pier / Docks: x: [-14, 14], z: [48, 96]
    const onPier = Math.abs(playerPos.x) < 14 && playerPos.z > 45;
    const nearDockWater = playerPos.z > 25;
    const nearRiver = Math.abs(playerPos.x - 30) < 26 && playerPos.z > -10;
    const nearOcean = playerPos.length() > 55 && playerPos.y < 6.0;
    return onPier || nearDockWater || nearRiver || nearOcean;
  }

  castLine(
    playerPos: THREE.Vector3,
    playerDir: THREE.Vector3,
    lure: 'standard' | 'speed' | 'rare' = 'standard'
  ): boolean {
    if (!this.isNearWater(playerPos)) {
      return false;
    }

    this.activeLure = lure;
    // Cast forwards towards the open fjord waters
    const dir =
      playerDir.z <= 0 && playerPos.z > 40
        ? new THREE.Vector3(playerDir.x * 0.4, 0, 1).normalize()
        : playerDir.clone().normalize();

    const castDist = 12 + Math.random() * 8;
    const targetX = playerPos.x + dir.x * castDist;
    const targetZ = playerPos.z + dir.z * castDist;
    const targetY = -0.55; // Sits naturally on the Katfjord water surface

    this.state.status = 'casting';
    this.state.bobberPos = { x: targetX, y: targetY, z: targetZ };
    this.state.tension = 25;
    this.state.reelProgress = 0;

    if (this.bobberMesh) {
      this.bobberMesh.position.set(targetX, targetY, targetZ);
      this.bobberMesh.visible = true;
    }

    sound.playWhoosh();
    this.castTimer = 0;

    // Bait timing: Speed lure bites in 1.8-3.2s, Standard in 3.0-5.5s
    const baseWait = lure === 'speed' ? 1.8 + Math.random() * 1.5 : 3.0 + Math.random() * 3.0;
    this.biteTimer = baseWait;
    this.biteWindow = 0;

    // Pre-select potential fish based on lure
    const rand = Math.random();
    if (lure === 'rare') {
      if (rand < 0.25) this.state.targetFish = NORSE_FISH_SPECIES[3]; // Ancient Runic Trout
      else if (rand < 0.5) this.state.targetFish = NORSE_FISH_SPECIES[1]; // Abyssal Cod
      else if (rand < 0.72) this.state.targetFish = NORSE_FISH_SPECIES[5]; // Baby Kraken
      else this.state.targetFish = NORSE_FISH_SPECIES[0]; // Golden Salmon
    } else {
      if (rand < 0.35) this.state.targetFish = NORSE_FISH_SPECIES[0]; // Golden Fjord Salmon
      else if (rand < 0.6) this.state.targetFish = NORSE_FISH_SPECIES[2]; // Arctic Char
      else if (rand < 0.8) this.state.targetFish = NORSE_FISH_SPECIES[4]; // Sea Bass
      else if (rand < 0.92) this.state.targetFish = NORSE_FISH_SPECIES[1]; // Abyssal Cod
      else if (rand < 0.98) this.state.targetFish = NORSE_FISH_SPECIES[3]; // Runic Trout
      else this.state.targetFish = NORSE_FISH_SPECIES[5]; // Baby Kraken
    }

    const f = this.state.targetFish;
    this.state.targetFishWeight = +(
      f.minWeight +
      Math.random() * (f.maxWeight - f.minWeight)
    ).toFixed(2);

    return true;
  }

  hookBite(): boolean {
    if (this.state.status === 'bite') {
      sound.playFanfare();
      sound.playSplash();
      this.state.status = 'reeling';
      this.state.tension = 45;
      this.state.reelProgress = 15;
      return true;
    }
    return false;
  }

  reel(pullHard: boolean) {
    if (this.state.status !== 'reeling') return;

    if (pullHard) {
      // Bonus reel speed if tension is in the green sweet spot (35-75%)
      const isSweetSpot = this.state.tension >= 35 && this.state.tension <= 75;
      const progressGain = isSweetSpot ? 16 : 10;
      this.state.reelProgress = Math.min(100, this.state.reelProgress + progressGain);
      this.state.tension = Math.min(100, this.state.tension + this.tensionBuildRate);
      sound.playHammerHit();
    } else {
      this.state.reelProgress = Math.min(100, this.state.reelProgress + 6);
      this.state.tension = Math.max(10, this.state.tension - 8);
    }
  }

  releaseTension() {
    if (this.state.status !== 'reeling') return;
    this.state.tension = Math.max(15, this.state.tension - 22);
    sound.playWhoosh();
  }

  update(delta: number, playerPos: THREE.Vector3, onCatch?: (record: CaughtFishRecord) => void) {
    if (this.state.status === 'idle') {
      if (this.bobberMesh) this.bobberMesh.visible = false;
      if (this.fishingLine) this.fishingLine.visible = false;
      return;
    }

    // Bobbing water animation
    if (this.bobberMesh && this.state.bobberPos) {
      const time = performance.now() * 0.003;
      const waveOffset = Math.sin(time + this.state.bobberPos.x * 0.5) * 0.12;
      this.bobberMesh.position.y = this.state.bobberPos.y + waveOffset;

      // Update rod-to-bobber fishing line
      if (this.fishingLine) {
        this.fishingLine.visible = true;
        const rodTip = new THREE.Vector3(playerPos.x + 0.4, playerPos.y + 1.2, playerPos.z + 0.5);
        const pts = [rodTip, this.bobberMesh.position];
        this.fishingLine.geometry.setFromPoints(pts);
      }
    }

    if (this.state.status === 'casting') {
      this.castTimer += delta;
      if (this.castTimer >= 0.8) {
        this.state.status = 'waiting';
        sound.playSplash();
      }
    } else if (this.state.status === 'waiting') {
      this.biteTimer -= delta;
      if (this.biteTimer <= 0) {
        this.state.status = 'bite';
        this.biteWindow = 3.5; // Player has 3.5 seconds to hook!
        sound.playHornAlert();
        if (this.bobberMesh) {
          this.bobberMesh.position.y -= 0.35; // Submerge bobber
        }
      }
    } else if (this.state.status === 'bite') {
      this.biteWindow -= delta;
      if (this.biteWindow <= 0) {
        // Fish got away!
        sound.playHitImpact(false);
        this.reset();
      }
    } else if (this.state.status === 'reeling') {
      // Line tension auto-decay
      this.state.tension = Math.max(0, this.state.tension - this.tensionDecayRate * delta);

      // Line snapped if tension hits 100!
      if (this.state.tension >= 100) {
        sound.playHitImpact(true);
        this.reset();
        return;
      }

      // Fish escapes if tension hits 0
      if (this.state.tension <= 0 && this.state.reelProgress > 10) {
        this.state.reelProgress -= 15 * delta;
      }

      // Catch check!
      if (this.state.reelProgress >= 100 && this.state.targetFish) {
        const record: CaughtFishRecord = {
          species: this.state.targetFish,
          weight: this.state.targetFishWeight,
          caughtAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        this.fishCaughtLog.unshift(record);
        this.state.status = 'caught';
        sound.playVictoryTriumph();
        if (onCatch) onCatch(record);
      }
    }
  }

  reset() {
    this.state.status = 'idle';
    this.state.bobberPos = null;
    this.state.targetFish = null;
    this.state.targetFishWeight = 0;
    this.state.tension = 20;
    this.state.reelProgress = 0;
    if (this.bobberMesh) this.bobberMesh.visible = false;
    if (this.fishingLine) this.fishingLine.visible = false;
  }
}
