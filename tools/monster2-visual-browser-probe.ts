import type Phaser from 'phaser';
import { destroyMonster2AttackViews, syncMonster2AttackViews,
  type Monster2AttackViews } from '../src/scenes/Monster2AttackView';
import type { Monster2Attack } from '../src/systems/Monster2AttackRuntime';

export type Monster2VisualBrowserPose = Readonly<{
  attack: 1 | 2 | 3;
  frame: number;
  sign: 1 | -1;
  image: Readonly<{
    key: string;
    x: number;
    y: number;
    originX: number;
    originY: number;
    flipX: boolean;
    scaleX: number;
    scaleY: number;
    visible: boolean;
  }>;
  transparentRenderPng: string;
}>;

export type Monster2VisualBrowserReport = Readonly<{
  root: Readonly<{ x: number; y: number }>;
  states: readonly Monster2VisualBrowserPose[];
  rawDisplay: 'not-captured';
  rawDisplayGap: 'raw28-requires-isolated-prestep-poststep-clock';
}>;

/**
 * Browser-only probe for the 68 registered Monster2 display states. The
 * images are created through the production sync path and drawn into a real
 * transparent Phaser RenderTexture; no source PNG is positioned by hand.
 * Monster2Bullet2 raw states are intentionally left for a separate clock
 * probe because their Scene-owned prestep/poststep lifetime is independent.
 */
export async function captureMonster2AttackViews(
  scene: Phaser.Scene,
  root: Readonly<{ x: number; y: number }> = { x: 470, y: 295 },
): Promise<Monster2VisualBrowserReport> {
  const views: Monster2AttackViews = new Map();
  const states: Monster2VisualBrowserPose[] = [];
  const texturePrefix = `monster2-visual-probe-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    for (const attack of [1, 2] as const) {
      const frameCount = attack === 1 ? 14 : 20;
      for (const sign of [1, -1] as const) {
        for (let frame = 1; frame <= frameCount; frame += 1) {
          const facingX: -1 | 1 = sign === 1 ? -1 : 1;
          const id = `${texturePrefix}:${attack}:${sign}:${frame}`;
          const modelAttack = {
            id,
            sourceId: texturePrefix,
            attack,
            x: root.x,
            y: root.y,
            facingX,
            frame,
            age: frame - 1,
            source: { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0,
              flower: false, random: () => 0.97 },
            reception: { prefix: `${id}:`, serial: 1, count: 0, interval: 999, remaining: 99 },
          } as Monster2Attack;
          syncMonster2AttackViews(scene, views, [modelAttack]);
          const image = views.get(id);
          if (!image) throw new Error(`Monster2 visual probe did not create image ${id}`);
          const transparentRenderPng = await saveTransparentRenderTexture(scene, image);
          states.push({ attack, frame, sign, image: {
            key: image.texture.key,
            x: image.x,
            y: image.y,
            originX: image.originX,
            originY: image.originY,
            flipX: image.flipX,
            scaleX: image.scaleX,
            scaleY: image.scaleY,
            visible: image.visible,
          }, transparentRenderPng });
        }
      }
    }
  } finally {
    destroyMonster2AttackViews(views);
  }
  return { root, states, rawDisplay: 'not-captured',
    rawDisplayGap: 'raw28-requires-isolated-prestep-poststep-clock' };
}

export async function saveTransparentRenderTexture(scene: Phaser.Scene, image: Phaser.GameObjects.Image): Promise<string> {
  const renderTexture = scene.add.renderTexture(0, 0, 940, 590).setVisible(false);
  try {
    renderTexture.clear();
    // RenderTexture#draw(single GameObject) calls renderWebGL directly and
    // does not apply the display-list willRender visibility filter. Preserve
    // the production Image visibility explicitly for empty native states.
    if (image.visible) renderTexture.draw(image);
    // Phaser's PNG snapshot treats premultiplied framebuffer bytes as straight
    // ImageData. Read the same actual framebuffer without that lossy conversion.
    const renderer = scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    const framebuffer = renderTexture.texture.renderTarget?.framebuffer;
    if (!framebuffer) throw new Error('Monster2 pixel verification requires WebGL RenderTexture');
    const previous = renderer.currentFramebuffer;
    const pixels = new Uint8Array(940 * 590 * 4);
    try {
      renderer.setFramebuffer(framebuffer);
      renderer.gl.readPixels(0, 0, 940, 590, renderer.gl.RGBA, renderer.gl.UNSIGNED_BYTE, pixels);
    } finally { renderer.setFramebuffer(previous); }
    const stream = new Blob([pixels]).stream().pipeThrough(new CompressionStream('deflate'));
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
    let binary = '';
    for (let i=0;i<compressed.length;i+=16384) binary += String.fromCharCode(...compressed.subarray(i,i+16384));
    return 'data:application/x-rgba-premultiplied+zlib;w=940;h=590;base64,' + btoa(binary);
  } finally {
    renderTexture.destroy();
  }
}
