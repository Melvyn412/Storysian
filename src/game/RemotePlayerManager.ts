import * as THREE from 'three';
import {
  NiflheimDungeonBoss,
  RemotePlayerState,
  SeaSerpentState,
  SharedWorldBoss,
  SupplyDropEvent,
  TacticalPingEvent,
} from '../types';

interface RemoteAvatarInstance {
  id: string;
  state: RemotePlayerState;
  group: THREE.Group;
  targetPos: THREE.Vector3;
  targetRotY: number;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  mountGroup: THREE.Group;
  nameplateCanvas: HTMLCanvasElement;
  nameplateTexture: THREE.CanvasTexture;
  speechClearTime: number;
  lastSpeechText: string | null;
  walkPhase: number;
  attackSwingTimer: number;
}

interface ActiveBallistaProjectile {
  mesh: THREE.Group;
  from: THREE.Vector3;
  to: THREE.Vector3;
  progress: number;
}

interface ActivePingMesh {
  id: string;
  group: THREE.Group;
  ring: THREE.Mesh;
  createdAt: number;
}

const SKIN_PALETTES: Record<
  string,
  { shirt: number; pants: number; beard: number; helm: number; horn: number }
> = {
  skin_jarl: {
    shirt: 0x991b1b,
    pants: 0x3f3f46,
    beard: 0xd97706,
    helm: 0x475569,
    horn: 0xfef3c7,
  },
  skin_berserker: {
    shirt: 0x78350f,
    pants: 0x1c1917,
    beard: 0xea580c,
    helm: 0x1e293b,
    horn: 0xfbbf24,
  },
  skin_valkyrie: {
    shirt: 0x0284c7,
    pants: 0x0f172a,
    beard: 0xfacc15,
    helm: 0x94a3b8,
    horn: 0xffffff,
  },
  skin_frostfang: {
    shirt: 0x1e3a8a,
    pants: 0x090d16,
    beard: 0x94a3b8,
    helm: 0x334155,
    horn: 0x67e8f9,
  },
};

export class RemotePlayerManager {
  private scene: THREE.Scene;
  public avatars = new Map<string, RemoteAvatarInstance>();

  // 1. Shared Co-Op World Raid Boss 3D Mesh
  public worldBossGroup: THREE.Group;
  private worldBossRightArm: THREE.Group;
  private worldBossCanvas: HTMLCanvasElement;
  private worldBossTexture: THREE.CanvasTexture;
  private worldBossRing: THREE.Mesh;

  // 2. Starfall Runic Meteor Drop 3D Mesh
  public supplyDropGroup: THREE.Group;
  private supplyCrystal: THREE.Mesh;
  private supplyBeacon: THREE.Mesh;

  // 3. Holmgang PvP Ring 3D Mesh
  public pvpArenaGroup: THREE.Group;

  // 4. Multi-Crew Naval Boss: Jörmungandr Sea Serpent + Broadside Frost-Ballista Projectiles
  public seaSerpentGroup: THREE.Group;
  private serpentCoils: THREE.Mesh[] = [];
  private serpentHeadGroup: THREE.Group;
  private seaSerpentCanvas: HTMLCanvasElement;
  private seaSerpentTexture: THREE.CanvasTexture;
  private ballistaProjectiles: ActiveBallistaProjectile[] = [];

  // 5. Niflheim Underworld Portal & Cavern Dungeon Instance (Níðhöggr Dragon Boss)
  public niflheimEntrancePortal: THREE.Group;
  private portalOuterRing: THREE.Mesh;
  public niflheimCavernGroup: THREE.Group;
  private trapScythe1: THREE.Group;
  private trapScythe2: THREE.Group;
  public dungeonBossGroup: THREE.Group;
  private dragonLeftWing: THREE.Group;
  private dragonRightWing: THREE.Group;
  private dungeonBossCanvas: HTMLCanvasElement;
  private dungeonBossTexture: THREE.CanvasTexture;

  // 6. 3D Tactical War-Command Pings
  private pingMeshes = new Map<string, ActivePingMesh>();

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Shared Co-Op World Raid Boss
    const bossBuilt = this.buildSharedWorldBossMesh();
    this.worldBossGroup = bossBuilt.group;
    this.worldBossRightArm = bossBuilt.rightArm;
    this.worldBossCanvas = bossBuilt.canvas;
    this.worldBossTexture = bossBuilt.texture;
    this.worldBossRing = bossBuilt.ring;
    this.scene.add(this.worldBossGroup);

