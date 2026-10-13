import * as THREE from 'three';
import { sound } from '../audio/soundEngine';

interface DroppedItem {
  id: string;
  type: 'wood' | 'silver' | 'gold';
  mesh: THREE.Mesh;
  progress: number; // 0 to 1 along conveyor
  value: number;
}

export class TycoonConveyorSim {
  public group: THREE.Group;
  private beltMesh: THREE.Mesh;
  private furnaceMesh: THREE.Mesh;
  private dropperMesh1: THREE.Mesh;
  private dropperMesh2: THREE.Mesh;
  private items: DroppedItem[] = [];
  private dropTimer: number = 0;
  private flameLight: THREE.PointLight;
  public uncollectedPool: number = 0;
  private onFurnaceSmelt?: (val: number, pos: THREE.Vector3) => void;

  // Origin position in Katfjord Village
  private origin = new THREE.Vector3(16, 3.2, 16);

  constructor(scene: THREE.Scene, onFurnaceSmelt?: (val: number, pos: THREE.Vector3) => void) {
    this.group = new THREE.Group();
    this.group.position.copy(this.origin);
    scene.add(this.group);
    this.onFurnaceSmelt = onFurnaceSmelt;

    // 1. Conveyor Belt Track (10 units long, 2 units wide)
    const beltGeo = new THREE.BoxGeometry(2.0, 0.35, 10.0);
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.8,
    });
    this.beltMesh = new THREE.Mesh(beltGeo, beltMat);
    this.beltMesh.position.set(0, 0.4, 0);
    this.beltMesh.castShadow = true;
    this.beltMesh.receiveShadow = true;
    this.group.add(this.beltMesh);

    // Conveyor guard rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
    [-1.05, 1.05].forEach((rx) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 10.2), railMat);
      rail.position.set(rx, 0.6, 0);
      this.group.add(rail);
    });

    // Support pillars
    [-3.5, 0, 3.5].forEach((pz) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 })
      );
      leg.position.set(0, 0, pz);
      this.group.add(leg);
    });

    // 2. Overhead Dropper Chutes (at start of belt z: 4.5)
    const gantryMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const gantry = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.0, 0.6), gantryMat);
    gantry.position.set(0, 2.5, 4.2);
    this.group.add(gantry);

    // Dropper 1: Timber Dropper
    const dropperMat1 = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
    this.dropperMesh1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 1.4, 8), dropperMat1);
    this.dropperMesh1.position.set(-0.6, 3.8, 4.2);
    this.group.add(this.dropperMesh1);

    // Dropper 2: Silver Mine Dropper
    const dropperMat2 = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
    });
    this.dropperMesh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 1.4, 8), dropperMat2);
    this.dropperMesh2.position.set(0.6, 3.8, 4.2);
    this.group.add(this.dropperMesh2);

    // 3. Collector Smelter Furnace (at end of belt z: -5.2)
    const furnaceMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.9,
    });
    this.furnaceMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.2, 3.2), furnaceMat);
    this.furnaceMesh.position.set(0, 1.6, -5.8);
    this.furnaceMesh.castShadow = true;
    this.group.add(this.furnaceMesh);

    // Glowing Forge Opening
    const openingGeo = new THREE.BoxGeometry(2.0, 1.4, 0.4);
    const openingMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xf97316,
      emissiveIntensity: 1.5,
    });
    const opening = new THREE.Mesh(openingGeo, openingMat);
    opening.position.set(0, 1.2, -4.3);
    this.group.add(opening);

    // Chimney Stack
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.6, 2.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x111827 })
    );
    chimney.position.set(0, 3.8, -5.8);
    this.group.add(chimney);

    // PointLight for glowing fire
    this.flameLight = new THREE.PointLight(0xf97316, 2.5, 9);
    this.flameLight.position.set(0, 1.5, -4.0);
    this.group.add(this.flameLight);
  }

  public spawnDrop() {
    const isSilver = Math.random() > 0.4;
    const type = isSilver ? 'silver' : 'wood';
    const value = isSilver ? 15 : 8;

    const geo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const mat = new THREE.MeshStandardMaterial(
      isSilver
        ? { color: 0xf1f5f9, metalness: 0.95, roughness: 0.1, emissive: 0x94a3b8, emissiveIntensity: 0.3 }
        : { color: 0xb45309, roughness: 0.85 }
    );
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;

    // Start at dropper position (z: 4.2)
    const startX = (Math.random() - 0.5) * 0.8;
    mesh.position.set(startX, 0.8, 4.2);
    this.group.add(mesh);

    this.items.push({
      id: Math.random().toString(36).slice(2, 9),
      type,
      mesh,
      progress: 0,
      value,
    });
  }

  public update(delta: number) {
    const time = performance.now() * 0.001;
    this.flameLight.intensity = 2.0 + Math.sin(time * 12) * 0.5;

    // Timer to drop new items
    this.dropTimer += delta;
    if (this.dropTimer > 1.6) {
      this.spawnDrop();
      this.dropTimer = 0;
    }

    // Move items along conveyor from z: 4.2 to z: -4.3 (travel distance ~8.5)
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.progress += delta * 0.32; // speed
      item.mesh.position.z = 4.2 - item.progress * 8.5;
      item.mesh.rotation.y += delta * 1.5;

      // Arrived at smelter furnace
      if (item.progress >= 1.0) {
        this.uncollectedPool += item.value;
        const worldPos = item.mesh.getWorldPosition(new THREE.Vector3());

        if (this.onFurnaceSmelt) {
          this.onFurnaceSmelt(item.value, worldPos);
        }

        this.group.remove(item.mesh);
        item.mesh.geometry.dispose();
        if (Array.isArray(item.mesh.material)) {
          item.mesh.material.forEach((m) => m.dispose());
        } else {
          item.mesh.material.dispose();
        }
        this.items.splice(i, 1);
      }
    }
  }

  public collectPool(): number {
    const collected = this.uncollectedPool;
    if (collected > 0) {
      sound.playCoinCollect();
      this.uncollectedPool = 0;
    }
    return collected;
  }
}
