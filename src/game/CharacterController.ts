import * as THREE from 'three';
import { sound } from '../audio/soundEngine';
import { ToolType, AvatarSkin, EquippedGear, PetId, MountId } from '../types';
import { DEFAULT_EQUIPPED_GEAR } from './armoryConfig';
import { ObbyPlatformBox } from './VikingWorld';

export class CharacterController {
  public group: THREE.Group;
  public headMesh: THREE.Mesh;
  public torsoMesh: THREE.Mesh;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public helmetGroup: THREE.Group;
  public axeGroup: THREE.Group;
  public shieldGroup: THREE.Group;
  public hornGroup: THREE.Group;
  public meadGroup: THREE.Group;
  public torchGroup: THREE.Group;
  public hammerGroup: THREE.Group;
  public fishingRodGroup: THREE.Group;
  public bowGroup: THREE.Group;
  public petGroup: THREE.Group;
  public mountGroup: THREE.Group;
  public beardGroup: THREE.Group;
  public foragerBasketGroup: THREE.Group;
  public isYoungViking: boolean = false;
  public equippedGear: EquippedGear = { ...DEFAULT_EQUIPPED_GEAR };
  public activePetId: PetId | null = 'pet_odin_raven';
  public activeMountId: MountId | null = null;
  public isShiftLocked: boolean = false;
  public speedPassMultiplier: number = 1.0;
  public jumpPassMultiplier: number = 1.0;

  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public isGrounded: boolean = true;
  public isRunning: boolean = false;
  public isBlocking: boolean = false;
  public isAttacking: boolean = false;
  public attackTimer: number = 0;
  public whirlwindTimer: number = 0;
  public petOrbitTime: number = 0;
  public activeTool: ToolType = 'axe';

  // Camera settings
  public cameraTarget: THREE.Vector3;
  public cameraDistance: number = 11;
  public cameraPitch: number = 0.18; // Vertical angle (negative = looking UP at sky/settings, positive = looking DOWN)
  public cameraYaw: number = 0; // Horizontal angle
  public cameraShake: number = 0;
  public cameraMode: 'third_person' | 'close_look' | 'first_person' = 'third_person';

  // Viking Head & Upper-Body Gaze Tracking
  public headYaw: number = 0;
  public headPitch: number = 0;
  private idleGazeTimer: number = 0;
  private manualLookTimer: number = 0;

  // Animation state
  private walkTime: number = 0;
  private footstepTimer: number = 0;
  private activeEmote: string | null = null;
  private emoteTimer: number = 0;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    // Scale avatar down to classic Roblox minifigure scale
    this.group.scale.set(0.6, 0.6, 0.6);
    this.position = this.group.position;
    this.velocity = new THREE.Vector3();
    this.cameraTarget = new THREE.Vector3();

    // Spawn at Katfjord Village center (feet grounded at y=3)
    this.position.set(0, 3.24, 20);
    this.group.rotation.y = Math.PI;

    // Build blocky avatar
    const materials = this.createMaterials();

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(2.4, 2.8, 1.3);
    this.torsoMesh = new THREE.Mesh(torsoGeo, materials.torso);
    this.torsoMesh.position.y = 3.4;
    this.torsoMesh.castShadow = true;
    this.group.add(this.torsoMesh);

