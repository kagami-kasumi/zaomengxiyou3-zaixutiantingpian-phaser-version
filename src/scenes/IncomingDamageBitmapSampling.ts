import type Phaser from 'phaser';

type Renderer = Phaser.Renderer.Canvas.CanvasRenderer | Phaser.Renderer.WebGL.WebGLRenderer;
type Render = (renderer: Renderer, source: Phaser.GameObjects.Image,
  camera: Phaser.Cameras.Scene2D.Camera, parent: Phaser.GameObjects.Components.TransformMatrix) => void;

/** Keep nearest sampling local to these bitmaps without Phaser's Canvas size inflation. */
export function useIncomingDamageBitmapSampling(image: Phaser.GameObjects.Image): void {
  const target = image as unknown as Record<'renderCanvas' | 'renderWebGL', Render>;
  for (const name of ['renderCanvas', 'renderWebGL'] as const) {
    const render = target[name];
    if (!render) continue;
    target[name] = (renderer, source, camera, parent) => {
      const round = camera.roundPixels;
      const renderRound = camera.renderRoundPixels;
      // Phaser exposes the cached render flag as readonly in its declarations, but its own
      // camera preRender writes it. Restore it in finally so only this bitmap opts out.
      const renderCamera = camera as unknown as { renderRoundPixels: boolean };
      const x = parent.tx;
      const y = parent.ty;
      try {
        // Phaser Canvas otherwise inflates every destination bitmap by 0.5 local pixels.
        camera.roundPixels = false;
        renderCamera.renderRoundPixels = false;
        // A raster sampling tie-break, not an object/anchor offset. AIR chooses the lower
        // texel at exact fractional ties; mediump WebGL needs this sub-twip bias (0.01px).
        // 216A's independent AIR/Canvas/WebGL pixel gate verifies every declared state.
        parent.tx += 0.01 / camera.zoomX;
        parent.ty += 0.01 / camera.zoomY;
        render.call(image, renderer, source, camera, parent);
      } finally {
        parent.tx = x;
        parent.ty = y;
        camera.roundPixels = round;
        renderCamera.renderRoundPixels = renderRound;
      }
    };
  }
}
