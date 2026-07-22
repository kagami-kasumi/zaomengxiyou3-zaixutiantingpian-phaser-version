import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const targetUrl = process.argv[2] ?? 'http://127.0.0.1:5176/';
const runLabel = process.argv[3] ?? 'latest';
const routeDiagnostic = process.argv[4] === '--route-diagnostic';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const debugPort = 9331;
const runRoot = path.resolve('.tmp', 'stage11-browser-audit');
const profileRoot = path.join(runRoot, 'profile');
const evidenceRoot = path.join(runRoot, 'evidence', runLabel);

await rm(evidenceRoot, { recursive: true, force: true });
await mkdir(evidenceRoot, { recursive: true });

const edge = spawn(edgePath, [
  '--headless=new',
  '--disable-gpu',
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileRoot}`,
  '--window-size=1280,720',
  targetUrl,
], { stdio: 'ignore' });

const consoleEvents = [];
const skillKeys = [
  ['y', 'KeyY', 89],
  ['l', 'KeyL', 76],
  ['u', 'KeyU', 85],
  ['i', 'KeyI', 73],
  ['o', 'KeyO', 79],
];
let combatActionIndex = 0;
let socket;
let messageId = 0;
const pending = new Map();

try {
  const page = await waitForPage();
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const waiter = pending.get(message.id);
      if (!waiter) return;
      pending.delete(message.id);
      if (message.error) waiter.reject(new Error(message.error.message));
      else waiter.resolve(message.result);
      return;
    }
    if (message.method === 'Runtime.consoleAPICalled' || message.method === 'Log.entryAdded') {
      consoleEvents.push(message);
    }
  });

  await command('Page.enable');
  await command('Runtime.enable');
  await command('Log.enable');
  await command('Page.bringToFront');
  await waitForCanvas();
  await waitForRenderedScene();
  await capture('00-entry');
  await click(425, 200);
  await wait(900);
  await capture('01-start');

  await fightUntil((state) => state.monsters.length === 0, 75_000);
  await capture('02-bottom-clear');
  const route = [
    'stage11-through-2',
    'stage11-through-3',
    'stage11-through-4',
    'stage11-through-5',
    'stage11-through-9',
    'stage11-through-10',
    'stage11-through-11',
    'stage11-through-12',
    'stage11-through-6',
    'stage11-through-13',
    'stage11-through-7',
    'stage11-through-14',
    'stage11-through-8',
    'stage11-through-15',
    'stage11-through-up-down-1',
  ];
  for (let index = 0; index < route.length; index += 1) {
    const beforeJump = await getGameState();
    if (route.indexOf(beforeJump.player.platformId) < index) {
      await jumpToPlatform(route[index]);
    }
    await capture(`jump-${String(index + 1).padStart(2, '0')}`);
    if (routeDiagnostic && index === 4) break;
    const routeState = await getGameState();
    if (routeState.activeStopIndex >= 0) {
      const expectedClearedStops = routeState.activeStopIndex + 1;
      await fightUntil((state) => (
        state.clearedStops >= expectedClearedStops && state.monsters.length === 0
      ), 75_000);
      await recoverToRoutePlatform(route, index);
      await capture(`route-${String(index + 1).padStart(2, '0')}`);
    }
  }

  if (!routeDiagnostic) {
    const preBossState = await getGameState();
    if (!preBossState.boss && preBossState.clearedStops === 4) {
      await jumpInPlace();
      await wait(300);
    }
    await fightUntil(
      (state) => state.boss?.state === 'dead' || state.doorVisible,
      180_000,
      { useSkills: true },
    );
    await moveToX(807);
    await tap('w', 'KeyW', 87, 100);
    await wait(1_500);
    await capture('99-result');
    const finalState = await getGameState();
    await writeFile(
      path.join(evidenceRoot, 'result.json'),
      `${JSON.stringify(finalState, null, 2)}\n`,
      'utf8',
    );
    if (finalState.arenaState !== 'cleared') {
      throw new Error(`Stage 1-1 did not clear: ${JSON.stringify(finalState)}`);
    }
  }
  await writeFile(
    path.join(evidenceRoot, 'console.json'),
    `${JSON.stringify(consoleEvents, null, 2)}\n`,
    'utf8',
  );
  console.log(evidenceRoot);
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close();
  edge.kill();
}

async function waitForPage() {
  const endpoint = `http://127.0.0.1:${debugPort}/json/list`;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const pages = await fetch(endpoint).then((response) => response.json());
      const page = pages.find((candidate) => (
        candidate.type === 'page' && candidate.url.startsWith(targetUrl)
      ));
      if (page) return page;
    } catch {}
    await wait(100);
  }
  throw new Error('Edge CDP endpoint did not become ready');
}

