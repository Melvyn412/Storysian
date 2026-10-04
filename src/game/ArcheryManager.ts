import * as THREE from 'three';
import { ArrowType, TargetScoreRecord } from '../types';
import { ARROW_TYPES } from './robloxFeaturesConfig';
import { sound } from '../audio/soundEngine';

interface ActiveArrow {
  mesh: THREE.Group;
  velocity: THREE.Vector3;
  type: ArrowType;
  lifetime: number;
  damage: number;
  startPos: THREE.Vector3;
}

interface ArcheryTarget {
  mesh: THREE.Group;
  position: THREE.Vector3;
  radius: number;
}

export class ArcheryManager {
  scene: THREE.Scene;
  activeArrows: ActiveArrow[] = [];
  targets: ArcheryTarget[] = [];
  selectedArrowType: ArrowType = 'bodkin';
  quiverStock: Record<ArrowType, number> = {
    bodkin: 99,
    flame: 25,
    frost: 20,
  };
  scoreLog: TargetScoreRecord[] = [];
  totalScore: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnArcheryRangeTargets();
  }

  spawnArcheryRangeTargets() {
    // Village Archery Practice Range near barracks (X: -18, Y: 3.2, Z: 6 to 14)
    const targetPositions = [
      new THREE.Vector3(-18, 4.2, 8),
      new THREE.Vector3(-22, 4.2, 14),
      new THREE.Vector3(-26, 4.2, 20),
    ];

    targetPositions.forEach((pos, idx) => {
      const group = new THREE.Group();

      // Wooden Post Stand
      const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.6, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = -0.5;
      group.add(post);

      // Straw Target Backing
      const strawGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.25, 24);
      const strawMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
      const strawBack = new THREE.Mesh(strawGeo, strawMat);
      strawBack.rotation.x = Math.PI / 2;
      group.add(strawBack);

      // Concentric Rings: White Outer (Ring 1)
      const outerGeo = new THREE.RingGeometry(0.8, 1.15, 24);
      const outerMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, side: THREE.DoubleSide });
      const outer = new THREE.Mesh(outerGeo, outerMat);
      outer.position.z = 0.14;
      group.add(outer);

      // Black Middle (Ring 2)
      const midGeo = new THREE.RingGeometry(0.45, 0.8, 24);
      const midMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });
      const mid = new THREE.Mesh(midGeo, midMat);
      mid.position.z = 0.145;
      group.add(mid);

      // Blue Inner (Ring 3)
      const innerGeo = new THREE.RingGeometry(0.2, 0.45, 24);
      const innerMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.z = 0.15;
      group.add(inner);

      // Red / Gold Bullseye (Center)
      const bullseyeGeo = new THREE.CircleGeometry(0.2, 24);
      const bullseyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
      const bullseye = new THREE.Mesh(bullseyeGeo, bullseyeMat);
      bullseye.position.z = 0.155;
      group.add(bullseye);

      group.position.copy(pos);
      // Face towards Katfjord central square
      group.rotation.y = -Math.PI / 4;

      this.scene.add(group);
      this.targets.push({ mesh: group, position: pos, radius: 1.2 });
    });
  }

  createArrowMesh(type: ArrowType): THREE.Group {
    const group = new THREE.Group();
    const arrowDef = ARROW_TYPES.find((a) => a.id === type) || ARROW_TYPES[0];

    // Wooden Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.x = Math.PI / 2;
    group.add(shaft);

    // Arrowhead Tip
    const tipGeo = new THREE.ConeGeometry(0.065, 0.22, 6);
    const tipColor =
      type === 'flame' ? 0xf97316 : type === 'frost' ? 0x38bdf8 : 0x94a3b8;
    const tipMat = new THREE.MeshStandardMaterial({
      color: tipColor,
      roughness: 0.3,
      emissive: type === 'flame' ? 0xff4500 : type === 'frost' ? 0x0284c7 : 0x000000,
      emissiveIntensity: type !== 'bodkin' ? 0.7 : 0,
    });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.rotation.x = -Math.PI / 2;
    tip.position.z = 0.6;
    group.add(tip);

    // Fletching Feathers
    const featherGeo = new THREE.BoxGeometry(0.015, 0.14, 0.22);
    const featherMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
    const feather1 = new THREE.Mesh(featherGeo, featherMat);
    feather1.position.z = -0.45;
    group.add(feather1);

    const feather2 = feather1.clone();
    feather2.rotation.z = Math.PI / 2;
    group.add(feather2);

    return group;
  }

  shootArrow(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    drawPower: number = 1.0,
    customType?: ArrowType
  ): boolean {
    const type = customType || this.selectedArrowType;
    if (this.quiverStock[type] <= 0) {
      sound.playHitImpact(false);
      return false;
    }

    this.quiverStock[type]--;
    const arrowDef = ARROW_TYPES.find((a) => a.id === type) || ARROW_TYPES[0];

    const arrowMesh = this.createArrowMesh(type);
    arrowMesh.position.copy(origin);

    // Calculate velocity based on draw power (30 to 65 m/s)
    const speed = 25 + drawPower * 42;
    const velocity = direction.clone().normalize().multiplyScalar(speed);
    // Slight upward pitch for realistic ballistic arc
    velocity.y += 1.5;

    arrowMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.clone().normalize());

    this.scene.add(arrowMesh);

    this.activeArrows.push({
      mesh: arrowMesh,
      velocity,
      type,
      lifetime: 0,
      damage: Math.round(arrowDef.damage * (0.6 + drawPower * 0.7)),
      startPos: origin.clone(),
    });

    sound.playBowShoot();
    return true;
  }

  update(
    delta: number,
    onHitTarget?: (score: TargetScoreRecord) => void,
    onHitEnemy?: (damage: number, type: ArrowType, hitPos: THREE.Vector3) => void
  ) {
    const gravity = new THREE.Vector3(0, -9.8, 0);

    for (let i = this.activeArrows.length - 1; i >= 0; i--) {
      const arrow = this.activeArrows[i];
      arrow.lifetime += delta;

      // Apply gravity drop over time
      arrow.velocity.addScaledVector(gravity, delta);

      // Move arrow
      const prevPos = arrow.mesh.position.clone();
      arrow.mesh.position.addScaledVector(arrow.velocity, delta);

      // Rotate arrow to point in direction of velocity
      const dir = arrow.velocity.clone().normalize();
      if (dir.lengthSq() > 0.001) {
        arrow.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      }

      // Check collision with Target Bullseyes
      let hasCollided = false;
      for (const t of this.targets) {
        const dist = arrow.mesh.position.distanceTo(t.position);
        if (dist <= t.radius + 0.2) {
          const hitDistFromCenter = Math.hypot(
            arrow.mesh.position.x - t.position.x,
            arrow.mesh.position.y - t.position.y
          );
          const isBullseye = hitDistFromCenter < 0.28;
          const points = isBullseye ? 100 : hitDistFromCenter < 0.6 ? 50 : 25;
          const shotDist = Math.round(arrow.startPos.distanceTo(arrow.mesh.position));

          this.totalScore += points;
          const record: TargetScoreRecord = {
            points,
            distance: shotDist,
            isBullseye,
            timestamp: Date.now(),
          };
          this.scoreLog.unshift(record);

          sound.playCriticalHit();
          if (onHitTarget) onHitTarget(record);
          hasCollided = true;
          break;
        }
      }

      // Ground or water collision check
      if (!hasCollided && arrow.mesh.position.y <= 2.8) {
        sound.playWoodChop();
        hasCollided = true;
      }

      // Remove after collision or 4 seconds flight
      if (hasCollided || arrow.lifetime > 4.5) {
        this.scene.remove(arrow.mesh);
        this.activeArrows.splice(i, 1);
      }
    }
  }
}