    // Belt buckle
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(2.45, 0.5, 1.35),
      new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 })
    );
    belt.position.y = -1.0;
    this.torsoMesh.add(belt);

    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.6, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 })
    );
    buckle.position.y = -1.0;
    this.torsoMesh.add(buckle);

    // 2. Head (Classic Roblox blocky head)
    const headGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    this.headMesh = new THREE.Mesh(headGeo, materials.skin);
    this.headMesh.position.y = 5.6;
    this.headMesh.castShadow = true;
    this.group.add(this.headMesh);

    // Roblox Viking Face Details (Eyes & Beard)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.05), eyeMat);
    eyeL.position.set(-0.4, 0.1, 0.81);
    this.headMesh.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.05), eyeMat);
    eyeR.position.set(0.4, 0.1, 0.81);
    this.headMesh.add(eyeR);

    // Fierce Braided Beard (Grouped so Young Viking mode can toggle to youthful face)
    this.beardGroup = new THREE.Group();
    const beard = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 1.2, 0.5),
      materials.beard
    );
    beard.position.set(0, -0.65, 0.75);
    this.beardGroup.add(beard);

    // Braids hanging down
    const braidL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), materials.beard);
    braidL.position.set(-0.45, -1.4, 0.65);
    this.beardGroup.add(braidL);

    const braidR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), materials.beard);
    braidR.position.set(0.45, -1.4, 0.65);
    this.beardGroup.add(braidR);
    this.headMesh.add(this.beardGroup);

    // Youthful cheerful smile (visible when beard is hidden in Young Viking mode)
    const smileMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, 0.05),
      eyeMat
    );
    smileMesh.position.set(0, -0.35, 0.81);
    this.headMesh.add(smileMesh);

    // 3. Viking Headwear / Helmet (Dynamic Armory Builder)
    this.helmetGroup = new THREE.Group();
    this.headMesh.add(this.helmetGroup);
    this.rebuildHeadwear(this.equippedGear.headwearId);

    // 4. Arms (Pivots at shoulder)
    const armGeo = new THREE.BoxGeometry(1.0, 2.7, 1.0);

    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-1.8, 4.6, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, materials.shirt);
    leftArmMesh.position.y = -1.2;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.group.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(1.8, 4.6, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, materials.shirt);
    rightArmMesh.position.y = -1.2;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.group.add(this.rightArm);

    // 5. Legs (Pivots at hip)
    const legGeo = new THREE.BoxGeometry(1.1, 2.8, 1.1);

    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.65, 2.2, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, materials.pants);
    leftLegMesh.position.y = -1.2;
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.65, 2.2, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, materials.pants);
    rightLegMesh.position.y = -1.2;
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);
    this.group.add(this.rightLeg);

    // Weapons and Items (Dynamic Armory Builders)
    this.axeGroup = new THREE.Group();
    this.axeGroup.position.set(0, -2.2, 0.4);
    this.rightArm.add(this.axeGroup);
    this.rebuildWeapon(this.equippedGear.weaponId);

    this.shieldGroup = new THREE.Group();
    this.shieldGroup.position.set(0, -1.2, 0.8);
    this.leftArm.add(this.shieldGroup);
    this.rebuildShield(this.equippedGear.shieldId);

    this.hornGroup = this.createWarHorn();
    this.hornGroup.position.set(0, -2.0, 0.5);
    this.hornGroup.visible = false;
    this.rightArm.add(this.hornGroup);

    this.meadGroup = this.createMeadTankard();
    this.meadGroup.position.set(0, -2.0, 0.5);
    this.meadGroup.visible = false;
    this.rightArm.add(this.meadGroup);

    this.torchGroup = this.createTorch();
    this.torchGroup.position.set(0, -2.0, 0.5);
    this.torchGroup.visible = false;
    this.rightArm.add(this.torchGroup);

    this.hammerGroup = this.createHammer();
    this.hammerGroup.position.set(0, -2.0, 0.5);
    this.hammerGroup.visible = false;
    this.rightArm.add(this.hammerGroup);

    this.fishingRodGroup = this.createFishingRod();
    this.fishingRodGroup.position.set(0, -2.0, 0.5);
    this.fishingRodGroup.visible = false;
    this.rightArm.add(this.fishingRodGroup);

    this.bowGroup = this.createBow();
    this.bowGroup.position.set(0, -2.0, 0.5);
    this.bowGroup.visible = false;
    this.leftArm.add(this.bowGroup);

    // 6. 3D Companion Pet & Rideable Mount Groups
    this.petGroup = new THREE.Group();
    this.petGroup.position.set(-2.9, 5.8, -0.8);
    this.group.add(this.petGroup);
    this.rebuildPet(this.activePetId);

    this.mountGroup = new THREE.Group();
    this.mountGroup.position.set(0, 0, 0);
    this.group.add(this.mountGroup);
    this.rebuildMount(this.activeMountId);

    // 7. Young Viking Forager's Woven Basket (worn on back in Young Viking Meadow Realm)
    this.foragerBasketGroup = new THREE.Group();
    const basketBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.65, 1.8, 10),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
    );
    basketBody.position.set(0, 0.1, -1.1);
    this.foragerBasketGroup.add(basketBody);

    const basketRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.86, 0.1, 8, 14),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
    );
    basketRim.rotation.x = Math.PI / 2;
    basketRim.position.set(0, 1.0, -1.1);
    this.foragerBasketGroup.add(basketRim);

    // Berries, glowing mushrooms & herbs peeking out of the woven basket
    const berry1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, emissive: 0x9f1239, emissiveIntensity: 0.4 })
    );
    berry1.position.set(-0.3, 1.1, -1.05);
    this.foragerBasketGroup.add(berry1);

    const mushroomCap = new THREE.Mesh(
      new THREE.ConeGeometry(0.34, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.7 })
    );
    mushroomCap.position.set(0.3, 1.2, -1.1);
    this.foragerBasketGroup.add(mushroomCap);

    const herbLeaf = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.32, 0),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.4 })
    );
    herbLeaf.position.set(0, 1.15, -1.25);
    this.foragerBasketGroup.add(herbLeaf);

    this.foragerBasketGroup.visible = false;
    this.torsoMesh.add(this.foragerBasketGroup);

    scene.add(this.group);
  }

  public setYoungVikingMode(enabled: boolean) {
    this.isYoungViking = enabled;
    if (enabled) {
      this.group.scale.set(0.47, 0.47, 0.47);
      this.beardGroup.visible = false;
      this.foragerBasketGroup.visible = true;
    } else {
      this.group.scale.set(0.6, 0.6, 0.6);
      this.beardGroup.visible = true;
      this.foragerBasketGroup.visible = false;
    }
  }

  private createMaterials() {
    return {
      skin: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 }), // Classic Roblox yellow/tanned
      torso: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 }), // Crimson Viking Tunic
      shirt: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 }),
      pants: new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.85 }), // Grey wool breeches
      beard: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 }), // Fiery Ginger Norse beard
      helmet: new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 }),
    };
  }

  public rebuildWeapon(weaponId: string) {
    this.axeGroup.clear();

    switch (weaponId) {
      case 'weapon_raider_broadsword': {
        const hilt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 })
        );
        hilt.position.y = -0.6;
        this.axeGroup.add(hilt);

        const guard = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.22, 0.35),
          new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.85, roughness: 0.3 })
        );
        guard.position.y = 0;
        this.axeGroup.add(guard);

        const pommel = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.9 })
        );
        pommel.position.y = -1.25;
        this.axeGroup.add(pommel);

        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.48, 3.8, 0.1),
          new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 })
        );
        blade.position.y = 1.9;
        this.axeGroup.add(blade);
        break;
      }

      case 'weapon_runic_ulfberht': {
        const hilt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
        );
        hilt.position.y = -0.6;
        this.axeGroup.add(hilt);

        const guard = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.25, 0.4),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.2 })
        );
        this.axeGroup.add(guard);

        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 4.0, 0.12),
          new THREE.MeshStandardMaterial({ color: 0xe0f2fe, metalness: 0.95, roughness: 0.1 })
        );
        blade.position.y = 2.0;
        this.axeGroup.add(blade);

        const runeCore = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 3.2, 0.16),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        runeCore.position.y = 1.8;
        this.axeGroup.add(runeCore);
        break;
      }

      case 'weapon_frostfang_cleaver': {
        const hilt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.14, 1.4, 8),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
        );
        hilt.position.y = -0.7;
        this.axeGroup.add(hilt);

        const guard = new THREE.Mesh(
          new THREE.BoxGeometry(2.0, 0.35, 0.45),
          new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
        );
        this.axeGroup.add(guard);

        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 4.4, 0.18),
          new THREE.MeshStandardMaterial({
            color: 0x7dd3fc,
            roughness: 0.1,
            metalness: 0.4,
            transparent: true,
            opacity: 0.85,
          })
        );
        blade.position.y = 2.2;
        this.axeGroup.add(blade);
        break;
      }

      case 'weapon_blood_reaver': {
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.15, 4.2, 6),
          new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.8 })
        );
        this.axeGroup.add(handle);

        [-1, 1].forEach((dir) => {
          const blade = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 1.6, 0.14),
            new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.2 })
          );
          blade.position.set(dir * 0.7, 1.4, 0);
          this.axeGroup.add(blade);
        });
        break;
      }

      case 'weapon_gram_dragon_slayer': {
        const hilt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.13, 1.5, 8),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
        );
        hilt.position.y = -0.75;
        this.axeGroup.add(hilt);

        const guard = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 0.35, 0.5),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.1 })
        );
        this.axeGroup.add(guard);

        const pommel = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 })
        );
        pommel.position.y = -1.55;
        this.axeGroup.add(pommel);

        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 4.8, 0.16),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.98, roughness: 0.1 })
        );
        blade.position.y = 2.4;
        this.axeGroup.add(blade);
        break;
      }

      case 'weapon_bearded_axe':
      default: {
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.14, 3.8, 6),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
        );
        this.axeGroup.add(handle);

        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 1.2, 0.15),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 })
        );
        blade.position.set(0.6, 1.3, 0);
        this.axeGroup.add(blade);
        break;
      }
    }
  }

  public rebuildShield(shieldId: string) {
    this.shieldGroup.clear();

    switch (shieldId) {
      case 'shield_wolf_targe': {
        const disc = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1.5, 0.2, 16),
          new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
        );
        disc.rotation.x = Math.PI / 2;
        this.shieldGroup.add(disc);

        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(1.48, 0.08, 6, 16),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 })
        );
        this.shieldGroup.add(rim);

        const boss = new THREE.Mesh(
          new THREE.SphereGeometry(0.48, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
        );
        boss.scale.z = 0.5;
        boss.position.z = 0.15;
        this.shieldGroup.add(boss);
        break;
      }

      case 'shield_bronze_sun': {
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 3.0, 0.18),
          new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.25 })
        );
        this.shieldGroup.add(body);

        const sunBoss = new THREE.Mesh(
          new THREE.SphereGeometry(0.65, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.9, roughness: 0.1 })
        );
        sunBoss.scale.z = 0.4;
        sunBoss.position.z = 0.16;
        this.shieldGroup.add(sunBoss);
        break;
      }

      case 'shield_frostfang_heater': {
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(1.6, 1.6, 0.24, 14),
          new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            metalness: 0.3,
            roughness: 0.1,
            transparent: true,
            opacity: 0.88,
          })
        );
        body.rotation.x = Math.PI / 2;
        this.shieldGroup.add(body);

        const frostCore = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.55),
          new THREE.MeshBasicMaterial({ color: 0xbae6fd })
        );
        frostCore.position.z = 0.2;
        this.shieldGroup.add(frostCore);
        break;
      }

      case 'shield_dragon_scale': {
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 2.8, 0.22),
          new THREE.MeshStandardMaterial({ color: 0x065f46, metalness: 0.7, roughness: 0.3 })
        );
        this.shieldGroup.add(body);

        const dragonCrest = new THREE.Mesh(
          new THREE.TorusGeometry(0.8, 0.12, 6, 8),
          new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.9 })
        );
        dragonCrest.position.z = 0.16;
        this.shieldGroup.add(dragonCrest);
        break;
      }

      case 'shield_aegis_valhalla': {
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 3.4, 0.2),
          new THREE.MeshStandardMaterial({ color: 0xa16207, metalness: 0.95, roughness: 0.15 })
        );
        this.shieldGroup.add(tower);

        const valhallaEmblem = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.98, roughness: 0.05 })
        );
        valhallaEmblem.scale.z = 0.35;
        valhallaEmblem.position.z = 0.18;
        this.shieldGroup.add(valhallaEmblem);
        break;
      }

      case 'shield_katfjord_round':
      default: {
        const disc = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1.5, 0.2, 12),
          new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.7 })
        );
        disc.rotation.x = Math.PI / 2;
        this.shieldGroup.add(disc);

        const boss = new THREE.Mesh(
          new THREE.SphereGeometry(0.45, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
        );
        boss.scale.z = 0.5;
        boss.position.z = 0.15;
        this.shieldGroup.add(boss);
        break;
      }
    }
  }

  public rebuildHeadwear(headwearId: string) {
    this.helmetGroup.clear();

    switch (headwearId) {
      case 'headwear_berserker_cowl': {
        const hood = new THREE.Mesh(
          new THREE.BoxGeometry(1.85, 1.2, 1.85),
          new THREE.MeshStandardMaterial({ color: 0x542d13, roughness: 0.95 })
        );
        hood.position.y = 0.55;
        this.helmetGroup.add(hood);

        [-0.7, 0.7].forEach((side) => {
          const ear = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.45, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x3f1f0a, roughness: 0.95 })
          );
          ear.position.set(side, 1.2, 0);
          this.helmetGroup.add(ear);
        });
        break;
      }

      case 'headwear_spectacle_helm': {
        const cap = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 1.0, 1.8),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 })
        );
        cap.position.y = 0.55;
        this.helmetGroup.add(cap);

        const spectacle = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.45, 0.25),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 })
        );
        spectacle.position.set(0, 0.1, 0.95);
        this.helmetGroup.add(spectacle);

        const mail = new THREE.Mesh(
          new THREE.BoxGeometry(1.85, 0.6, 1.85),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.5 })
        );
        mail.position.y = -0.15;
        this.helmetGroup.add(mail);
        break;
      }

      case 'headwear_valkyrie_wings': {
        const circlet = new THREE.Mesh(
          new THREE.CylinderGeometry(0.95, 0.95, 0.45, 12),
          new THREE.MeshStandardMaterial({ color: 0x0e7490, metalness: 0.9, roughness: 0.2 })
        );
        circlet.position.y = 0.65;
        this.helmetGroup.add(circlet);

        [-1.05, 1.05].forEach((side) => {
          const wing = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 1.6, 0.9),
            new THREE.MeshStandardMaterial({ color: 0xf0fdfa, roughness: 0.3 })
          );
          wing.position.set(side, 1.2, -0.2);
          wing.rotation.z = side * 0.25;
          wing.rotation.y = -side * 0.2;
          this.helmetGroup.add(wing);
        });
        break;
      }

      case 'headwear_raven_crown': {
        const crownBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.95, 0.95, 0.5, 8),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
        );
        crownBase.position.y = 0.7;
        this.helmetGroup.add(crownBase);

        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.18, 0.8, 4),
            new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.95 })
          );
          spike.position.set(Math.cos(angle) * 0.95, 1.2, Math.sin(angle) * 0.95);
          this.helmetGroup.add(spike);
        }
        break;
      }

      case 'headwear_allfather_diadem': {
        const diadem = new THREE.Mesh(
          new THREE.CylinderGeometry(1.0, 0.95, 0.7, 12),
          new THREE.MeshStandardMaterial({ color: 0xa16207, metalness: 0.98, roughness: 0.1 })
        );
        diadem.position.y = 0.8;
        this.helmetGroup.add(diadem);

        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const ray = new THREE.Mesh(
            new THREE.ConeGeometry(0.2, 1.1, 4),
            new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.98, roughness: 0.05 })
          );
          ray.position.set(Math.cos(angle) * 1.0, 1.4, Math.sin(angle) * 1.0);
          this.helmetGroup.add(ray);
        }
        break;
      }

      case 'headwear_nasal_helm':
      default: {
        const helmetCap = new THREE.Mesh(
          new THREE.BoxGeometry(1.75, 0.9, 1.75),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 })
        );
        helmetCap.position.y = 0.55;
        this.helmetGroup.add(helmetCap);

        const noseGuard = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.8, 0.2),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 })
        );
        noseGuard.position.set(0, 0.1, 0.9);
        this.helmetGroup.add(noseGuard);

        const hornMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 });
        [-1.0, 1.0].forEach((side) => {
          const hornBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.4), hornMat);
          hornBase.position.set(side, 0.8, 0);
          hornBase.rotation.z = -side * 0.4;
          this.helmetGroup.add(hornBase);

          const hornTip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), hornMat);
          hornTip.position.set(side * 1.3, 1.3, 0);
          hornTip.rotation.z = -side * 0.8;
          this.helmetGroup.add(hornTip);
        });
        break;
      }
    }
  }

  public setEquipment(gear: Partial<EquippedGear>) {
    if (gear.weaponId && gear.weaponId !== this.equippedGear.weaponId) {
      this.equippedGear.weaponId = gear.weaponId;
      this.rebuildWeapon(gear.weaponId);
    }
    if (gear.shieldId && gear.shieldId !== this.equippedGear.shieldId) {
      this.equippedGear.shieldId = gear.shieldId;
      this.rebuildShield(gear.shieldId);
    }
    if (gear.headwearId && gear.headwearId !== this.equippedGear.headwearId) {
      this.equippedGear.headwearId = gear.headwearId;
      this.rebuildHeadwear(gear.headwearId);
    }
  }

  private createWarHorn(): THREE.Group {
    const horn = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 })
    );
    body.rotation.z = Math.PI / 3;
    horn.add(body);
    return horn;
  }

  private createMeadTankard(): THREE.Group {
    const tankard = new THREE.Group();
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.5, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    tankard.add(cup);

    // Froth foam
    const foam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.46, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0xfefce8 })
    );
    foam.position.y = 0.6;
    tankard.add(foam);
    return tankard;
  }

  private createTorch(): THREE.Group {
    const torch = new THREE.Group();
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 2.4, 6),
      new THREE.MeshStandardMaterial({ color: 0x57341b })
    );
    torch.add(stick);

    const flame = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.7, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xf97316 })
    );
    flame.position.y = 1.3;
    torch.add(flame);

    const light = new THREE.PointLight(0xf97316, 1.8, 12);
    light.position.y = 1.5;
    torch.add(light);

    return torch;
  }

  private createHammer(): THREE.Group {
    const hammer = new THREE.Group();
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 2.8, 6),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    hammer.add(stick);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
    );
    head.position.y = 1.2;
    hammer.add(head);
    return hammer;
  }

  private createFishingRod(): THREE.Group {
    const rod = new THREE.Group();
    // Tapered Bamboo / Pine Pole
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.12, 3.8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.rotation.x = Math.PI / 4;
    pole.position.set(0, 0.8, 0.8);
    rod.add(pole);

    // Reel drum
    const reelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 12);
    const reelMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });
    const reel = new THREE.Mesh(reelGeo, reelMat);
    reel.rotation.z = Math.PI / 2;
    reel.position.set(0.15, 0.2, 0.1);
    rod.add(reel);
    return rod;
  }

  private createBow(): THREE.Group {
    const bow = new THREE.Group();
    // Curved yew stave
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -1.6, -0.3),
      new THREE.Vector3(0, 0, 0.4),
      new THREE.Vector3(0, 1.6, -0.3)
    );
    const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.08, 6, false);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const stave = new THREE.Mesh(tubeGeo, tubeMat);
    bow.add(stave);

    // Taut Bowstring
    const stringPts = [new THREE.Vector3(0, -1.6, -0.3), new THREE.Vector3(0, 1.6, -0.3)];
    const stringGeo = new THREE.BufferGeometry().setFromPoints(stringPts);
    const stringMat = new THREE.LineBasicMaterial({ color: 0xf1f5f9 });
    const bowstring = new THREE.Line(stringGeo, stringMat);
    bow.add(bowstring);

    return bow;
  }

  public setSkin(skin: AvatarSkin) {
    if (!skin) return;

    if (this.headMesh && (this.headMesh.material as THREE.MeshStandardMaterial)?.color && skin.bodyColor) {
      (this.headMesh.material as THREE.MeshStandardMaterial).color.set(skin.bodyColor);
    }
    if (this.torsoMesh && (this.torsoMesh.material as THREE.MeshStandardMaterial)?.color && skin.shirtColor) {
      (this.torsoMesh.material as THREE.MeshStandardMaterial).color.set(skin.shirtColor);
    }
    if (this.leftArm?.children[0]) {
      const mat = (this.leftArm.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat?.color && skin.shirtColor) mat.color.set(skin.shirtColor);
    }
    if (this.rightArm?.children[0]) {
      const mat = (this.rightArm.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat?.color && skin.shirtColor) mat.color.set(skin.shirtColor);
    }
    if (this.leftLeg?.children[0]) {
      const mat = (this.leftLeg.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat?.color && skin.pantsColor) mat.color.set(skin.pantsColor);
    }
    if (this.rightLeg?.children[0]) {
      const mat = (this.rightLeg.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat?.color && skin.pantsColor) mat.color.set(skin.pantsColor);
    }
    if (this.helmetGroup && skin.helmetColor) {
      this.helmetGroup.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && (mesh.material as THREE.MeshStandardMaterial)?.color) {
          (mesh.material as THREE.MeshStandardMaterial).color.set(skin.helmetColor);
        }
      });
    }
    if (this.beardGroup && skin.beardColor) {
      this.beardGroup.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && (mesh.material as THREE.MeshStandardMaterial)?.color) {
          (mesh.material as THREE.MeshStandardMaterial).color.set(skin.beardColor);
        }
      });
    }
  }

  public setTool(tool: ToolType) {
    this.activeTool = tool;
    this.axeGroup.visible = tool === 'axe';
    this.shieldGroup.visible = tool === 'shield' || tool === 'axe';
    this.hornGroup.visible = tool === 'horn';
    this.meadGroup.visible = tool === 'mead';
    this.torchGroup.visible = tool === 'torch';
    this.hammerGroup.visible = tool === 'hammer';
    this.fishingRodGroup.visible = tool === 'fishing_rod';
    this.bowGroup.visible = tool === 'bow';
  }

  public triggerAttack() {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.attackTimer = 0;

    if (this.activeTool === 'axe') {
      sound.playAxeSwing();
    } else if (this.activeTool === 'horn') {
      sound.playWarHorn();
    } else if (this.activeTool === 'mead') {
      sound.playMeadDrink();
    } else if (this.activeTool === 'hammer') {
      sound.playHammerBuild();
    }
  }

  public setBlocking(blocking: boolean) {
    if (this.isBlocking === blocking) return;
    this.isBlocking = blocking;
    if (blocking) {
      sound.playShieldBlock();
    }
  }

  public playEmote(emote: string) {
    this.activeEmote = emote;
    this.emoteTimer = 0;
  }

  public rebuildPet(petId: PetId | null) {
    this.activePetId = petId;
    this.petGroup.clear();
    if (!petId) return;

    const colorMap: Record<PetId, { body: number; accent: number }> = {
      pet_odin_raven: { body: 0x1e293b, accent: 0x38bdf8 },
      pet_fenrir_pup: { body: 0x64748b, accent: 0xf43f5e },
      pet_golden_boar: { body: 0xfacc15, accent: 0xfef08a },
      pet_frost_dragon: { body: 0x0284c7, accent: 0x7dd3fc },
    };

    const colors = colorMap[petId] || colorMap.pet_odin_raven;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colors.body,
      metalness: petId === 'pet_golden_boar' ? 0.85 : 0.3,
      roughness: 0.35,
    });
    const accentMat = new THREE.MeshBasicMaterial({ color: colors.accent });

    // Core body block
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.8, 1.3), bodyMat);
    this.petGroup.add(body);

    // Head block
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), bodyMat);
    head.position.set(0, 0.45, 0.55);
    this.petGroup.add(head);

    // Glowing rune eyes
    [-0.2, 0.2].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.1), accentMat);
      eye.position.set(ex, 0.52, 0.94);
      this.petGroup.add(eye);
    });

    // Wings for Raven & Frost Dragon, or Ears/Tusks for Wolf/Boar
    if (petId === 'pet_odin_raven' || petId === 'pet_frost_dragon') {
      [-0.75, 0.75].forEach((wx) => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.9), accentMat);
        wing.position.set(wx, 0.2, 0);
        wing.rotation.z = wx * 0.25;
        this.petGroup.add(wing);
      });
    } else {
      [-0.25, 0.25].forEach((ex) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 4), accentMat);
        ear.position.set(ex, 0.95, 0.55);
        this.petGroup.add(ear);
      });
    }
  }

  public rebuildMount(mountId: MountId | null) {
    this.activeMountId = mountId;
    this.mountGroup.clear();
    if (!mountId) return;

    const mountColors: Record<MountId, { fur: number; armor: number }> = {
      mount_war_bear: { fur: 0x78350f, armor: 0xf59e0b },
      mount_dire_wolf: { fur: 0x475569, armor: 0x38bdf8 },
      mount_sleipnir: { fur: 0x1e1b4b, armor: 0xfde047 },
    };

    const c = mountColors[mountId];
    const furMat = new THREE.MeshStandardMaterial({ color: c.fur, roughness: 0.75 });
    const armorMat = new THREE.MeshStandardMaterial({ color: c.armor, metalness: 0.85, roughness: 0.2 });

    // Mount torso under the player
    const mountBody = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.9, 4.4), furMat);
    mountBody.position.set(0, 1.2, 0.2);
    mountBody.castShadow = true;
    this.mountGroup.add(mountBody);

    // Saddle armor plate
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.45, 2.0), armorMat);
    saddle.position.set(0, 2.2, 0);
    this.mountGroup.add(saddle);

    // Mount head
    const mountHead = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 1.8), furMat);
    mountHead.position.set(0, 2.4, 2.5);
    this.mountGroup.add(mountHead);

    // Armored helm crest on mount
    const snoutCrest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 1.9), armorMat);
    snoutCrest.position.set(0, 2.9, 2.6);
    this.mountGroup.add(snoutCrest);

    // 4 Sturdy legs
    [
      [-0.95, 1.5],
      [0.95, 1.5],
      [-0.95, -1.3],
      [0.95, -1.3],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.4, 0.65), furMat);
      leg.position.set(lx, 0.5, lz);
      this.mountGroup.add(leg);
    });
  }

  public triggerSkillAnimation(skillId: 'whirlwind' | 'thunder_leap' | 'frost_nova') {
    if (skillId === 'whirlwind') {
      this.whirlwindTimer = 0.65;
      this.triggerCameraShake(0.45);
    } else if (skillId === 'thunder_leap') {
      this.velocity.y = 14.5;
      this.isGrounded = false;
      this.whirlwindTimer = 0.45;
      this.triggerCameraShake(0.65);
    } else if (skillId === 'frost_nova') {
      this.playEmote('roar');
      this.triggerCameraShake(0.5);
    }
  }

  public applyLookDelta(deltaYaw: number, deltaPitch: number) {
    this.cameraYaw += deltaYaw;
    this.cameraPitch = Math.max(-0.8, Math.min(1.25, this.cameraPitch + deltaPitch));
    this.manualLookTimer = 4.0;
  }

  public cycleCameraMode(): 'third_person' | 'close_look' | 'first_person' {
    if (this.cameraMode === 'third_person') {
      this.cameraMode = 'close_look';
    } else if (this.cameraMode === 'close_look') {
      this.cameraMode = 'first_person';
    } else {
      this.cameraMode = 'third_person';
    }
    return this.cameraMode;
  }

  public resetCameraBehind() {
    this.cameraYaw = this.group.rotation.y + Math.PI;
    this.cameraPitch = 0.18;
    this.manualLookTimer = 2.0;
  }

  /**
   * Main Physics and Animation Loop
   */
  public update(
    delta: number,
    keys: {
      forward: boolean;
      backward: boolean;
      left: boolean;
      right: boolean;
      jump: boolean;
      sprint: boolean;
      analogVector?: { x: number; y: number } | null;
      lookUp?: boolean;
      lookDown?: boolean;
      lookLeft?: boolean;
      lookRight?: boolean;
      lookVector?: { x: number; y: number } | null;
    },
    camera: THREE.PerspectiveCamera,
    obbyPlatforms?: ObbyPlatformBox[]
  ) {
    // 0. Continuous Look-Up & Look-Around Input (Keyboard IJKL / On-screen Look Gimbal)
    const lookSpeedYaw = 1.85;
    const lookSpeedPitch = 1.35;
    let activeLookInput = false;

    if (keys.lookLeft) {
      this.cameraYaw += lookSpeedYaw * delta;
      activeLookInput = true;
    }
    if (keys.lookRight) {
      this.cameraYaw -= lookSpeedYaw * delta;
      activeLookInput = true;
    }
    if (keys.lookUp) {
      this.cameraPitch = Math.max(-0.8, this.cameraPitch - lookSpeedPitch * delta);
      activeLookInput = true;
    }
    if (keys.lookDown) {
      this.cameraPitch = Math.min(1.25, this.cameraPitch + lookSpeedPitch * delta);
      activeLookInput = true;
    }

    if (keys.lookVector && (Math.abs(keys.lookVector.x) > 0.04 || Math.abs(keys.lookVector.y) > 0.04)) {
      this.cameraYaw -= keys.lookVector.x * lookSpeedYaw * 1.15 * delta;
      this.cameraPitch = Math.max(
        -0.8,
        Math.min(1.25, this.cameraPitch - keys.lookVector.y * lookSpeedPitch * 1.15 * delta)
      );
      activeLookInput = true;
    }

    if (activeLookInput) {
      this.manualLookTimer = 4.0;
    } else if (this.manualLookTimer > 0) {
      this.manualLookTimer = Math.max(0, this.manualLookTimer - delta);
    }

    // 1. Movement Calculation (with Mount & Gamepass Speed Multipliers)
    const mountBoost =
      this.activeMountId === 'mount_sleipnir'
        ? 1.95
        : this.activeMountId === 'mount_dire_wolf'
        ? 1.7
        : this.activeMountId === 'mount_war_bear'
        ? 1.45
        : 1.0;
    let moveSpeed = (keys.sprint ? 14 : 8.5) * mountBoost * this.speedPassMultiplier;
    const moveDir = new THREE.Vector3();

    // Compute camera forward & right projected onto ground plane
    const camForward = new THREE.Vector3(
      -Math.sin(this.cameraYaw),
      0,
      -Math.cos(this.cameraYaw)
    ).normalize();
    const camRight = new THREE.Vector3(
      Math.cos(this.cameraYaw),
      0,
      -Math.sin(this.cameraYaw)
    ).normalize();

    // Digital directional inputs
    if (keys.forward) moveDir.add(camForward);
    if (keys.backward) moveDir.sub(camForward);
    if (keys.left) moveDir.sub(camRight);
    if (keys.right) moveDir.add(camRight);

    // Analog Joystick input (Mobile finger touch)
    if (keys.analogVector && (Math.abs(keys.analogVector.x) > 0.05 || Math.abs(keys.analogVector.y) > 0.05)) {
      const mag = Math.hypot(keys.analogVector.x, keys.analogVector.y);
      if (mag > 0.05) {
        moveDir.addScaledVector(camRight, keys.analogVector.x);
        moveDir.addScaledVector(camForward, keys.analogVector.y);
        // Scale speed smoothly based on stick deflection
        if (!keys.sprint) {
          moveSpeed = 8.5 * Math.min(1.0, Math.max(0.35, mag));
        }
      }
    }

    const isMoving = moveDir.lengthSq() > 0.001;
    const gazeYaw = Math.atan2(-Math.sin(this.cameraYaw), -Math.cos(this.cameraYaw));

    if (isMoving) {
      moveDir.normalize();
      this.position.addScaledVector(moveDir, moveSpeed * delta);

      // In Shift-Lock mode, always face the exact camera crosshair direction
      const targetAngle = this.isShiftLocked ? gazeYaw : Math.atan2(moveDir.x, moveDir.z);
      let angleDiff = targetAngle - this.group.rotation.y;
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
      this.group.rotation.y += angleDiff * Math.min(1, (this.isShiftLocked ? 20 : 12) * delta);

      // Footsteps
      this.footstepTimer += delta * (keys.sprint ? 1.6 : 1.0);
      if (this.footstepTimer > 0.30) {
        sound.playFootstep();
        this.footstepTimer = 0;
      }
    } else if (this.isShiftLocked || this.cameraMode === 'first_person' || activeLookInput) {
      // In Shift-Lock, First-Person, or when actively using Look controls while standing, turn Viking body smoothly
      let bodyDiff = gazeYaw - this.group.rotation.y;
      bodyDiff = Math.atan2(Math.sin(bodyDiff), Math.cos(bodyDiff));
      if (this.isShiftLocked || this.cameraMode === 'first_person') {
        this.group.rotation.y += bodyDiff * Math.min(1, 18 * delta);
      } else if (Math.abs(bodyDiff) > 0.85) {
        const excess = bodyDiff - Math.sign(bodyDiff) * 0.85;
        this.group.rotation.y += excess * Math.min(1, 6 * delta);
      }
    }

    // Whirlwind Spin Skill Animation
    if (this.whirlwindTimer > 0) {
      this.whirlwindTimer = Math.max(0, this.whirlwindTimer - delta);
      this.group.rotation.y += delta * 24;
      this.rightArm.rotation.x = -Math.PI / 2;
      this.leftArm.rotation.x = -Math.PI / 2;
    }

    // Animate 3D Companion Pet floating beside the Viking
    if (this.activePetId) {
      this.petOrbitTime += delta * 2.8;
      this.petGroup.position.y = 5.8 + Math.sin(this.petOrbitTime) * 0.45;
      this.petGroup.position.x = -2.9 + Math.cos(this.petOrbitTime * 0.6) * 0.35;
      this.petGroup.rotation.y = Math.sin(this.petOrbitTime * 0.5) * 0.25;
    }

    // 2. Jumping, Gravity & Valhalla Sky Obby Platform Collision
    const prevY = this.position.y;
    const mountJumpBoost = this.activeMountId ? 1.25 : 1.0;
    if (keys.jump && this.isGrounded) {
      this.velocity.y = 9.8 * mountJumpBoost * this.jumpPassMultiplier;
      this.isGrounded = false;
    }

    this.velocity.y -= 24 * delta; // Gravity
    this.position.y += this.velocity.y * delta;

    // Ground check (Plateau height is y=3, ocean shore is y=1, plus floating Sky Obby platforms)
    const baseGround = (this.position.z > 50 && this.position.z < 185) ? 1.0 : 3.0;
    let groundLevel = baseGround + 0.24; // Align feet on top of ground blocks

    if (obbyPlatforms && obbyPlatforms.length > 0) {
      for (const plat of obbyPlatforms) {
        if (
          Math.abs(this.position.x - plat.x) <= plat.halfW &&
          Math.abs(this.position.z - plat.z) <= plat.halfD
        ) {
          const platSurface = plat.y + 0.24;
          if (prevY >= platSurface - 0.85 && platSurface > groundLevel) {
            groundLevel = platSurface;
          }
        }
      }
    }

    if (this.position.y <= groundLevel) {
      this.position.y = groundLevel;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // 3. Classic Roblox Walking & Stride Animation
    if (isMoving && this.isGrounded) {
      this.walkTime += delta * (keys.sprint ? 18 : 11);
      const legAngle = Math.sin(this.walkTime) * 0.75;
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      if (!this.isAttacking && !this.isBlocking) {
        this.leftArm.rotation.x = -legAngle * 0.7;
        this.rightArm.rotation.x = legAngle * 0.7;
      }

      // Torso slight bobbing
      this.torsoMesh.position.y = 3.4 + Math.abs(Math.sin(this.walkTime)) * 0.15;
    } else if (this.isGrounded) {
      // Idle pose
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 10 * delta);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 10 * delta);
      if (!this.isAttacking && !this.isBlocking) {
        this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 10 * delta);
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 10 * delta);
      }
      this.torsoMesh.position.y = THREE.MathUtils.lerp(this.torsoMesh.position.y, 3.4, 8 * delta);
    }

    // 4. Action Animations (Attack, Block, Emote)
    if (this.isAttacking) {
      this.attackTimer += delta;
      const progress = this.attackTimer / 0.35;

      if (progress < 0.4) {
        // Raise arm back
        this.rightArm.rotation.x = -Math.PI / 1.5;
        this.rightArm.rotation.z = -0.3;
      } else if (progress < 1.0) {
        // Cleave down forward
        this.rightArm.rotation.x = Math.PI / 2.2;
        this.rightArm.rotation.z = 0.2;
      } else {
        this.isAttacking = false;
        this.rightArm.rotation.set(0, 0, 0);
      }
    } else if (this.isBlocking) {
      // Raise shield to chest
      this.leftArm.rotation.x = -Math.PI / 3;
      this.leftArm.rotation.y = Math.PI / 4;
      this.shieldGroup.position.set(0.3, -1.0, 1.2);
    } else {
      this.leftArm.rotation.y = THREE.MathUtils.lerp(this.leftArm.rotation.y, 0, 10 * delta);
      this.shieldGroup.position.set(0, -1.2, 0.8);
    }

    // 4b. Viking 3D Head & Upper-Body Look-Up / Look-Around Tracking
    let relYaw = Math.atan2(
      Math.sin(gazeYaw - this.group.rotation.y),
      Math.cos(gazeYaw - this.group.rotation.y)
    );

    let targetHeadYaw = 0;
    let targetHeadPitch = 0;
    let targetTorsoYaw = 0;
    let targetTorsoPitch = 0;

    if (Math.abs(relYaw) <= 1.35) {
      targetHeadYaw = THREE.MathUtils.clamp(relYaw, -1.1, 1.1);
      targetTorsoYaw = THREE.MathUtils.clamp(relYaw * 0.25, -0.3, 0.3);
    } else {
      // When camera orbits in front of the Viking, softly glance toward the camera
      targetHeadYaw = THREE.MathUtils.clamp(Math.sin(relYaw) * 0.75, -0.75, 0.75);
      targetTorsoYaw = THREE.MathUtils.clamp(Math.sin(relYaw) * 0.18, -0.2, 0.2);
    }

    // Vertical pitch: negative cameraPitch means looking UP at the sky, mountain peaks, and roofs
    if (this.cameraPitch < 0.20) {
      const lookUpAmount = (0.20 - this.cameraPitch) / 1.0; // up to 1.0 when cameraPitch = -0.80
      targetHeadPitch = THREE.MathUtils.clamp(-lookUpAmount * 0.78, -0.78, 0);
      targetTorsoPitch = THREE.MathUtils.clamp(-lookUpAmount * 0.22, -0.22, 0);
    } else if (this.cameraPitch > 0.28) {
      const lookDownAmount = (this.cameraPitch - 0.28) / 0.97;
      targetHeadPitch = THREE.MathUtils.clamp(lookDownAmount * 0.48, 0, 0.48);
      targetTorsoPitch = THREE.MathUtils.clamp(lookDownAmount * 0.12, 0, 0.12);
    }

    // Subtle ambient curious looking around when standing idle
    if (!isMoving && this.manualLookTimer <= 0 && !this.activeEmote) {
      this.idleGazeTimer += delta;
      targetHeadYaw += Math.sin(this.idleGazeTimer * 0.9) * 0.32;
      targetHeadPitch += Math.min(0, Math.sin(this.idleGazeTimer * 0.6) * 0.24);
    } else {
      this.idleGazeTimer = 0;
    }

    // Emotes (Roar / Skol / Dance / Scout)
    if (this.activeEmote) {
      this.emoteTimer += delta;
      if (this.activeEmote === 'roar') {
        this.leftArm.rotation.x = -Math.PI / 1.2;
        this.rightArm.rotation.x = -Math.PI / 1.2;
        targetHeadPitch = -0.5;
      } else if (this.activeEmote === 'dance') {
        this.group.rotation.y += delta * 6;
        this.leftArm.rotation.z = Math.sin(this.emoteTimer * 8) * 0.8;
        this.rightArm.rotation.z = -Math.sin(this.emoteTimer * 8) * 0.8;
      } else if (this.activeEmote === 'scout') {
        // Viking raises hand to brow, tilts head up and pans across the horizon
        this.leftArm.rotation.x = -Math.PI / 1.65;
        this.leftArm.rotation.z = 0.35;
        targetHeadPitch = -0.52;
        targetTorsoPitch = -0.16;
        targetHeadYaw = Math.sin(this.emoteTimer * 2.4) * 0.85;
        targetTorsoYaw = Math.sin(this.emoteTimer * 2.4) * 0.25;
      }
      if (this.emoteTimer > 2.8) {
        this.activeEmote = null;
        this.leftArm.rotation.z = 0;
        this.rightArm.rotation.z = 0;
      }
    }

    // Smoothly interpolate Viking head and torso gaze rotations
    this.headYaw = THREE.MathUtils.lerp(this.headYaw, targetHeadYaw, Math.min(1, 10 * delta));
    this.headPitch = THREE.MathUtils.lerp(this.headPitch, targetHeadPitch, Math.min(1, 10 * delta));
    this.headMesh.rotation.y = this.headYaw;
    this.headMesh.rotation.x = this.headPitch;
    this.torsoMesh.rotation.y = THREE.MathUtils.lerp(this.torsoMesh.rotation.y, targetTorsoYaw, Math.min(1, 8 * delta));
    this.torsoMesh.rotation.x = THREE.MathUtils.lerp(this.torsoMesh.rotation.x, targetTorsoPitch, Math.min(1, 8 * delta));

    // 5. Camera System (Supports Full Upward Gaze, Close Shoulder, and First-Person Viking Eye View)
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (this.cameraShake > 0) {
      shakeOffsetX = (Math.random() - 0.5) * this.cameraShake;
      shakeOffsetY = (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake = Math.max(0, this.cameraShake - delta * 2.8);
    }

    const isFirstPerson = this.cameraMode === 'first_person' || this.cameraDistance < 3.2;
    this.headMesh.visible = !isFirstPerson;

    const gazeDirX = -Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
    const gazeDirY = -Math.sin(this.cameraPitch);
    const gazeDirZ = -Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);

    if (isFirstPerson) {
      // First-Person Viking Eye View: positioned at eye level, looking freely up/down/around
      const eyeX = this.position.x + gazeDirX * 0.35 + shakeOffsetX;
      const eyeY = this.position.y + 3.45 + shakeOffsetY;
      const eyeZ = this.position.z + gazeDirZ * 0.35;

      camera.position.set(eyeX, eyeY, eyeZ);
      this.cameraTarget.set(
        eyeX + gazeDirX * 20,
        eyeY + gazeDirY * 20,
        eyeZ + gazeDirZ * 20
      );
      camera.lookAt(this.cameraTarget);
    } else {
      // Third-Person Orbit, Shift-Lock Over-Shoulder, or Close-Look View
      const effectiveDist = this.cameraMode === 'close_look' ? Math.min(5.8, this.cameraDistance) : this.cameraDistance;
      const shiftLockRightOffset = this.isShiftLocked ? 1.45 : 0;

      const pivotX = this.position.x + Math.cos(this.cameraYaw) * shiftLockRightOffset;
      const pivotY = this.position.y + (this.activeMountId ? 3.55 : 2.75);
      const pivotZ = this.position.z - Math.sin(this.cameraYaw) * shiftLockRightOffset;

      const rawCamX = pivotX + Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * effectiveDist + shakeOffsetX;
      const rawCamY = pivotY + Math.sin(this.cameraPitch) * effectiveDist + shakeOffsetY;
      const rawCamZ = pivotZ + Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * effectiveDist;

      // Prevent camera from clipping below terrain/water when tilting up
      const minCamY = groundLevel + 0.6;
      const camY = Math.max(minCamY, rawCamY);

      // When looking UP (cameraPitch < 0.18), shift cameraTarget upward & ahead along the gaze ray
      // so the player can look high up into the sky, mountain peaks, and towering structures
      const upwardLookBoost = Math.max(0, 0.18 - this.cameraPitch);
      const lookAheadDist = upwardLookBoost * 8.5;

      this.cameraTarget.set(
        pivotX + gazeDirX * lookAheadDist,
        pivotY + upwardLookBoost * 9.5,
        pivotZ + gazeDirZ * lookAheadDist
      );

      camera.position.set(rawCamX, camY, rawCamZ);
      camera.lookAt(this.cameraTarget);
    }
  }

  public triggerCameraShake(intensity = 0.45) {
    this.cameraShake = Math.max(this.cameraShake, intensity);
  }
}
