import * as THREE from 'three';
import { DraugrEnemyState, CryptSarcophagus } from '../types';
import { sound } from '../audio/soundEngine';

export class DraugrCryptManager {
  scene: THREE.Scene;
  entranceMesh: THREE.Group | null = null;
  dungeonGroup: THREE.Group | null = null;
  draugrs: DraugrEnemyState[] = [];
  draugrMeshes: Map<string, THREE.Group> = new Map();
  sarcophagi: CryptSarcophagus[] = [];
  sarcophagiMeshes: Map<string, THREE.Group> = new Map();
  isInsideCrypt: boolean = false;

  // Crypt Barrow entrance coordinates in Katfjord
  static ENTRANCE_POS = new THREE.Vector3(-65, 3.24, -55);
  // Interior dungeon spawn coordinates
  static CRYPT_INTERIOR_SPAWN = new THREE.Vector3(-200, 2.0, -200);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildEntranceBarrow();
    this.buildDungeonInterior();
  }

  buildEntranceBarrow() {
    const group = new THREE.Group();

    // Earth Barrow Mound
    const moundGeo = new THREE.SphereGeometry(6.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const moundMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 });
    const mound = new THREE.Mesh(moundGeo, moundMat);
    group.add(mound);

    // Stone Portal Megaliths (Stonehenge style trilithon)
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const pillarGeo = new THREE.BoxGeometry(1.2, 4.2, 1.2);
    const p1 = new THREE.Mesh(pillarGeo, stoneMat);
    p1.position.set(-2.0, 2.1, 5.0);
    const p2 = new THREE.Mesh(pillarGeo, stoneMat);
    p2.position.set(2.0, 2.1, 5.0);
    group.add(p1);
    group.add(p2);

    const lintelGeo = new THREE.BoxGeometry(5.4, 1.0, 1.4);
    const lintel = new THREE.Mesh(lintelGeo, stoneMat);
    lintel.position.set(0, 4.4, 5.0);
    group.add(lintel);

    // Green Runic Entrance Portal Vortex
    const portalGeo = new THREE.PlaneGeometry(3.2, 3.8);
    const portalMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.position.set(0, 2.1, 4.8);
    group.add(portal);

    // Runestone Marker
    const runeGeo = new THREE.BoxGeometry(0.8, 1.8, 0.4);
    const runeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x059669,
      emissiveIntensity: 0.4,
    });
    const rune = new THREE.Mesh(runeGeo, runeMat);
    rune.position.set(3.5, 0.9, 5.5);
    group.add(rune);

    group.position.copy(DraugrCryptManager.ENTRANCE_POS);
    this.scene.add(group);
    this.entranceMesh = group;
  }

  buildDungeonInterior() {
    const dungeon = new THREE.Group();
    const center = DraugrCryptManager.CRYPT_INTERIOR_SPAWN;

    // Crypt Floor (Obsidian stone slabs)
    const floorGeo = new THREE.BoxGeometry(50, 1, 50);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(center.x, center.y - 0.5, center.z);
    dungeon.add(floor);

    // High Crypt Ceiling
    const ceil = floor.clone();
    ceil.position.y = center.y + 10.0;
    dungeon.add(ceil);

    // Crypt Stone Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const pillarOffsets = [
      [-12, -12],
      [12, -12],
      [-12, 12],
      [12, 12],
    ];
    pillarOffsets.forEach(([px, pz]) => {
      const colGeo = new THREE.CylinderGeometry(1.2, 1.4, 10, 8);
      const col = new THREE.Mesh(colGeo, pillarMat);
      col.position.set(center.x + px, center.y + 5, center.z + pz);
      dungeon.add(col);

      // Green Spectral Torch on each pillar
      const torchLight = new THREE.PointLight(0x34d399, 1.8, 16);
      torchLight.position.set(center.x + px, center.y + 4.5, center.z + pz);
      dungeon.add(torchLight);
    });

    // Exit Teleport Portal back to surface
    const exitGeo = new THREE.TorusGeometry(1.6, 0.25, 8, 24);
    const exitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const exitPortal = new THREE.Mesh(exitGeo, exitMat);
    exitPortal.position.set(center.x, center.y + 2.0, center.z + 20);
    dungeon.add(exitPortal);

    this.scene.add(dungeon);
    this.dungeonGroup = dungeon;

    // Spawn 3 Ancient Sarcophagi
    const sarcOffsets = [
      { id: 'sarc_1', x: center.x - 14, z: center.z, silver: 180, valor: 250 },
      { id: 'sarc_2', x: center.x + 14, z: center.z, silver: 220, valor: 300 },
      { id: 'sarc_3', x: center.x, z: center.z - 16, silver: 450, valor: 600, item: 'Ancient Runic Draugr Blade' },
    ];

    sarcOffsets.forEach((s) => {
      const group = new THREE.Group();
      // Stone Coffin Box
      const coffinGeo = new THREE.BoxGeometry(2.4, 1.1, 4.4);
      const coffinMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
      const coffin = new THREE.Mesh(coffinGeo, coffinMat);
      coffin.position.y = 0.55;
      group.add(coffin);

      // Carved Lid
      const lidGeo = new THREE.BoxGeometry(2.6, 0.35, 4.6);
      const lidMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        emissive: 0x059669,
        emissiveIntensity: 0.15,
      });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.y = 1.25;
      group.add(lid);

      group.position.set(s.x, center.y, s.z);
      this.scene.add(group);

      this.sarcophagi.push({
        id: s.id,
        x: s.x,
        z: s.z,
        opened: false,
        rewardSilver: s.silver,
        rewardValor: s.valor,
        itemDrop: s.item,
      });
      this.sarcophagiMeshes.set(s.id, group);
    });

    // Spawn Draugr Skeletons
    this.spawnDraugrs();
  }

  spawnDraugrs() {
    const center = DraugrCryptManager.CRYPT_INTERIOR_SPAWN;
    const draugrDefs = [
      { id: 'd1', name: 'Draugr Barrow Warrior', type: 'draugr_warrior' as const, x: center.x - 8, z: center.z - 6, hp: 160 },
      { id: 'd2', name: 'Draugr Tomb Archer', type: 'draugr_archer' as const, x: center.x + 8, z: center.z - 6, hp: 120 },
      { id: 'd3', name: 'Lord Wight of the Barrow', type: 'crypt_wight' as const, x: center.x, z: center.z - 12, hp: 380 },
    ];

    draugrDefs.forEach((d) => {
      const group = new THREE.Group();

      // Skeletal Blue / Grey Body
      const bodyGeo = new THREE.BoxGeometry(0.85, 1.6, 0.5);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        emissive: 0x047857,
        emissiveIntensity: 0.25,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.0;
      group.add(body);

      // Glowing Cyan Eye Skull
      const headGeo = new THREE.BoxGeometry(0.65, 0.65, 0.65);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.y = 2.0;
      group.add(head);

      const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
      const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
      eye1.position.set(-0.16, 2.05, 0.35);
      const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
      eye2.position.set(0.16, 2.05, 0.35);
      group.add(eye1);
      group.add(eye2);

      // Rusty Sword / Staff
      const bladeGeo = new THREE.BoxGeometry(0.12, 1.8, 0.2);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x71717a, roughness: 0.9 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0.6, 1.1, 0.3);
      group.add(blade);

      group.position.set(d.x, center.y, d.z);
      this.scene.add(group);

      this.draugrs.push({
        id: d.id,
        name: d.name,
        type: d.type,
        health: d.hp,
        maxHealth: d.hp,
        x: d.x,
        y: center.y,
        z: d.z,
        isAlive: true,
      });
      this.draugrMeshes.set(d.id, group);
    });
  }

  openSarcophagus(
    sarcId: string
  ): { success: boolean; rewardSilver: number; rewardValor: number; itemDrop?: string } | null {
    const s = this.sarcophagi.find((item) => item.id === sarcId);
    if (!s || s.opened) return null;

    s.opened = true;
    const mesh = this.sarcophagiMeshes.get(sarcId);
    if (mesh) {
      // Slide lid off coffin
      const lid = mesh.children[1];
      if (lid) lid.position.z += 1.8;
    }

    sound.playVictoryTriumph();
    return {
      success: true,
      rewardSilver: s.rewardSilver,
      rewardValor: s.rewardValor,
      itemDrop: s.itemDrop,
    };
  }

  update(delta: number, playerPos: THREE.Vector3, onAttackPlayer?: (damage: number) => void) {
    const center = DraugrCryptManager.CRYPT_INTERIOR_SPAWN;
    this.isInsideCrypt = Math.hypot(playerPos.x - center.x, playerPos.z - center.z) < 35;

    if (!this.isInsideCrypt) return;

    // AI movement for living Draugr
    for (const d of this.draugrs) {
      if (!d.isAlive) continue;

      const mesh = this.draugrMeshes.get(d.id);
      if (!mesh) continue;

      const dist = Math.hypot(playerPos.x - mesh.position.x, playerPos.z - mesh.position.z);
      if (dist < 18 && dist > 1.8) {
        // March toward player
        const toPlayer = new THREE.Vector3(playerPos.x - mesh.position.x, 0, playerPos.z - mesh.position.z).normalize();
        mesh.position.addScaledVector(toPlayer, (d.type === 'crypt_wight' ? 3.5 : 2.8) * delta);
        mesh.lookAt(playerPos.x, mesh.position.y, playerPos.z);
        d.x = mesh.position.x;
        d.z = mesh.position.z;
      } else if (dist <= 1.8 && Math.random() < 0.04) {
        // Strike player
        sound.playHitImpact(false);
        if (onAttackPlayer) onAttackPlayer(d.type === 'crypt_wight' ? 24 : 14);
      }
    }
  }
}
