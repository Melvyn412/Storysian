import * as THREE from 'three';
import { ClanConquestTower } from '../types';
import { CONQUEST_TOWERS } from './robloxFeaturesConfig';
import { sound } from '../audio/soundEngine';

export class ClanConquestManager {
  scene: THREE.Scene;
  towers: ClanConquestTower[] = [];
  towerMeshes: Map<string, THREE.Group> = new Map();
  bannerMeshes: Map<string, THREE.Mesh> = new Map();
  dividendTimer: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.towers = JSON.parse(JSON.stringify(CONQUEST_TOWERS));
    this.buildTowerMeshes();
  }

  buildTowerMeshes() {
    this.towers.forEach((t) => {
      const group = new THREE.Group();

      // Stone Base Platform
      const baseGeo = new THREE.CylinderGeometry(4.2, 4.8, 1.2, 8);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.6;
      group.add(base);

      // Tower Spire Column
      const colGeo = new THREE.CylinderGeometry(1.8, 2.4, 12, 8);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.y = 6.6;
      group.add(col);

      // Glowing Runic Crystal on top
      const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: t.controllingClan ? 0xf59e0b : 0x94a3b8,
        emissive: t.controllingClan ? 0xd97706 : 0x475569,
        emissiveIntensity: 0.8,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 13.5;
      group.add(crystal);

      // Floating Flag / Clan Banner
      const bannerGeo = new THREE.PlaneGeometry(2.4, 4.0);
      const bannerMat = new THREE.MeshStandardMaterial({
        color: t.controllingClan === 'Katfjord Clan' ? 0xd97706 : t.controllingClan ? 0xef4444 : 0x64748b,
        side: THREE.DoubleSide,
      });
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.set(0, 10.5, 2.2);
      group.add(banner);
      this.bannerMeshes.set(t.id, banner);

      // Beacon light
      const light = new THREE.PointLight(t.controllingClan ? 0xfbbf24 : 0x38bdf8, 2.0, 22);
      light.position.y = 13.5;
      group.add(light);

      group.position.set(t.x, 3.24, t.z);
      this.scene.add(group);
      this.towerMeshes.set(t.id, group);
    });
  }

  update(
    delta: number,
    playerPos: THREE.Vector3,
    playerClan: string,
    onTowerCaptured?: (tower: ClanConquestTower) => void,
    onDividendsEarned?: (silver: number, valor: number) => void
  ) {
    const CAPTURE_RADIUS = 9.5;

    // Check tower capture by player
    for (const t of this.towers) {
      const dist = Math.hypot(playerPos.x - t.x, playerPos.z - t.z);

      if (dist <= CAPTURE_RADIUS) {
        if (t.controllingClan !== playerClan) {
          t.isContested = true;
          // Capture rate: 25% per second
          t.capturePercent += 25 * delta;

          if (t.capturePercent >= 100) {
            t.controllingClan = playerClan;
            t.capturePercent = 100;
            t.isContested = false;

            // Update banner color
            const banner = this.bannerMeshes.get(t.id);
            if (banner) {
              (banner.material as THREE.MeshStandardMaterial).color.setHex(0xd97706);
            }

            sound.playVictoryTriumph();
            if (onTowerCaptured) onTowerCaptured(t);
          }
        } else {
          t.isContested = false;
        }
      } else {
        t.isContested = false;
      }
    }

    // Clan Dividend timer (every 45s)
    this.dividendTimer += delta;
    if (this.dividendTimer >= 45) {
      this.dividendTimer = 0;
      const towersHeld = this.towers.filter((t) => t.controllingClan === playerClan).length;
      if (towersHeld > 0 && onDividendsEarned) {
        const silver = towersHeld * 120;
        const valor = towersHeld * 150;
        onDividendsEarned(silver, valor);
      }
    }
  }
}
