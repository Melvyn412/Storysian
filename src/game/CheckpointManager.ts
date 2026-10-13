import * as THREE from 'three';
import { sound } from '../audio/soundEngine';

export interface CheckpointData {
  id: string;
  name: string;
  position: THREE.Vector3;
  meshGroup: THREE.Group;
  hologramRing: THREE.Mesh;
  beamMesh: THREE.Mesh;
  padMesh: THREE.Mesh;
}

export class CheckpointManager {
  public group: THREE.Group;
  public checkpoints: CheckpointData[] = [];
  public activeCheckpointId: string = 'katfjord_pier';
  private onCheckpointActivated?: (name: string) => void;

  constructor(scene: THREE.Scene, onCheckpointActivated?: (name: string) => void) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.onCheckpointActivated = onCheckpointActivated;

    this.createCheckpoints();
  }

  private createCheckpoints() {
    const rawCheckpoints = [
      { id: 'katfjord_pier', name: 'Katfjord Pier Spawn Pad', x: 0, y: 3.24, z: 20 },
      { id: 'katfjord_hall', name: 'Katfjord Great Hall', x: 0, y: 3.5, z: -25 },
      { id: 'valhalla_stage_1', name: 'Valhalla Sky Obby - Stage 1', x: 20, y: 10.5, z: 25 },
      { id: 'valhalla_stage_2', name: 'Valhalla Sky Obby - Stage 2', x: -8, y: 17.0, z: -24 },
      { id: 'valhalla_stage_3', name: 'Valhalla Sky Obby - Stage 3', x: -14, y: 22.0, z: -44 },
      { id: 'valhalla_summit', name: 'Valhalla Sky Obby - Summit', x: -18, y: 27.5, z: -61 },
    ];

    rawCheckpoints.forEach((cp) => {
      const cpGroup = new THREE.Group();
      cpGroup.position.set(cp.x, cp.y, cp.z);

      const isActive = cp.id === this.activeCheckpointId;

      // 1. Base Chequered Neon Pad
      const padGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.3, 16);
      const padMat = new THREE.MeshStandardMaterial({
        color: isActive ? 0x10b981 : 0x0284c7,
        emissive: isActive ? 0x059669 : 0x0369a1,
        emissiveIntensity: isActive ? 0.8 : 0.35,
        roughness: 0.2,
        metalness: 0.6,
      });
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.receiveShadow = true;
      cpGroup.add(padMesh);

      // Inner glow circle
      const innerGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.32, 16);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: isActive ? 0x34d399 : 0x38bdf8,
        emissiveIntensity: 0.6,
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      cpGroup.add(innerMesh);

      // 2. Spinning Hologram Ring above pad
      const ringGeo = new THREE.TorusGeometry(1.2, 0.08, 8, 24);
      const ringMat = new THREE.MeshStandardMaterial({
        color: isActive ? 0x6ee7b7 : 0x7dd3fc,
        emissive: isActive ? 0x10b981 : 0x0284c7,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.85,
      });
      const hologramRing = new THREE.Mesh(ringGeo, ringMat);
      hologramRing.position.y = 1.6;
      hologramRing.rotation.x = Math.PI / 2;
      cpGroup.add(hologramRing);

      // 3. Vertical light pillar beam
      const beamGeo = new THREE.CylinderGeometry(0.35, 0.7, 5, 12, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: isActive ? 0x10b981 : 0x0284c7,
        transparent: true,
        opacity: isActive ? 0.35 : 0.12,
        side: THREE.DoubleSide,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.y = 2.5;
      cpGroup.add(beamMesh);

      this.group.add(cpGroup);

      this.checkpoints.push({
        id: cp.id,
        name: cp.name,
        position: new THREE.Vector3(cp.x, cp.y, cp.z),
        meshGroup: cpGroup,
        hologramRing,
        beamMesh,
        padMesh,
      });
    });
  }

  public getActivePosition(): THREE.Vector3 {
    const active = this.checkpoints.find((c) => c.id === this.activeCheckpointId);
    if (active) {
      return active.position.clone().add(new THREE.Vector3(0, 0.4, 0));
    }
    return new THREE.Vector3(0, 3.24, 20);
  }

  public getActiveName(): string {
    const active = this.checkpoints.find((c) => c.id === this.activeCheckpointId);
    return active ? active.name : 'Katfjord Pier Spawn Pad';
  }

  public setCheckpoint(id: string) {
    if (this.activeCheckpointId === id) return;
    this.activeCheckpointId = id;
    this.updateVisuals();

    const target = this.checkpoints.find((c) => c.id === id);
    if (target && this.onCheckpointActivated) {
      this.onCheckpointActivated(target.name);
    }
  }

  private updateVisuals() {
    this.checkpoints.forEach((cp) => {
      const isActive = cp.id === this.activeCheckpointId;
      const padMat = cp.padMesh.material as THREE.MeshStandardMaterial;
      const ringMat = cp.hologramRing.material as THREE.MeshStandardMaterial;
      const beamMat = cp.beamMesh.material as THREE.MeshBasicMaterial;

      if (isActive) {
        padMat.color.setHex(0x10b981);
        padMat.emissive.setHex(0x059669);
        padMat.emissiveIntensity = 0.85;

        ringMat.color.setHex(0x6ee7b7);
        ringMat.emissive.setHex(0x10b981);

        beamMat.color.setHex(0x10b981);
        beamMat.opacity = 0.4;
      } else {
        padMat.color.setHex(0x0284c7);
        padMat.emissive.setHex(0x0369a1);
        padMat.emissiveIntensity = 0.3;

        ringMat.color.setHex(0x7dd3fc);
        ringMat.emissive.setHex(0x0284c7);

        beamMat.color.setHex(0x0284c7);
        beamMat.opacity = 0.12;
      }
    });
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    const time = performance.now() * 0.001;

    // Animate hologram rings & light beams
    this.checkpoints.forEach((cp) => {
      cp.hologramRing.rotation.z += 1.8 * delta;
      cp.hologramRing.position.y = 1.6 + Math.sin(time * 3 + cp.position.x) * 0.15;

      const isActive = cp.id === this.activeCheckpointId;
      if (isActive) {
        cp.beamMesh.scale.x = 1 + Math.sin(time * 4) * 0.1;
        cp.beamMesh.scale.z = cp.beamMesh.scale.x;
      }

      // Check proximity to player (within 2.2 units)
      const distSq = cp.position.distanceToSquared(playerPos);
      if (distSq < 2.3 * 2.3 && this.activeCheckpointId !== cp.id) {
        this.activeCheckpointId = cp.id;
        this.updateVisuals();
        sound.playCheckpointChime();
        if (this.onCheckpointActivated) {
          this.onCheckpointActivated(cp.name);
        }
      }
    });
  }
}