    // 2. Starfall Runic Meteor Chest
    const dropBuilt = this.buildSupplyDropMesh();
    this.supplyDropGroup = dropBuilt.group;
    this.supplyCrystal = dropBuilt.crystal;
    this.supplyBeacon = dropBuilt.beacon;
    this.scene.add(this.supplyDropGroup);

    // 3. Holmgang PvP Duel Ring at (-16, 3.2, -10)
    this.pvpArenaGroup = this.buildHolmgangArena();
    this.scene.add(this.pvpArenaGroup);

    // 4. Jörmungandr Sea Serpent at (38, 1.3, 125)
    const serpentBuilt = this.buildSeaSerpentMesh();
    this.seaSerpentGroup = serpentBuilt.group;
    this.serpentCoils = serpentBuilt.coils;
    this.serpentHeadGroup = serpentBuilt.headGroup;
    this.seaSerpentCanvas = serpentBuilt.canvas;
    this.seaSerpentTexture = serpentBuilt.texture;
    this.scene.add(this.seaSerpentGroup);

    // 5. Niflheim Entrance Portal (-28, 3.2, 26) & Underworld Cavern (-115, 3.0, 26)
    const portalBuilt = this.buildNiflheimEntrancePortal();
    this.niflheimEntrancePortal = portalBuilt.group;
    this.portalOuterRing = portalBuilt.ring;
    this.scene.add(this.niflheimEntrancePortal);