function command(method, params = {}) {
  const id = ++messageId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? 'Runtime evaluation failed');
  }
  return result.result?.value;
}

async function getGameState() {
  return evaluate(`(async () => {
    const game = document.getElementById('game').phaserGame;
    const scene = game.scene.getScenes(true).find((candidate) => candidate.verticalClimb);
    if (!scene) throw new Error('Active TestScene was not found');
    const player = scene.playerViews[0];
    const monsters = scene.monster30s
      .filter((monster) => monster.state !== 'dead' && monster.state !== 'removed')
      .map((monster) => ({ id: monster.id, x: monster.x, hp: monster.hp, state: monster.state }));
    const boss = scene.bossArena?.boss;
    return {
      player: {
        x: player.movement.x,
        y: player.movement.y,
        platformId: player.movement.currentPlatformId ?? null,
        grounded: player.movement.grounded,
        hp: player.combat.hp,
        state: player.combat.state,
      },
      monsters,
      platforms: scene.movementPlatforms.map((platform) => ({
        id: platform.id,
        left: platform.left,
        right: platform.right,
        top: platform.top,
      })),
      clearedStops: scene.verticalClimb.stopPoints.filter((stop) => stop.cleared).length,
      activeStopIndex: scene.verticalClimb.activeStopIndex,
      boss: boss ? { x: boss.x, hp: boss.hp, state: boss.state } : null,
      doorVisible: scene.bossArena?.door?.visible ?? false,
      arenaState: scene.bossArena?.state ?? null,
    };
  })()`);
}

// Audit-only watchdog: Stage 1-1 has no gameplay wave timeout or timeout failure rule.
async function fightUntil(done, watchdogMs, { useSkills = false } = {}) {
  const deadline = Date.now() + watchdogMs;
  while (Date.now() < deadline) {
    const state = await getGameState();
    if (state.player.state === 'dead') {
      throw new Error(`Player died during combat: ${JSON.stringify(state)}`);
    }
    if (done(state)) {
      await wait(1_200);
      return getGameState();
    }
    const targets = state.monsters.length > 0
      ? state.monsters
      : state.boss && state.boss.state !== 'dead'
        ? [state.boss]
        : [];
    if (targets.length === 0) {
      await wait(100);
      continue;
    }
    const target = targets.reduce((nearest, candidate) => (
      Math.abs(candidate.x - state.player.x) < Math.abs(nearest.x - state.player.x)
        ? candidate
        : nearest
    ));
    const direction = target.x >= state.player.x
      ? ['d', 'KeyD', 68]
      : ['a', 'KeyA', 65];
    await tap(...direction, 35);
    if (!useSkills && combatActionIndex % 8 === 0) {
      await tap('k', 'KeyK', 75, 70);
      await wait(80);
      await tap('j', 'KeyJ', 74, 55);
    } else if (useSkills && combatActionIndex % 6 === 0) {
      await tap(...skillKeys[Math.floor(combatActionIndex / 6) % skillKeys.length], 70);
    } else {
      await tap('j', 'KeyJ', 74, 55);
    }
    combatActionIndex += 1;
    await wait(230);
  }
  throw new Error(`Combat condition timed out: ${JSON.stringify(await getGameState())}`);
}

async function jumpToPlatform(platformId, retriesRemaining = 1) {
  let before = await getGameState();
  if (before.player.state === 'dead') throw new Error('Player died before jump');
  let platform = before.platforms.find((candidate) => candidate.id === platformId);
  if (!platform) throw new Error(`Unknown platform ${platformId}`);
  let targetX = Math.min(Math.max(before.player.x, platform.left + 20), platform.right - 20);
  if (Math.abs(targetX - before.player.x) > 450 && before.player.platformId) {
    const source = before.platforms.find((candidate) => candidate.id === before.player.platformId);
    if (source) {
      await moveToX(targetX < before.player.x ? source.left + 36 : source.right - 36);
      before = await getGameState();
      platform = before.platforms.find((candidate) => candidate.id === platformId);
      targetX = Math.min(Math.max(before.player.x, platform.left - 8), platform.right + 8);
    }
  }
  const deltaX = targetX - before.player.x;
  if (Math.abs(deltaX) < 18) {
    await jumpInPlace();
  } else {
    const right = deltaX > 0;
    await jumpMove({
      key: right ? 'd' : 'a',
      code: right ? 'KeyD' : 'KeyA',
      virtualKeyCode: right ? 68 : 65,
      durationMs: Math.max(95, Math.round(Math.abs(deltaX) / 600 * 1_000)),
    });
  }
  const after = await getGameState();
  const landedPlatform = after.platforms.find((candidate) => candidate.id === after.player.platformId);
  if (
    retriesRemaining > 0 &&
    after.player.platformId === before.player.platformId &&
    Math.abs(after.player.y - before.player.y) < 1
  ) {
    await wait(200);
    return jumpToPlatform(platformId, retriesRemaining - 1);
  }
  if (
    after.player.platformId !== platformId &&
    (!landedPlatform || landedPlatform.top > platform.top) &&
    after.activeStopIndex < 0
  ) {
    throw new Error(`Missed ${platformId}: ${JSON.stringify({ before, after })}`);
  }
}

