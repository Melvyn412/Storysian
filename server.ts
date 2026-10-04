import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getPayPalBaseUrls(): string[] {
  const env = (process.env.PAYPAL_ENVIRONMENT || 'sandbox').toLowerCase().trim();
  if (env === 'live' || env === 'production' || env === 'prod') {
    return ['https://api-m.paypal.com', 'https://api-m.sandbox.paypal.com'];
  }
  return ['https://api-m.sandbox.paypal.com', 'https://api-m.paypal.com'];
}

async function getPayPalAccessToken(): Promise<{ accessToken: string; baseUrl: string }> {
  const clientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured in environment variables.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const urls = getPayPalBaseUrls();
  let lastError = 'Failed to authenticate with PayPal';

  for (const baseUrl of urls) {
    try {
      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (response.ok) {
        const data = (await response.json()) as { access_token: string };
        return { accessToken: data.access_token, baseUrl };
      } else {
        const errText = await response.text();
        lastError = `PayPal Auth (${response.status}): ${errText}`;
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(lastError);
}

// ============================================================================
// REAL-TIME MULTIPLAYER AUTHORITATIVE SERVER STATE (WebSockets)
// ============================================================================

interface MultiplayerPlayerState {
  id: string;
  name: string;
  clan: string;
  level: number;
  silver: number;
  kills: number;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  z: number;
  rotY: number;
  skinId: string;
  weaponId: string;
  shieldId: string;
  headwearId: string;
  activeTool: string;
  isAttacking: boolean;
  isBlocking: boolean;
  isSailing: boolean;
  mountId: string | null;
  emote: string | null;
  speechText: string | null;
  lastUpdated: number;
}

interface SharedWorldBossState {
  id: string;
  name: string;
  title: string;
  health: number;
  maxHealth: number;
  phase: number;
  isAlive: boolean;
  x: number;
  z: number;
  contributors: Record<string, { name: string; damage: number }>;
}

interface SupplyDropState {
  id: string;
  name: string;
  x: number;
  z: number;
  rewardSilver: number;
  rewardValor: number;
  active: boolean;
  claimedBy: string | null;
  spawnedAt: number;
}

interface SeaSerpentRoomState {
  id: string;
  name: string;
  title: string;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  x: number;
  z: number;
  captainName: string | null;
  crewCount: number;
}

interface TacticalPingRoomEvent {
  id: string;
  senderName: string;
  senderClan: string;
  commandId: string;
  label: string;
  color: string;
  x: number;
  z: number;
  createdAt: number;
}

interface RoomState {
  roomId: string;
  players: Map<string, MultiplayerPlayerState>;
  sockets: Map<string, WebSocket>;
  chatHistory: Array<{
    id: string;
    sender: string;
    clan?: string;
    text: string;
    isSystem?: boolean;
    time: string;
  }>;
  worldBoss: SharedWorldBossState;
  seaSerpent: SeaSerpentRoomState;
  dungeonBoss: SharedWorldBossState;
  activePings: TacticalPingRoomEvent[];
  territoryHolder: {
    clan: string;
    playerName: string;
    capturedAt: string;
  };
  supplyDrop: SupplyDropState;
}

const rooms = new Map<string, RoomState>();

function getOrCreateRoom(roomId: string): RoomState {
  const cleanId = (roomId || 'katfjord-main').trim().toLowerCase();
  let room = rooms.get(cleanId);
  if (!room) {
    room = {
      roomId: cleanId,
      players: new Map(),
      sockets: new Map(),
      chatHistory: [
        {
          id: `sys_init_${Date.now()}`,
          sender: 'Realm Herald',
          text: `Connected to live multiplayer realm [${cleanId.toUpperCase()}]. Coordinate raids, duel in the Holmgang ring, or battle the shared World Boss!`,
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      worldBoss: {
        id: 'boss_ragnarok_colossus',
        name: 'Surtr’s Frost-Iron Colossus',
        title: 'Co-Op World Raid Boss',
        health: 2500,
        maxHealth: 2500,
        phase: 1,
        isAlive: true,
        x: 8,
        z: 95,
        contributors: {},
      },
      seaSerpent: {
        id: 'boss_jormungandr_serpent',
        name: 'Jörmungandr’s Fjord Leviathan',
        title: 'Multi-Crew Naval Raid Boss',
        health: 1800,
        maxHealth: 1800,
        isAlive: true,
        x: 38,
        z: 125,
        captainName: null,
        crewCount: 0,
      },
      dungeonBoss: {
        id: 'boss_nidhoggr_dragon',
        name: 'Níðhöggr the Underworld Dragon',
        title: 'Niflheim Abyssal Raid Boss',
        health: 3200,
        maxHealth: 3200,
        phase: 1,
        isAlive: true,
        x: -115,
        z: 10,
        contributors: {},
      },
      activePings: [],
      territoryHolder: {
        clan: 'Katfjord Clan',
        playerName: 'Jarl Erik',
        capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      supplyDrop: {
        id: `drop_${Date.now()}`,
        name: 'Starfall Runic Meteor Chest',
        x: -14,
        z: 36,
        rewardSilver: 250,
        rewardValor: 300,
        active: true,
        claimedBy: null,
        spawnedAt: Date.now(),
      },
    };
    rooms.set(cleanId, room);
  }
  return room;
}

function broadcastToRoom(room: RoomState, event: Record<string, unknown>, excludePlayerId?: string) {
  const payload = JSON.stringify(event);
  for (const [pid, ws] of room.sockets.entries()) {
    if (excludePlayerId && pid === excludePlayerId) continue;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Allow storysian.com and custom domain forwarding / iframe masking
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *');
    res.removeHeader('X-Frame-Options');
    next();
  });

  // 1. Public PayPal & GBP Treasury Configuration Endpoint (Never exposes PAYPAL_CLIENT_SECRET)
  app.get('/api/paypal/config', (_req, res) => {
    const clientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
    const hasSecret = Boolean((process.env.PAYPAL_CLIENT_SECRET || '').trim());
    const environment = (process.env.PAYPAL_ENVIRONMENT || 'sandbox').toLowerCase().trim();

    res.json({
      clientId,
      configured: Boolean(clientId && hasSecret),
      environment: environment === 'live' || environment === 'production' ? 'live' : 'sandbox',
      currency: 'GBP',
      currencySymbol: '£',
    });
  });

  // 2. Create PayPal Order in GBP (£)
  app.post('/api/paypal/create-order', async (req, res) => {
    try {
      const { itemId, itemName, amountGBP } = req.body as {
        itemId?: string;
        itemName?: string;
        amountGBP?: number | string;
      };

      const numericAmount = Number(amountGBP);
      if (!numericAmount || numericAmount <= 0 || numericAmount > 1000) {
        res.status(400).json({ error: 'Invalid GBP amount specified.' });
        return;
      }

      const formattedValue = numericAmount.toFixed(2);
      const { accessToken, baseUrl } = await getPayPalAccessToken();

      const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: itemId || 'storysian_gbp_pack',
              description: itemName || 'Storysian GBP Treasury Pack',
              amount: {
                currency_code: 'GBP',
                value: formattedValue,
              },
            },
          ],
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        res.status(orderRes.status).json({
          error: 'Failed to create PayPal GBP order',
          details: orderData,
        });
        return;
      }

      res.json(orderData);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unable to create PayPal order',
      });
    }
  });

  // 3. Capture PayPal Order in GBP (£)
  app.post('/api/paypal/capture-order', async (req, res) => {
    try {
      const { orderID } = req.body as { orderID?: string };
      if (!orderID) {
        res.status(400).json({ error: 'Missing orderID' });
        return;
      }

      const { accessToken, baseUrl } = await getPayPalAccessToken();

      const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const captureData = await captureRes.json();
      if (!captureRes.ok) {
        res.status(captureRes.status).json({
          error: 'Failed to capture PayPal GBP order',
          details: captureData,
        });
        return;
      }

      res.json(captureData);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unable to capture PayPal order',
      });
    }
  });

  // 4. Public Realm List & Active Player Count Endpoint
  app.get('/api/multiplayer/rooms', (_req, res) => {
    const summary = Array.from(rooms.values()).map((r) => ({
      roomId: r.roomId,
      playerCount: r.players.size,
      bossAlive: r.worldBoss.isAlive,
      bossHealthPct: Math.round((r.worldBoss.health / r.worldBoss.maxHealth) * 100),
      territoryClan: r.territoryHolder.clan,
    }));
    res.json({ rooms: summary });
  });

  // Mount Vite in dev or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = http.createServer(app);

  // Attach Real-Time Multiplayer WebSocket Server on /ws/multiplayer
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const reqUrl = request.url || '';
    if (reqUrl.startsWith('/ws/multiplayer')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    let currentRoom: RoomState | null = null;
    let currentPlayerId: string | null = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        const type = msg.type as string;

        if (type === 'room:join') {
          const roomId = String(msg.roomId || 'katfjord-main');
          const pData = msg.player || {};
          const playerId = String(pData.id || `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);

          // Leave previous room if switching
          if (currentRoom && currentPlayerId) {
            currentRoom.players.delete(currentPlayerId);
            currentRoom.sockets.delete(currentPlayerId);
            broadcastToRoom(currentRoom, {
              type: 'player:left',
              playerId: currentPlayerId,
            });
          }

          currentPlayerId = playerId;
          currentRoom = getOrCreateRoom(roomId);

          const newPlayer: MultiplayerPlayerState = {
            id: playerId,
            name: String(pData.name || 'Jarl_Thor'),
            clan: String(pData.clan || 'Katfjord Clan'),
            level: Number(pData.level) || 1,
            silver: Number(pData.silver) || 150,
            kills: Number(pData.kills) || 0,
            health: Number(pData.health) || 100,
            maxHealth: Number(pData.maxHealth) || 100,
            x: Number(pData.x) || 0,
            y: Number(pData.y) || 3.24,
            z: Number(pData.z) || 20,
            rotY: Number(pData.rotY) || 0,
            skinId: String(pData.skinId || 'skin_jarl'),
            weaponId: String(pData.weaponId || 'axe_iron'),
            shieldId: String(pData.shieldId || 'shield_wood'),
            headwearId: String(pData.headwearId || 'helm_iron'),
            activeTool: String(pData.activeTool || 'axe'),
            isAttacking: false,
            isBlocking: false,
            isSailing: Boolean(pData.isSailing),
            mountId: pData.mountId ? String(pData.mountId) : null,
            emote: null,
            speechText: null,
            lastUpdated: Date.now(),
          };

          currentRoom.players.set(playerId, newPlayer);
          currentRoom.sockets.set(playerId, ws);

          // Send full initial authoritative room state to joining player
          ws.send(
            JSON.stringify({
              type: 'room:init',
              roomId: currentRoom.roomId,
              selfId: playerId,
              players: Array.from(currentRoom.players.values()),
              chatHistory: currentRoom.chatHistory.slice(-25),
              worldBoss: currentRoom.worldBoss,
              seaSerpent: currentRoom.seaSerpent,
              dungeonBoss: currentRoom.dungeonBoss,
              activePings: currentRoom.activePings.filter((p) => Date.now() - p.createdAt < 14000),
              territoryHolder: currentRoom.territoryHolder,
              supplyDrop: currentRoom.supplyDrop,
            })
          );

          // Notify other players in room
          broadcastToRoom(
            currentRoom,
            {
              type: 'player:joined',
              player: newPlayer,
            },
            playerId
          );
          return;
        }

        if (!currentRoom || !currentPlayerId) return;

        // 2. Delta Position, Animation & Gear Update
        if (type === 'player:update') {
          const existing = currentRoom.players.get(currentPlayerId);
          if (!existing) return;

          if (typeof msg.x === 'number') existing.x = msg.x;
          if (typeof msg.y === 'number') existing.y = msg.y;
          if (typeof msg.z === 'number') existing.z = msg.z;
          if (typeof msg.rotY === 'number') existing.rotY = msg.rotY;
          if (typeof msg.health === 'number') existing.health = msg.health;
          if (typeof msg.maxHealth === 'number') existing.maxHealth = msg.maxHealth;
          if (typeof msg.level === 'number') existing.level = msg.level;
          if (typeof msg.silver === 'number') existing.silver = msg.silver;
          if (typeof msg.kills === 'number') existing.kills = msg.kills;
          if (typeof msg.name === 'string') existing.name = msg.name;
          if (typeof msg.clan === 'string') existing.clan = msg.clan;
          if (typeof msg.skinId === 'string') existing.skinId = msg.skinId;
          if (typeof msg.weaponId === 'string') existing.weaponId = msg.weaponId;
          if (typeof msg.activeTool === 'string') existing.activeTool = msg.activeTool;
          if (typeof msg.isAttacking === 'boolean') existing.isAttacking = msg.isAttacking;
          if (typeof msg.isBlocking === 'boolean') existing.isBlocking = msg.isBlocking;
          if (typeof msg.isSailing === 'boolean') existing.isSailing = msg.isSailing;
          if (msg.mountId !== undefined) existing.mountId = msg.mountId;
          if (msg.emote !== undefined) existing.emote = msg.emote;
          existing.lastUpdated = Date.now();

          broadcastToRoom(
            currentRoom,
            {
              type: 'player:updated',
              player: existing,
            },
            currentPlayerId
          );
          return;
        }

        // 3. Real-Time Chat Message + 3D Speech Bubble
        if (type === 'chat:send') {
          const existing = currentRoom.players.get(currentPlayerId);
          const text = String(msg.text || '').trim().slice(0, 180);
          if (!text) return;

          const chatEntry = {
            id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            sender: existing ? existing.name : String(msg.sender || 'Warrior'),
            clan: existing ? existing.clan : String(msg.clan || 'Katfjord'),
            text,
            isSystem: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          currentRoom.chatHistory.push(chatEntry);
          if (currentRoom.chatHistory.length > 50) {
            currentRoom.chatHistory.shift();
          }

          if (existing) {
            existing.speechText = text;
          }

          broadcastToRoom(currentRoom, {
            type: 'chat:message',
            message: chatEntry,
            playerId: currentPlayerId,
          });
          return;
        }

        // 4. PvP Holmgang Melee / Skill Attack against another Player
        if (type === 'player:attack') {
          const attacker = currentRoom.players.get(currentPlayerId);
          if (!attacker) return;

          attacker.isAttacking = true;
          const rawDamage = Math.min(95, Math.max(10, Number(msg.damage) || 28));
          const attackRadius = Math.min(14, Math.max(4, Number(msg.radius) || 6.5));
          const targetId = msg.targetId ? String(msg.targetId) : null;

          for (const [pid, target] of currentRoom.players.entries()) {
            if (pid === currentPlayerId) continue;
            const dist = Math.hypot(target.x - attacker.x, target.z - attacker.z);
            if ((targetId && pid === targetId && dist <= 18) || dist <= attackRadius) {
              const actualDamage = target.isBlocking ? Math.max(3, Math.round(rawDamage * 0.2)) : rawDamage;
              target.health = Math.max(0, target.health - actualDamage);
              let killed = false;
              if (target.health <= 0) {
                killed = true;
                target.health = target.maxHealth;
                attacker.kills += 1;
                attacker.silver += 120;
              }

              broadcastToRoom(currentRoom, {
                type: 'player:damaged',
                attackerId: currentPlayerId,
                attackerName: attacker.name,
                targetId: pid,
                targetName: target.name,
                damage: actualDamage,
                isBlocked: target.isBlocking,
                killed,
                targetHealth: target.health,
                attackerKills: attacker.kills,
              });
            }
          }
          return;
        }

        // 5. Shared Co-Op World Boss Damage
        if (type === 'worldboss:hit') {
          const attacker = currentRoom.players.get(currentPlayerId);
          const boss = currentRoom.worldBoss;
          if (!attacker || !boss.isAlive) return;

          const dmg = Math.min(250, Math.max(15, Number(msg.damage) || 45));
          boss.health = Math.max(0, boss.health - dmg);
          boss.phase = boss.health < boss.maxHealth * 0.45 ? 2 : 1;

          const prevContrib = boss.contributors[currentPlayerId] || {
            name: attacker.name,
            damage: 0,
          };
          prevContrib.name = attacker.name;
          prevContrib.damage += dmg;
          boss.contributors[currentPlayerId] = prevContrib;

          if (boss.health <= 0) {
            boss.isAlive = false;
            const sysMsg = {
              id: `boss_slain_${Date.now()}`,
              sender: 'Realm Herald',
              text: `🔥 CO-OP WORLD BOSS SLAIN! ${attacker.name} delivered the final blow to ${boss.name}! All raid contributors earned +400 Silver & +500 Valor!`,
              isSystem: true,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            currentRoom.chatHistory.push(sysMsg);

            broadcastToRoom(currentRoom, {
              type: 'worldboss:defeated',
              worldBoss: boss,
              finalBlowBy: attacker.name,
              rewardSilver: 400,
              rewardValor: 500,
              message: sysMsg,
            });
          } else {
            broadcastToRoom(currentRoom, {
              type: 'worldboss:updated',
              worldBoss: boss,
              attackerName: attacker.name,
              damage: dmg,
            });
          }
          return;
        }

        // 6. Respawn / Summon Shared Co-Op World Boss
        if (type === 'worldboss:respawn') {
          const summoner = currentRoom.players.get(currentPlayerId);
          currentRoom.worldBoss = {
            id: `boss_${Date.now()}`,
            name: 'Surtr’s Frost-Iron Colossus',
            title: 'Co-Op World Raid Boss',
            health: 2500,
            maxHealth: 2500,
            phase: 1,
            isAlive: true,
            x: 8,
            z: 95,
            contributors: {},
          };
          const sysMsg = {
            id: `boss_spawn_${Date.now()}`,
            sender: 'Realm Herald',
            text: `⚡ ${summoner?.name || 'A Viking Jarl'} sounded the Ragnarok Horn! ${currentRoom.worldBoss.name} has risen at the Fjord Crossing (X:8, Z:95)!`,
            isSystem: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          currentRoom.chatHistory.push(sysMsg);
          broadcastToRoom(currentRoom, {
            type: 'worldboss:spawned',
            worldBoss: currentRoom.worldBoss,
            message: sysMsg,
          });
          return;
        }

        // 7. Capture Frostfang Territory Banner (Server-Authoritative)
        if (type === 'territory:capture') {
          const capturer = currentRoom.players.get(currentPlayerId);
          if (!capturer) return;

          currentRoom.territoryHolder = {
            clan: capturer.clan,
            playerName: capturer.name,
            capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          const sysMsg = {
            id: `terr_${Date.now()}`,
            sender: 'Realm Herald',
            text: `🚩 ${capturer.name} captured the Frostfang Outpost Banner for <${capturer.clan}>!`,
            isSystem: true,
            time: currentRoom.territoryHolder.capturedAt,
          };
          currentRoom.chatHistory.push(sysMsg);

          broadcastToRoom(currentRoom, {
            type: 'territory:captured',
            territoryHolder: currentRoom.territoryHolder,
            message: sysMsg,
          });
          return;
        }

        // 8. Spawn or Claim Runic Meteor Supply Drop
        if (type === 'supplydrop:spawn') {
          const dropCoords = [
            { x: -14, z: 36 },
            { x: 18, z: 42 },
            { x: -24, z: -12 },
            { x: 12, z: -22 },
          ];
          const chosen = dropCoords[Math.floor(Math.random() * dropCoords.length)];
          currentRoom.supplyDrop = {
            id: `drop_${Date.now()}`,
            name: 'Starfall Runic Meteor Chest',
            x: chosen.x,
            z: chosen.z,
            rewardSilver: 250,
            rewardValor: 300,
            active: true,
            claimedBy: null,
            spawnedAt: Date.now(),
          };
          const sysMsg = {
            id: `drop_msg_${Date.now()}`,
            sender: 'Realm Herald',
            text: `☄️ A Starfall Runic Meteor Chest has crashed at (X:${chosen.x}, Z:${chosen.z})! First warrior to claim it wins +250 Silver & +300 Valor!`,
            isSystem: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          currentRoom.chatHistory.push(sysMsg);
          broadcastToRoom(currentRoom, {
            type: 'supplydrop:spawned',
            supplyDrop: currentRoom.supplyDrop,
            message: sysMsg,
          });
          return;
        }

        if (type === 'supplydrop:claim') {
          const claimer = currentRoom.players.get(currentPlayerId);
          if (!claimer || !currentRoom.supplyDrop.active) return;

          currentRoom.supplyDrop.active = false;
          currentRoom.supplyDrop.claimedBy = claimer.name;

          const sysMsg = {
            id: `drop_claim_${Date.now()}`,
            sender: 'Realm Herald',
            text: `☄️ ${claimer.name} claimed the Starfall Runic Meteor Chest (+${currentRoom.supplyDrop.rewardSilver} Silver & +${currentRoom.supplyDrop.rewardValor} Valor)!`,
            isSystem: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          currentRoom.chatHistory.push(sysMsg);

          broadcastToRoom(currentRoom, {
            type: 'supplydrop:claimed',
            supplyDrop: currentRoom.supplyDrop,
            claimerId: currentPlayerId,
            claimerName: claimer.name,
            rewardSilver: currentRoom.supplyDrop.rewardSilver,
            rewardValor: currentRoom.supplyDrop.rewardValor,
            message: sysMsg,
          });
          return;
        }

        // 9. Multi-Crew Drakkar Naval Broadside Frost-Ballista Fire (vs Jörmungandr Sea Serpent)
        if (type === 'ship:fire_ballista') {
          const gunner = currentRoom.players.get(currentPlayerId);
          const serpent = currentRoom.seaSerpent;
          if (!gunner) return;

          const dmg = Math.min(200, Math.max(40, Number(msg.damage) || 95));
          const side = String(msg.side || 'starboard');
          const fromX = Number(msg.fromX) || gunner.x;
          const fromZ = Number(msg.fromZ) || gunner.z;

          let serpentSlain = false;
          if (serpent.isAlive) {
            serpent.health = Math.max(0, serpent.health - dmg);
            serpent.captainName = gunner.name;
            if (serpent.health <= 0) {
              serpent.isAlive = false;
              serpentSlain = true;
            }
          }

          if (serpentSlain) {
            const sysMsg = {
              id: `serpent_slain_${Date.now()}`,
              sender: 'Naval Herald',
              text: `🐍⚓ JÖRMUNGANDR LEVIATHAN SLAIN! ${gunner.name}’s Frost-Ballista broadside sank ${serpent.name}! All Drakkar crewmates earned +350 Silver & +450 Valor!`,
              isSystem: true,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            currentRoom.chatHistory.push(sysMsg);
            broadcastToRoom(currentRoom, {
              type: 'seaserpent:defeated',
              seaSerpent: serpent,
              gunnerName: gunner.name,
              fromX,
              fromZ,
              rewardSilver: 350,
              rewardValor: 450,
              message: sysMsg,
            });
          } else {
            broadcastToRoom(currentRoom, {
              type: 'ship:ballista_fired',
              seaSerpent: serpent,
              gunnerName: gunner.name,
              side,
              damage: dmg,
              fromX,
              fromZ,
              toX: serpent.x,
              toZ: serpent.z,
            });
          }
          return;
        }

        if (type === 'seaserpent:respawn') {
          const summoner = currentRoom.players.get(currentPlayerId);
          currentRoom.seaSerpent = {
            id: `serpent_${Date.now()}`,
            name: 'Jörmungandr’s Fjord Leviathan',
            title: 'Multi-Crew Naval Raid Boss',
            health: 1800,
            maxHealth: 1800,
            isAlive: true,
            x: 38,
            z: 125,
            captainName: summoner?.name || null,
            crewCount: 1,
          };
          const sysMsg = {
            id: `serpent_spawn_${Date.now()}`,
            sender: 'Naval Herald',
            text: `🌊🐍 ${summoner?.name || 'The Fleet Captain'} summoned Jörmungandr’s Fjord Leviathan at (X:38, Z:125)! Board the Drakkar and man the Frost-Ballistas!`,
            isSystem: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          currentRoom.chatHistory.push(sysMsg);
          broadcastToRoom(currentRoom, {
            type: 'seaserpent:spawned',
            seaSerpent: currentRoom.seaSerpent,
            message: sysMsg,
          });
          return;
        }

        // 10. Niflheim Underworld Dungeon Boss Co-Op Raid (Níðhöggr the Underworld Dragon)
        if (type === 'dungeon:hit') {
          const attacker = currentRoom.players.get(currentPlayerId);
          const dboss = currentRoom.dungeonBoss;
          if (!attacker || !dboss.isAlive) return;

          const dmg = Math.min(280, Math.max(20, Number(msg.damage) || 70));
          dboss.health = Math.max(0, dboss.health - dmg);
          dboss.phase = dboss.health < dboss.maxHealth * 0.5 ? 2 : 1;

          const prev = dboss.contributors[currentPlayerId] || { name: attacker.name, damage: 0 };
          prev.name = attacker.name;
          prev.damage += dmg;
          dboss.contributors[currentPlayerId] = prev;

          if (dboss.health <= 0) {
            dboss.isAlive = false;
            const sysMsg = {
              id: `dungeon_slain_${Date.now()}`,
              sender: 'Niflheim Oracle',
              text: `🐉💜 NIFLHEIM DUNGEON CONQUERED! ${attacker.name} slew ${dboss.name}! All dungeon raiders earned +600 Silver & +750 Valor!`,
              isSystem: true,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            currentRoom.chatHistory.push(sysMsg);
            broadcastToRoom(currentRoom, {
              type: 'dungeon:defeated',
              dungeonBoss: dboss,
              finalBlowBy: attacker.name,
              rewardSilver: 600,
              rewardValor: 750,
              message: sysMsg,
            });
          } else {
            broadcastToRoom(currentRoom, {
              type: 'dungeon:updated',
              dungeonBoss: dboss,
              attackerName: attacker.name,
              damage: dmg,
            });
          }
          return;
        }

        if (type === 'dungeon:respawn') {
          const summoner = currentRoom.players.get(currentPlayerId);
          currentRoom.dungeonBoss = {
            id: `dungeon_${Date.now()}`,
            name: 'Níðhöggr the Underworld Dragon',
            title: 'Niflheim Abyssal Raid Boss',
            health: 3200,
            maxHealth: 3200,
            phase: 1,
            isAlive: true,
            x: -115,
            z: 10,
            contributors: {},
          };
          const sysMsg = {
            id: `dungeon_spawn_${Date.now()}`,
            sender: 'Niflheim Oracle',
            text: `🌀🐉 ${summoner?.name || 'A Viking Raider'} awakened Níðhöggr the Underworld Dragon in the Niflheim Cavern! Enter the Portal at (X:-28, Z:26)!`,
            isSystem: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          currentRoom.chatHistory.push(sysMsg);
          broadcastToRoom(currentRoom, {
            type: 'dungeon:spawned',
            dungeonBoss: currentRoom.dungeonBoss,
            message: sysMsg,
          });
          return;
        }

        // 11. Radial Tactical War-Command Wheel Ping (3D Beacon + Radar Ping)
        if (type === 'tactical:ping') {
          const sender = currentRoom.players.get(currentPlayerId);
          const pingEvent: TacticalPingRoomEvent = {
            id: `ping_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            senderName: sender ? sender.name : String(msg.senderName || 'Jarl'),
            senderClan: sender ? sender.clan : String(msg.senderClan || 'Katfjord'),
            commandId: String(msg.commandId || 'rally'),
            label: String(msg.label || 'Rally on My Position!').slice(0, 64),
            color: String(msg.color || '#10b981'),
            x: Number(msg.x) || 0,
            z: Number(msg.z) || 20,
            createdAt: Date.now(),
          };

          currentRoom.activePings = [
            ...currentRoom.activePings.filter((p) => Date.now() - p.createdAt < 12000),
            pingEvent,
          ].slice(-8);

          const sysMsg = {
            id: `tping_${Date.now()}`,
            sender: `${pingEvent.senderName} [Tactical Order]`,
            clan: pingEvent.senderClan,
            text: `📯 ${pingEvent.label} — Coordinates (X:${Math.round(pingEvent.x)}, Z:${Math.round(pingEvent.z)})`,
            isSystem: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          currentRoom.chatHistory.push(sysMsg);

          broadcastToRoom(currentRoom, {
            type: 'tactical:pinged',
            ping: pingEvent,
            message: sysMsg,
          });
          return;
        }
      } catch {
        // Ignore malformed WS payloads
      }
    });

    ws.on('close', () => {
      if (currentRoom && currentPlayerId) {
        currentRoom.players.delete(currentPlayerId);
        currentRoom.sockets.delete(currentPlayerId);
        broadcastToRoom(currentRoom, {
          type: 'player:left',
          playerId: currentPlayerId,
        });
      }
    });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Storysian Multiplayer & PayPal GBP server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
