import * as THREE from 'three';
import {
  BuildableStructureType,
  PlacedStructure,
  BuildableStructureBlueprint,
  RaidWaveState,
} from '../types';
import { BUILDABLE_BLUEPRINTS } from './robloxFeaturesConfig';
import { sound } from '../audio/soundEngine';

interface RaidEnemy {
  mesh: THREE.Group;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  name: string;
}

export class BuildingManager {
  scene: THREE.Scene;
  placedStructures: PlacedStructure[] = [];
  structureMeshes: Map<string, THREE.Group> = new Map();
  previewMesh: THREE.Group | null = null;
  activeType: BuildableStructureType = 'palisade_wall';
  isBuildMode: boolean = false;
  raidState: RaidWaveState = {
    isActive: false,
    wave: 0,
    enemiesRemaining: 0,
    totalEnemies: 0,
    rewardSilver: 0,
    rewardValor: 0,
  };
  raidEnemies: RaidEnemy[] = [];
  ballistaCooldown: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createPreviewMesh();
  }

  createPreviewMesh() {
    const group = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(4, 3, 0.8);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 1.5;
    group.add(box);
    group.visible = false;
    this.scene.add(group);
    this.previewMesh = group;
  }

  setBuildMode(active: boolean, type: BuildableStructureType = 'palisade_wall') {
    this.isBuildMode = active;
    this.activeType = type;
    if (this.previewMesh) {
      this.previewMesh.visible = active;
    }
  }

  buildStructureMesh(type: BuildableStructureType): THREE.Group {
    const group = new THREE.Group();

    if (type === 'palisade_wall') {
      // 5 vertical sharpened logs
      const logMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.85 });
      for (let i = -2; i <= 2; i++) {
        const logGeo = new THREE.CylinderGeometry(0.28, 0.32, 3.4, 8);
        const log = new THREE.Mesh(logGeo, logMat);
        log.position.set(i * 0.55, 1.7, 0);

        // Sharpened cone tip
        const coneGeo = new THREE.ConeGeometry(0.3, 0.6, 8);
        const cone = new THREE.Mesh(coneGeo, logMat);
        cone.position.set(i * 0.55, 3.7, 0);
        group.add(log);
        group.add(cone);
      }
      // Horizontal crossbeams
      const beamGeo = new THREE.BoxGeometry(3.0, 0.22, 0.22);
      const beamMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
      const b1 = new THREE.Mesh(beamGeo, beamMat);
      b1.position.set(0, 1.0, 0.25);
      const b2 = new THREE.Mesh(beamGeo, beamMat);
      b2.position.set(0, 2.3, 0.25);
      group.add(b1);
      group.add(b2);
    } else if (type === 'watchtower') {
      // 4 tall corner poles
      const poleGeo = new THREE.CylinderGeometry(0.22, 0.25, 6.2, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a3525 });
      const corners = [
        [-1.2, -1.2],
        [1.2, -1.2],
        [-1.2, 1.2],
        [1.2, 1.2],
      ];
      corners.forEach(([cx, cz]) => {
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(cx, 3.1, cz);
        group.add(pole);
      });

      // Upper platform deck
      const deckGeo = new THREE.BoxGeometry(3.2, 0.25, 3.2);
      const deckMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
      const deck = new THREE.Mesh(deckGeo, deckMat);
      deck.position.y = 5.2;
      group.add(deck);

      // Low railings
      const railGeo = new THREE.BoxGeometry(3.2, 0.8, 0.15);
      const r1 = new THREE.Mesh(railGeo, deckMat);
      r1.position.set(0, 5.7, 1.55);
      const r2 = new THREE.Mesh(railGeo, deckMat);
      r2.position.set(0, 5.7, -1.55);
      group.add(r1);
      group.add(r2);

      // Roof canopy
      const roofGeo = new THREE.ConeGeometry(2.6, 1.5, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 7.2;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
    } else if (type === 'palisade_gate') {
      // Gate frame posts
      const postGeo = new THREE.CylinderGeometry(0.35, 0.38, 4.2, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x452b1f });
      const p1 = new THREE.Mesh(postGeo, postMat);
      p1.position.set(-1.8, 2.1, 0);
      const p2 = new THREE.Mesh(postGeo, postMat);
      p2.position.set(1.8, 2.1, 0);
      group.add(p1);
      group.add(p2);

      // Top arch log
      const archGeo = new THREE.BoxGeometry(4.2, 0.45, 0.45);
      const arch = new THREE.Mesh(archGeo, postMat);
      arch.position.set(0, 4.2, 0);
      group.add(arch);

      // Double Doors
      const doorGeo = new THREE.BoxGeometry(1.65, 3.4, 0.2);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
      const d1 = new THREE.Mesh(doorGeo, doorMat);
      d1.position.set(-0.85, 1.7, 0);
      const d2 = new THREE.Mesh(doorGeo, doorMat);
      d2.position.set(0.85, 1.7, 0);
      group.add(d1);
      group.add(d2);

      // Iron Studs & Handle
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const ringGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 16);
      const r1 = new THREE.Mesh(ringGeo, ironMat);
      r1.position.set(-0.25, 1.7, 0.15);
      const r2 = new THREE.Mesh(ringGeo, ironMat);
      r2.position.set(0.25, 1.7, 0.15);
      group.add(r1);
      group.add(r2);
    } else if (type === 'defense_ballista') {
      // Stone / Timber base tripod
      const baseGeo = new THREE.CylinderGeometry(0.9, 1.2, 0.9, 8);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.45;
      group.add(base);

      // Swivel mount and bow arms
      const swivelGeo = new THREE.BoxGeometry(0.35, 0.6, 0.35);
      const swivelMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const swivel = new THREE.Mesh(swivelGeo, swivelMat);
      swivel.position.y = 1.1;
      group.add(swivel);

      // Crossbow lathe
      const latheGeo = new THREE.BoxGeometry(2.4, 0.18, 0.18);
      const latheMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
      const lathe = new THREE.Mesh(latheGeo, latheMat);
      lathe.position.set(0, 1.45, 0.4);
      group.add(lathe);

      // Harpoon bolt
      const boltGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6);
      const boltMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(0, 1.5, 0.5);
      group.add(bolt);
    } else if (type === 'hearth_bonfire') {
      // Stone ring
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 });
      for (let i = 0; i < 8; i++) {
        const stoneGeo = new THREE.DodecahedronGeometry(0.35);
        const stone = new THREE.Mesh(stoneGeo, stoneMat);
        const angle = (i / 8) * Math.PI * 2;
        stone.position.set(Math.cos(angle) * 0.9, 0.25, Math.sin(angle) * 0.9);
        group.add(stone);
      }

      // Burning logs
      const logMat = new THREE.MeshStandardMaterial({ color: 0x271911 });
      for (let j = 0; j < 4; j++) {
        const logGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.4, 6);
        const log = new THREE.Mesh(logGeo, logMat);
        log.rotation.z = Math.PI / 4;
        log.rotation.y = (j * Math.PI) / 2;
        log.position.y = 0.4;
        group.add(log);
      }

      // Fire Core
      const fireGeo = new THREE.ConeGeometry(0.55, 1.2, 8);
      const fireMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      const fire = new THREE.Mesh(fireGeo, fireMat);
      fire.position.y = 0.8;
      group.add(fire);
    } else if (type === 'jarl_throne') {
      // Throne base
      const seatGeo = new THREE.BoxGeometry(1.6, 0.65, 1.4);
      const seatMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.y = 0.45;
      group.add(seat);

      // Backrest
      const backGeo = new THREE.BoxGeometry(1.6, 2.2, 0.25);
      const back = new THREE.Mesh(backGeo, seatMat);
      back.position.set(0, 1.5, -0.6);
      group.add(back);

      // Dragon horn crests
      const hornGeo = new THREE.ConeGeometry(0.18, 0.9, 6);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
      const h1 = new THREE.Mesh(hornGeo, hornMat);
      h1.position.set(-0.7, 2.8, -0.6);
      const h2 = new THREE.Mesh(hornGeo, hornMat);
      h2.position.set(0.7, 2.8, -0.6);
      group.add(h1);
      group.add(h2);
    }

    return group;
  }

  placeStructure(
    playerPos: THREE.Vector3,
    playerRotY: number,
    playerName: string,
    wood: number,
    iron: number,
    silver: number
  ): { success: boolean; cost?: { wood: number; iron: number; silver: number }; reason?: string } {
    const bp = BUILDABLE_BLUEPRINTS.find((b) => b.type === this.activeType);
    if (!bp) return { success: false, reason: 'Unknown blueprint' };

    if (wood < bp.woodCost || iron < bp.ironCost || silver < bp.silverCost) {
      return { success: false, reason: `Need ${bp.woodCost} Wood, ${bp.ironCost} Iron, ${bp.silverCost} Silver!` };
    }

    // Place 3.5m in front of player
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotY);
    const placeX = +(playerPos.x + forward.x * 3.8).toFixed(2);
    const placeZ = +(playerPos.z + forward.z * 3.8).toFixed(2);
    const placeY = 3.24;

    const id = `struct_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const mesh = this.buildStructureMesh(this.activeType);
    mesh.position.set(placeX, placeY, placeZ);
    mesh.rotation.y = playerRotY;
    this.scene.add(mesh);

    this.structureMeshes.set(id, mesh);
    this.placedStructures.push({
      id,
      type: this.activeType,
      x: placeX,
      y: placeY,
      z: placeZ,
      rotY: playerRotY,
      health: bp.maxHealth,
      maxHealth: bp.maxHealth,
      ownerName: playerName,
      createdAt: Date.now(),
    });

    sound.playHammerHit();
    return {
      success: true,
      cost: { wood: bp.woodCost, iron: bp.ironCost, silver: bp.silverCost },
    };
  }

  startRaidWave(waveNumber: number) {
    this.raidState.isActive = true;
    this.raidState.wave = waveNumber;
    const enemyCount = 4 + waveNumber * 3;
    this.raidState.enemiesRemaining = enemyCount;
    this.raidState.totalEnemies = enemyCount;
    this.raidState.rewardSilver = 150 + waveNumber * 75;
    this.raidState.rewardValor = 200 + waveNumber * 100;

    // Spawn raiders at perimeter
    this.raidEnemies = [];
    for (let i = 0; i < enemyCount; i++) {
      const angle = (i / enemyCount) * Math.PI * 2;
      const spawnDist = 45 + Math.random() * 15;
      const sx = Math.cos(angle) * spawnDist;
      const sz = Math.sin(angle) * spawnDist;

      const group = new THREE.Group();
      // Blocky Raider Body
      const bodyGeo = new THREE.BoxGeometry(0.9, 1.5, 0.6);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.0;
      group.add(body);

      // Raider Helmet
      const helmGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      const helmMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const helm = new THREE.Mesh(helmGeo, helmMat);
      helm.position.y = 2.0;
      group.add(helm);

      group.position.set(sx, 3.24, sz);
      this.scene.add(group);

      this.raidEnemies.push({
        mesh: group,
        health: 80 + waveNumber * 25,
        maxHealth: 80 + waveNumber * 25,
        speed: 4.5 + Math.random() * 1.5,
        damage: 15 + waveNumber * 4,
        name: `Saxon Raider #${i + 1}`,
      });
    }

    sound.playWarHorn();
  }

  update(delta: number, playerPos: THREE.Vector3, onWaveComplete?: (silver: number, valor: number) => void) {
    // Update hologram preview position
    if (this.isBuildMode && this.previewMesh) {
      this.previewMesh.position.set(playerPos.x, 3.24, playerPos.z);
    }

    // Auto-fire defense ballistas at nearest raid enemies
    if (this.raidState.isActive && this.raidEnemies.length > 0) {
      this.ballistaCooldown -= delta;
      if (this.ballistaCooldown <= 0) {
        for (const s of this.placedStructures) {
          if (s.type === 'defense_ballista') {
            // Find closest enemy within 28m
            let closest: RaidEnemy | null = null;
            let minDist = 28;
            for (const e of this.raidEnemies) {
              const dist = Math.hypot(e.mesh.position.x - s.x, e.mesh.position.z - s.z);
              if (dist < minDist) {
                minDist = dist;
                closest = e;
              }
            }

            if (closest) {
              closest.health -= 45;
              sound.playCriticalHit();
              this.ballistaCooldown = 1.8;
              break;
            }
          }
        }
      }

      // Move raid enemies toward player or nearest fortress wall
      for (let i = this.raidEnemies.length - 1; i >= 0; i--) {
        const enemy = this.raidEnemies[i];

        if (enemy.health <= 0) {
          this.scene.remove(enemy.mesh);
          this.raidEnemies.splice(i, 1);
          this.raidState.enemiesRemaining = this.raidEnemies.length;
          continue;
        }

        const toPlayer = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position);
        toPlayer.y = 0;
        toPlayer.normalize();

        enemy.mesh.position.addScaledVector(toPlayer, enemy.speed * delta);
        enemy.mesh.lookAt(playerPos.x, enemy.mesh.position.y, playerPos.z);
      }

      // Check wave clear
      if (this.raidEnemies.length === 0) {
        this.raidState.isActive = false;
        sound.playVictoryTriumph();
        if (onWaveComplete) {
          onWaveComplete(this.raidState.rewardSilver, this.raidState.rewardValor);
        }
      }
    }
  }
}