async function recoverToRoutePlatform(route, targetIndex) {
  const state = await getGameState();
  if (state.player.platformId === route[targetIndex]) return;
  let currentIndex = route.indexOf(state.player.platformId);
  if (state.player.platformId === 'stage11-through-1') currentIndex = 0;
  if (state.player.platformId === 'stage11-obs-1') currentIndex = -1;
  if (currentIndex >= targetIndex) return;
  if (currentIndex < -1) {
    throw new Error(`Cannot recover route from ${state.player.platformId} to ${route[targetIndex]}`);
  }
  for (let index = currentIndex + 1; index <= targetIndex; index += 1) {
    await jumpToPlatform(route[index]);
  }
}

async function jumpInPlace() {
  await tap('k', 'KeyK', 75, 90);
  await wait(130);
  await tap('k', 'KeyK', 75, 90);
  await wait(730);
}

async function moveToX(targetX) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const state = await getGameState();
    if (state.player.state === 'dead') throw new Error('Player died before entering the door');
    const deltaX = targetX - state.player.x;
    if (Math.abs(deltaX) <= 36) return;
    const direction = deltaX > 0
      ? ['d', 'KeyD', 68]
      : ['a', 'KeyA', 65];
    await tap(...direction, 80);
    await wait(40);
  }
  throw new Error(`Could not reach door x=${targetX}: ${JSON.stringify(await getGameState())}`);
}

async function waitForCanvas() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const result = await command('Runtime.evaluate', {
      expression: "Boolean(document.querySelector('canvas'))",
      returnByValue: true,
    });
    if (result.result?.value === true) return;
    await wait(100);
  }
  throw new Error('Game canvas did not become ready');
}

async function waitForRenderedScene() {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const { data } = await command('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    if (Buffer.byteLength(data, 'base64') > 10_000) return;
    await wait(100);
  }
  throw new Error('Entry scene did not finish rendering');
}

async function dispatch(type, key, code, virtualKeyCode) {
  await command('Input.dispatchKeyEvent', {
    type,
    key,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
  });
}

async function tap(key, code, virtualKeyCode, durationMs = 55) {
  await dispatch('keyDown', key, code, virtualKeyCode);
  await wait(durationMs);
  await dispatch('keyUp', key, code, virtualKeyCode);
}

async function click(x, y) {
  await command('Input.dispatchMouseEvent', {
    type: 'mousePressed', x, y, button: 'left', clickCount: 1,
  });
  await command('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x, y, button: 'left', clickCount: 1,
  });
}

async function clearEncounter(durationMs) {
  const startedAt = Date.now();
  let faceRight = true;
  while (Date.now() - startedAt < durationMs) {
    const direction = faceRight
      ? ['d', 'KeyD', 68]
      : ['a', 'KeyA', 65];
    await tap(...direction, 45);
    const phaseEndsAt = Date.now() + 2_400;
    while (Date.now() < phaseEndsAt && Date.now() - startedAt < durationMs) {
      await tap('j', 'KeyJ', 74, 45);
      await wait(240);
    }
    faceRight = !faceRight;
  }
}

async function jumpMove({ key, code, virtualKeyCode, durationMs }) {
  await tap(key, code, virtualKeyCode, 45);
  await wait(70);
  await dispatch('keyDown', key, code, virtualKeyCode);
  const startedAt = Date.now();
  await tap('k', 'KeyK', 75, 90);
  await wait(Math.max(0, Math.min(durationMs, 220) - (Date.now() - startedAt)));
  if (durationMs <= 220) await dispatch('keyUp', key, code, virtualKeyCode);
  await wait(Math.max(0, 220 - (Date.now() - startedAt)));
  await tap('k', 'KeyK', 75, 90);
  await wait(Math.max(0, durationMs - (Date.now() - startedAt)));
  if (durationMs > 260) await dispatch('keyUp', key, code, virtualKeyCode);
  await wait(Math.max(120, 1_300 - (Date.now() - startedAt)));
}

async function capture(name) {
  const { data } = await command('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  await writeFile(path.join(evidenceRoot, `${name}.png`), Buffer.from(data, 'base64'));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