    const cavernBuilt = this.buildNiflheimCavernAndDragon();
    this.niflheimCavernGroup = cavernBuilt.cavernGroup;
    this.trapScythe1 = cavernBuilt.scythe1;
    this.trapScythe2 = cavernBuilt.scythe2;
    this.dungeonBossGroup = cavernBuilt.dragonGroup;
    this.dragonLeftWing = cavernBuilt.leftWing;
    this.dragonRightWing = cavernBuilt.rightWing;
    this.dungeonBossCanvas = cavernBuilt.canvas;
    this.dungeonBossTexture = cavernBuilt.texture;
    this.scene.add(this.niflheimCavernGroup);
  }

  public syncPlayers(players: RemotePlayerState[], selfId: string | null) {
    const incomingIds = new Set<string>();

    for (const p of players) {
      if (selfId && p.id === selfId) continue;
      incomingIds.add(p.id);
      this.upsertPlayer(p);
    }

    for (const [id, inst] of this.avatars.entries()) {
      if (!incomingIds.has(id)) {
        this.scene.remove(inst.group);
        this.avatars.delete(id);
      }
    }
  }

  public upsertPlayer(state: RemotePlayerState) {
    let inst = this.avatars.get(state.id);
    if (!inst) {
      inst = this.createAvatarInstance(state);
      this.avatars.set(state.id, inst);
      this.scene.add(inst.group);
    } else {
      const prevSpeech = inst.lastSpeechText;
      const skinChanged = inst.state.skinId !== state.skinId;
      const mountChanged = inst.state.mountId !== state.mountId;
      inst.state = { ...state };
      inst.targetPos.set(state.x, state.y, state.z);
      inst.targetRotY = state.rotY;

      if (state.isAttacking) {
        inst.attackSwingTimer = 0.4;
      }

      if (state.speechText && state.speechText !== prevSpeech) {
        inst.lastSpeechText = state.speechText;
        inst.speechClearTime = performance.now() + 6500;
      }

      if (skinChanged || mountChanged) {
        this.scene.remove(inst.group);
        const rebuilt = this.createAvatarInstance(state);
        rebuilt.group.position.copy(inst.group.position);
        this.avatars.set(state.id, rebuilt);
        this.scene.add(rebuilt.group);
        return;
      }

      this.redrawNameplate(inst);
    }
  }

  public removePlayer(playerId: string) {
    const inst = this.avatars.get(playerId);
    if (inst) {
      this.scene.remove(inst.group);
      this.avatars.delete(playerId);
    }
  }

  public showPlayerSpeech(playerId: string, text: string) {
    const inst = this.avatars.get(playerId);
    if (!inst) return;
    inst.state.speechText = text;
    inst.lastSpeechText = text;
    inst.speechClearTime = performance.now() + 6500;
    this.redrawNameplate(inst);
  }

  public updateWorldBoss(boss: SharedWorldBoss | null) {
    if (!boss || !boss.isAlive) {
      this.worldBossGroup.visible = false;
      return;
    }
    this.worldBossGroup.visible = true;
    this.worldBossGroup.position.set(boss.x, 3.2, boss.z);
    this.redrawWorldBossBillboard(boss);
  }

  public updateSeaSerpent(serpent: SeaSerpentState | null) {
    if (!serpent || !serpent.isAlive) {
      this.seaSerpentGroup.visible = false;
      return;
    }
    this.seaSerpentGroup.visible = true;
    this.seaSerpentGroup.position.set(serpent.x, 1.3, serpent.z);
    this.redrawSeaSerpentBillboard(serpent);
  }

  public triggerBallistaShot(fromX: number, fromZ: number, toX: number, toZ: number) {
    const boltGroup = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 3.6, 6),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.5,
      })
    );
    shaft.rotation.x = Math.PI / 2;
    boltGroup.add(shaft);

    const fromVec = new THREE.Vector3(fromX, 4.5, fromZ);
    const toVec = new THREE.Vector3(toX, 4.2, toZ);
    boltGroup.position.copy(fromVec);
    boltGroup.lookAt(toVec);
    this.scene.add(boltGroup);

    this.ballistaProjectiles.push({
      mesh: boltGroup,
      from: fromVec,
      to: toVec,
      progress: 0,
    });
  }

  public updateDungeonBoss(boss: NiflheimDungeonBoss | null) {
    if (!boss || !boss.isAlive) {
      this.dungeonBossGroup.visible = false;
      return;
    }
    this.dungeonBossGroup.visible = true;
    this.redrawDungeonBossBillboard(boss);
  }

  public syncTacticalPings(pings: TacticalPingEvent[]) {
    const activeIds = new Set<string>();
    const now = Date.now();

    for (const p of pings) {
      if (now - p.createdAt > 12000) continue;
      activeIds.add(p.id);
      if (!this.pingMeshes.has(p.id)) {
        const built = this.createTacticalPingMesh(p);
        this.pingMeshes.set(p.id, built);
        this.scene.add(built.group);
      }
    }

    for (const [id, mesh] of this.pingMeshes.entries()) {
      if (!activeIds.has(id) || now - mesh.createdAt > 12000) {
        this.scene.remove(mesh.group);
        this.pingMeshes.delete(id);
      }
    }
  }

  public updateSupplyDrop(drop: SupplyDropEvent | null) {
    if (!drop || !drop.active) {
      this.supplyDropGroup.visible = false;
      return;
    }
    this.supplyDropGroup.visible = true;
    this.supplyDropGroup.position.set(drop.x, 3.2, drop.z);
  }

  public update(delta: number, time: number) {
    const now = performance.now();

    // 1. Update Remote Player Avatars
    for (const inst of this.avatars.values()) {
      const dist = inst.group.position.distanceTo(inst.targetPos);
      if (dist > 30) {
        inst.group.position.copy(inst.targetPos);
      } else {
        inst.group.position.lerp(inst.targetPos, Math.min(1, delta * 12));
      }

      let diff = inst.targetRotY - inst.group.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      inst.group.rotation.y += diff * Math.min(1, delta * 12);

      const isMoving = dist > 0.06;
      if (isMoving) {
        inst.walkPhase += delta * 11;
        const swing = Math.sin(inst.walkPhase) * 0.65;
        inst.leftLeg.rotation.x = swing;
        inst.rightLeg.rotation.x = -swing;
        inst.leftArm.rotation.x = -swing * 0.6;
      } else {
        inst.leftLeg.rotation.x = THREE.MathUtils.lerp(inst.leftLeg.rotation.x, 0, delta * 8);
        inst.rightLeg.rotation.x = THREE.MathUtils.lerp(inst.rightLeg.rotation.x, 0, delta * 8);
        inst.leftArm.rotation.x = THREE.MathUtils.lerp(
          inst.leftArm.rotation.x,
          inst.state.isBlocking ? -0.9 : 0,
          delta * 8
        );
      }

      if (inst.attackSwingTimer > 0) {
        inst.attackSwingTimer = Math.max(0, inst.attackSwingTimer - delta);
        inst.rightArm.rotation.x = -1.6 * Math.sin((inst.attackSwingTimer / 0.4) * Math.PI);
      } else {
        inst.rightArm.rotation.x = THREE.MathUtils.lerp(
          inst.rightArm.rotation.x,
          isMoving ? Math.sin(inst.walkPhase) * 0.5 : 0,
          delta * 8
        );
      }

      if (inst.state.speechText && now > inst.speechClearTime) {
        inst.state.speechText = null;
        this.redrawNameplate(inst);
      }
    }

    // 2. Animate Co-Op World Raid Boss
    if (this.worldBossGroup.visible) {
      this.worldBossRightArm.rotation.x = -0.35 + Math.sin(time * 0.0025) * 0.45;
      this.worldBossRing.rotation.z = time * 0.0012;
    }

    // 3. Animate Starfall Runic Meteor Drop
    if (this.supplyDropGroup.visible) {
      this.supplyCrystal.rotation.y = time * 0.0022;
      this.supplyCrystal.position.y = 2.6 + Math.sin(time * 0.004) * 0.35;
      this.supplyBeacon.scale.setScalar(1 + Math.sin(time * 0.005) * 0.12);
    }

    // 4. Animate Jörmungandr Sea Serpent & Ballista Projectiles
    if (this.seaSerpentGroup.visible) {
      this.serpentHeadGroup.position.y = 4.2 + Math.sin(time * 0.003) * 0.65;
      this.serpentHeadGroup.rotation.y = Math.sin(time * 0.0018) * 0.35;
      this.serpentCoils.forEach((coil, idx) => {
        coil.position.y = 1.6 + Math.sin(time * 0.0035 + idx * 1.1) * 0.7;
      });
    }

    for (let i = this.ballistaProjectiles.length - 1; i >= 0; i--) {
      const proj = this.ballistaProjectiles[i];
      proj.progress += delta * 2.4;
      if (proj.progress >= 1) {
        this.scene.remove(proj.mesh);
        this.ballistaProjectiles.splice(i, 1);
      } else {
        proj.mesh.position.lerpVectors(proj.from, proj.to, proj.progress);
        proj.mesh.position.y += Math.sin(proj.progress * Math.PI) * 3.5;
      }
    }

    // 5. Animate Niflheim Portal, Swinging Soul-Scythe Traps & Níðhöggr Dragon Wings
    this.portalOuterRing.rotation.z = time * 0.0025;
    this.trapScythe1.rotation.z = Math.sin(time * 0.0032) * 0.65;
    this.trapScythe2.rotation.z = -Math.sin(time * 0.0032) * 0.65;

    if (this.dungeonBossGroup.visible) {
      const flap = Math.sin(time * 0.0045) * 0.42;
      this.dragonLeftWing.rotation.z = 0.25 + flap;
      this.dragonRightWing.rotation.z = -0.25 - flap;
      this.dungeonBossGroup.position.y = 0.4 + Math.sin(time * 0.003) * 0.35;
    }

    // 6. Animate Active 3D Tactical Pings
    const epochNow = Date.now();
    for (const [id, pm] of this.pingMeshes.entries()) {
      if (epochNow - pm.createdAt > 12000) {
        this.scene.remove(pm.group);
        this.pingMeshes.delete(id);
      } else {
        const s = 1 + ((time * 0.003) % 1.4);
        pm.ring.scale.set(s, s, 1);
      }
    }
  }

  private createAvatarInstance(state: RemotePlayerState): RemoteAvatarInstance {
    const group = new THREE.Group();
    group.position.set(state.x, state.y, state.z);
    group.rotation.y = state.rotY;

    const palette = SKIN_PALETTES[state.skinId] || SKIN_PALETTES.skin_jarl;

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.8, 0.8),
      new THREE.MeshStandardMaterial({ color: palette.shirt, roughness: 0.6 })
    );
    torso.position.y = 2.5;
    torso.castShadow = true;
    group.add(torso);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 1.05, 1.05),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 })
    );
    head.position.y = 4.0;
    head.castShadow = true;
    group.add(head);

    const beard = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.65, 0.45),
      new THREE.MeshStandardMaterial({ color: palette.beard, roughness: 0.8 })
    );
    beard.position.set(0, 3.6, -0.45);
    group.add(beard);

    const helm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.68, 0.55, 8),
      new THREE.MeshStandardMaterial({ color: palette.helm, metalness: 0.6, roughness: 0.35 })
    );
    helm.position.y = 4.48;
    group.add(helm);

    const hornMat = new THREE.MeshStandardMaterial({ color: palette.horn, roughness: 0.3 });
    const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.75, 6), hornMat);
    leftHorn.position.set(-0.68, 4.72, 0);
    leftHorn.rotation.z = 0.65;
    group.add(leftHorn);

    const rightHorn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.75, 6), hornMat);
    rightHorn.position.set(0.68, 4.72, 0);
    rightHorn.rotation.z = -0.65;
    group.add(rightHorn);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.98, 3.2, 0);
    const lArmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 1.5, 0.48),
      new THREE.MeshStandardMaterial({ color: palette.shirt, roughness: 0.6 })
    );
    lArmMesh.position.y = -0.6;
    leftArm.add(lArmMesh);

    const shield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.14, 14),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.3, roughness: 0.5 })
    );
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.32, -0.85, -0.2);
    leftArm.add(shield);
    group.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.98, 3.2, 0);
    const rArmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 1.5, 0.48),
      new THREE.MeshStandardMaterial({ color: palette.shirt, roughness: 0.6 })
    );
    rArmMesh.position.y = -0.6;
    rightArm.add(rArmMesh);

    const axeShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 1.9, 6),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    axeShaft.rotation.x = Math.PI / 2;
    axeShaft.position.set(0, -1.1, -0.55);
    rightArm.add(axeShaft);

    const axeBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.75, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 })
    );
    axeBlade.position.set(0, -1.1, -1.3);
    rightArm.add(axeBlade);
    group.add(rightArm);

    const legMat = new THREE.MeshStandardMaterial({ color: palette.pants, roughness: 0.7 });
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.38, 1.6, 0);
    const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 1.6, 0.52), legMat);
    lLegMesh.position.y = -0.8;
    leftLeg.add(lLegMesh);
    group.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.38, 1.6, 0);
    const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 1.6, 0.52), legMat);
    rLegMesh.position.y = -0.8;
    rightLeg.add(rLegMesh);
    group.add(rightLeg);

    const mountGroup = new THREE.Group();
    if (state.mountId) {
      const mColor =
        state.mountId === 'mount_sleipnir'
          ? 0x38bdf8
          : state.mountId === 'mount_dire_wolf'
          ? 0x94a3b8
          : 0x78350f;
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.2, 2.8),
        new THREE.MeshStandardMaterial({ color: mColor, roughness: 0.6 })
      );
      body.position.set(0, 0.8, 0);
      mountGroup.add(body);
    }
    group.add(mountGroup);

    const playerRing = new THREE.Mesh(
      new THREE.RingGeometry(1.05, 1.3, 24),
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      })
    );
    playerRing.rotation.x = -Math.PI / 2;
    playerRing.position.y = 0.08;
    group.add(playerRing);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 170;
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      })
    );
    sprite.scale.set(6.8, 2.2, 1);
    sprite.position.y = 6.3;
    group.add(sprite);

    const inst: RemoteAvatarInstance = {
      id: state.id,
      state: { ...state },
      group,
      targetPos: new THREE.Vector3(state.x, state.y, state.z),
      targetRotY: state.rotY,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      mountGroup,
      nameplateCanvas: canvas,
      nameplateTexture: texture,
      speechClearTime: state.speechText ? performance.now() + 6500 : 0,
      lastSpeechText: state.speechText,
      walkPhase: 0,
      attackSwingTimer: 0,
    };

    this.redrawNameplate(inst);
    return inst;
  }

  private redrawNameplate(inst: RemoteAvatarInstance) {
    const ctx = inst.nameplateCanvas.getContext('2d');
    if (!ctx) return;
    const w = inst.nameplateCanvas.width;
    const h = inst.nameplateCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const p = inst.state;

    if (p.speechText) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.beginPath();
      ctx.roundRect(16, 4, w - 32, 54, 12);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 21px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const msg = p.speechText.length > 36 ? p.speechText.slice(0, 34) + '...' : p.speechText;
      ctx.fillText(`💬 "${msg}"`, w / 2, 38);
    }

    const boxY = p.speechText ? 64 : 24;
    ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
    ctx.beginPath();
    ctx.roundRect(40, boxY, w - 80, 96, 14);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🟢 LIVE PLAYER • <${p.clan}> • Lv.${p.level}`, w / 2, boxY + 26);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 25px system-ui, sans-serif';
    ctx.fillText(p.name, w / 2, boxY + 56);

    const hpPct = Math.max(0, Math.min(1, p.health / Math.max(1, p.maxHealth)));
    const barX = 76;
    const barY = boxY + 68;
    const barW = w - 152;
    const barH = 14;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpPct > 0.4 ? '#10b981' : '#ef4444';
    ctx.fillRect(barX, barY, barW * hpPct, barH);

    inst.nameplateTexture.needsUpdate = true;
  }

  private buildSharedWorldBossMesh() {
    const group = new THREE.Group();
    group.position.set(8, 3.2, 95);

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      metalness: 0.75,
      roughness: 0.25,
    });
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.1,
    });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(3.8, 4.8, 2.4), armorMat);
    torso.position.y = 5.2;
    torso.castShadow = true;
    group.add(torso);

    const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.15, 0), coreMat);
    core.position.set(0, 5.4, -1.15);
    group.add(core);

    const head = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), armorMat);
    head.position.y = 8.9;
    group.add(head);

    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.4, 6), coreMat);
    hornL.position.set(-1.5, 10.2, 0);
    hornL.rotation.z = 0.55;
    group.add(hornL);

    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.4, 6), coreMat);
    hornR.position.set(1.5, 10.2, 0);
    hornR.rotation.z = -0.55;
    group.add(hornR);

    const legL = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.2, 1.3), armorMat);
    legL.position.set(-1.1, 1.6, 0);
    group.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.2, 1.3), armorMat);
    legR.position.set(1.1, 1.6, 0);
    group.add(legR);

    const rightArm = new THREE.Group();
    rightArm.position.set(2.6, 7.0, 0);
    const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.8, 1.1), armorMat);
    rArmMesh.position.y = -1.6;
    rightArm.add(rArmMesh);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 4.5), coreMat);
    blade.position.set(0, -3.2, -2.0);
    rightArm.add(blade);
    group.add(rightArm);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.8, 1.1), armorMat);
    leftArm.position.set(-2.6, 5.4, 0);
    group.add(leftArm);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(6.5, 7.2, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf97316,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.12;
    group.add(ring);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 180;
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    );
    sprite.scale.set(11, 3.1, 1);
    sprite.position.y = 13.2;
    group.add(sprite);

    return { group, rightArm, canvas, texture, ring };
  }

  private redrawWorldBossBillboard(boss: SharedWorldBoss) {
    const ctx = this.worldBossCanvas.getContext('2d');
    if (!ctx) return;
    const w = this.worldBossCanvas.width;
    const h = this.worldBossCanvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(45, 10, 10, 0.92)';
    ctx.beginPath();
    ctx.roundRect(20, 16, w - 40, h - 32, 18);
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#fdba74';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🔥 LIVE MULTIPLAYER CO-OP WORLD BOSS • PHASE ${boss.phase}`, w / 2, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.fillText(boss.name, w / 2, 88);

    const pct = Math.max(0, Math.min(1, boss.health / Math.max(1, boss.maxHealth)));
    const barX = 60;
    const barY = 108;
    const barW = w - 120;
    const barH = 26;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(barX, barY, barW * pct, barH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${boss.health} / ${boss.maxHealth} HP`, w / 2, barY + 19);

    this.worldBossTexture.needsUpdate = true;
  }

  private buildSeaSerpentMesh() {
    const group = new THREE.Group();
    group.position.set(38, 1.3, 125);

    const scaleMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      metalness: 0.45,
      roughness: 0.3,
    });
    const finMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
    });

    const coils: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(2.2 - i * 0.25, 0.85, 10, 18), scaleMat);
      coil.position.set((i - 1.5) * 3.8, 1.6, (i % 2) * 2.2);
      coil.rotation.y = Math.PI / 4;
      group.add(coil);
      coils.push(coil);
    }

    const headGroup = new THREE.Group();
    headGroup.position.set(-5.5, 4.5, 0);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 5.5, 10), scaleMat);
    neck.position.y = 1.2;
    headGroup.add(neck);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 3.8), scaleMat);
    skull.position.set(0, 4.2, -0.8);
    headGroup.add(skull);

    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.2, 5), finMat);
    crest.position.set(0, 6.2, -0.5);
    crest.rotation.x = -0.35;
    headGroup.add(crest);

    group.add(headGroup);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 180;
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    );
    sprite.scale.set(11.5, 3.2, 1);
    sprite.position.set(0, 12.8, 0);
    group.add(sprite);

    return { group, coils, headGroup, canvas, texture };
  }

  private redrawSeaSerpentBillboard(serpent: SeaSerpentState) {
    const ctx = this.seaSerpentCanvas.getContext('2d');
    if (!ctx) return;
    const w = this.seaSerpentCanvas.width;
    const h = this.seaSerpentCanvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(8, 47, 73, 0.92)';
    ctx.beginPath();
    ctx.roundRect(20, 16, w - 40, h - 32, 18);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#7dd3fc';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🐍⚓ MULTI-CREW NAVAL BOSS • FIRE DRAKKAR BALLISTAS [R]`, w / 2, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 29px system-ui, sans-serif';
    ctx.fillText(serpent.name, w / 2, 88);

    const pct = Math.max(0, Math.min(1, serpent.health / Math.max(1, serpent.maxHealth)));
    const barX = 60;
    const barY = 108;
    const barW = w - 120;
    const barH = 26;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(barX, barY, barW * pct, barH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${serpent.health} / ${serpent.maxHealth} HP`, w / 2, barY + 19);

    this.seaSerpentTexture.needsUpdate = true;
  }

  private buildNiflheimEntrancePortal() {
    const group = new THREE.Group();
    group.position.set(-28, 3.2, 26);

    const archMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      metalness: 0.7,
      roughness: 0.3,
    });
    const runeMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 1.4,
    });

    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 6.2, 1.1), archMat);
    leftPillar.position.set(-2.6, 3.1, 0);
    group.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 6.2, 1.1), archMat);
    rightPillar.position.set(2.6, 3.1, 0);
    group.add(rightPillar);

    const topLintel = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.2, 1.4), archMat);
    topLintel.position.set(0, 6.4, 0);
    group.add(topLintel);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.22, 10, 28), runeMat);
    ring.position.set(0, 3.3, 0);
    group.add(ring);

    const vortex = new THREE.Mesh(
      new THREE.CircleGeometry(2.15, 24),
      new THREE.MeshBasicMaterial({
        color: 0x7e22ce,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      })
    );
    vortex.position.set(0, 3.3, 0);
    group.add(vortex);

    // Billboard
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(24, 10, 48, 0.92)';
    ctx.beginPath();
    ctx.roundRect(20, 16, 472, 108, 16);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#d8b4fe';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌀 CO-OP DUNGEON INSTANCE', 256, 52);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText('[E] Enter Niflheim Underworld', 256, 94);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    );
    sprite.scale.set(8.5, 2.3, 1);
    sprite.position.set(0, 8.6, 0);
    group.add(sprite);

    return { group, ring };
  }

  private buildNiflheimCavernAndDragon() {
    const cavernGroup = new THREE.Group();
    cavernGroup.position.set(-115, 3.0, 26);

    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.4,
    });
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 1.2,
    });

    // Obsidian Arena Floor
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(28, 29, 0.5, 32), obsidianMat);
    floor.position.y = 0.05;
    floor.receiveShadow = true;
    cavernGroup.add(floor);

    // 10 Towering Soul-Crystal Monoliths around the Cavern Perimeter
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      const rx = Math.cos(ang) * 24;
      const rz = Math.sin(ang) * 24;

      const rock = new THREE.Mesh(new THREE.ConeGeometry(2.8, 12, 6), obsidianMat);
      rock.position.set(rx, 6, rz);
      cavernGroup.add(rock);

      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), crystalMat);
      crystal.position.set(rx * 0.88, 3.2, rz * 0.88);
      cavernGroup.add(crystal);
    }

    // Return Portal at (-115, 3.2, 42) -> local (0, 0.2, 16)
    const exitRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.2, 8, 24), crystalMat);
    exitRing.position.set(0, 2.8, 16);
    cavernGroup.add(exitRing);

    // 2 Swinging Soul-Scythe Traps
    const buildScythe = (zOffset: number) => {
      const pivot = new THREE.Group();
      pivot.position.set(0, 9.5, zOffset);
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 7.5, 6),
        obsidianMat
      );
      rod.position.y = -3.6;
      pivot.add(rod);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 0.25), crystalMat);
      blade.position.y = -7.2;
      pivot.add(blade);
      return pivot;
    };

    const scythe1 = buildScythe(6);
    const scythe2 = buildScythe(-2);
    cavernGroup.add(scythe1);
    cavernGroup.add(scythe2);

    // Níðhöggr the Underworld Dragon Boss at local (0, 0.4, -16) -> world (-115, 3.4, 10)
    const dragonGroup = new THREE.Group();
    dragonGroup.position.set(0, 0.4, -16);

    const dragonScaleMat = new THREE.MeshStandardMaterial({
      color: 0x3b0764,
      metalness: 0.6,
      roughness: 0.3,
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.4, 6.8), dragonScaleMat);
    body.position.y = 3.8;
    dragonGroup.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 3.4), dragonScaleMat);
    head.position.set(0, 6.2, 3.8);
    dragonGroup.add(head);

    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.5, 6), crystalMat);
    hornL.position.set(-1.1, 7.8, 3.2);
    dragonGroup.add(hornL);

    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.5, 6), crystalMat);
    hornR.position.set(1.1, 7.8, 3.2);
    dragonGroup.add(hornR);

    const leftWing = new THREE.Group();
    leftWing.position.set(-2.1, 5.2, 0);
    const lWingMesh = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.22, 4.2), crystalMat);
    lWingMesh.position.x = -3.2;
    leftWing.add(lWingMesh);
    dragonGroup.add(leftWing);

    const rightWing = new THREE.Group();
    rightWing.position.set(2.1, 5.2, 0);
    const rWingMesh = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.22, 4.2), crystalMat);
    rWingMesh.position.x = 3.2;
    rightWing.add(rWingMesh);
    dragonGroup.add(rightWing);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 180;
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    );
    sprite.scale.set(12, 3.3, 1);
    sprite.position.set(0, 11.5, 0);
    dragonGroup.add(sprite);

    cavernGroup.add(dragonGroup);

    return {
      cavernGroup,
      scythe1,
      scythe2,
      dragonGroup,
      leftWing,
      rightWing,
      canvas,
      texture,
    };
  }

  private redrawDungeonBossBillboard(boss: NiflheimDungeonBoss) {
    const ctx = this.dungeonBossCanvas.getContext('2d');
    if (!ctx) return;
    const w = this.dungeonBossCanvas.width;
    const h = this.dungeonBossCanvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(28, 10, 52, 0.94)';
    ctx.beginPath();
    ctx.roundRect(20, 16, w - 40, h - 32, 18);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#e9d5ff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🐉💜 NIFLHEIM DUNGEON RAID BOSS • PHASE ${boss.phase}`, w / 2, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(boss.name, w / 2, 88);

    const pct = Math.max(0, Math.min(1, boss.health / Math.max(1, boss.maxHealth)));
    const barX = 60;
    const barY = 108;
    const barW = w - 120;
    const barH = 26;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(barX, barY, barW * pct, barH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${boss.health} / ${boss.maxHealth} HP`, w / 2, barY + 19);

    this.dungeonBossTexture.needsUpdate = true;
  }

  private createTacticalPingMesh(ping: TacticalPingEvent): ActivePingMesh {
    const group = new THREE.Group();
    const px = ping?.x ?? 0;
    const pz = ping?.z ?? 0;
    const pingColor = ping?.color || '#10b981';
    group.position.set(px, 3.2, pz);

    const col = new THREE.Color(pingColor);

    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.9, 36, 12, 1, true),
      new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.38,
        side: THREE.DoubleSide,
      })
    );
    pillar.position.y = 18;
    group.add(pillar);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.0, 2.5, 28),
      new THREE.MeshBasicMaterial({
        color: col,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.15;
    group.add(ring);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 130;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
    ctx.beginPath();
    ctx.roundRect(16, 12, 480, 104, 16);
    ctx.fill();
    ctx.strokeStyle = pingColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = pingColor;
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📯 TACTICAL PING • ${ping?.senderName || 'Warband'}`, 256, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(ping.label.slice(0, 32), 256, 88);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    );
    sprite.scale.set(9.5, 2.4, 1);
    sprite.position.y = 10.5;
    group.add(sprite);

    return {
      id: ping.id,
      group,
      ring,
      createdAt: ping.createdAt,
    };
  }

  private buildSupplyDropMesh() {
    const group = new THREE.Group();
    group.position.set(-14, 3.2, 36);

    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.5, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.5, roughness: 0.4 })
    );
    chest.position.y = 0.75;
    group.add(chest);

    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.1, 0),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.2,
      })
    );
    crystal.position.y = 2.6;
    group.add(crystal);

    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 1.4, 28, 12, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.24,
        side: THREE.DoubleSide,
      })
    );
    beacon.position.y = 14;
    group.add(beacon);

    return { group, crystal, beacon };
  }

  private buildHolmgangArena() {
    const group = new THREE.Group();
    group.position.set(-16, 3.2, -10);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(7.2, 7.8, 32),
      new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.08;
    group.add(ring);

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = Math.cos(angle) * 7.5;
      const pz = Math.sin(angle) * 7.5;
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.8, 0.8), pillarMat);
      pillar.position.set(px, 1.4, pz);
      group.add(pillar);

      const brazier = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), flameMat);
      brazier.position.set(px, 3.1, pz);
      group.add(brazier);
    }

    return group;
  }
}
