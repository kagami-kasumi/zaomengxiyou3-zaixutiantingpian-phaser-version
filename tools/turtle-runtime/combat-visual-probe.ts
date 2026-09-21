import Phaser from 'phaser';

/** Compare the actual live presentation texture with independent AIR captures. */
export async function compareCombatLayers(game: Phaser.Game, scene: Phaser.Scene, refs: any[], render: () => void) {
  const scenes = game.scene.getScenes(true);
  const objects = scenes.flatMap(s => s.children.list).filter(o => 'visible' in o) as Phaser.GameObjects.Image[];
  const visibility = objects.map(o => o.visible);
  scenes.forEach(s => s.scene.pause());
  objects.forEach(o => o.setVisible(false));
  const canvas = document.createElement('canvas'); canvas.width = 940; canvas.height = 590;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  const key = 'turtle-combat-native-reference';
  const texture = game.textures.addCanvas(key, canvas)!;
  const reference = scene.add.image(0, 0, key).setOrigin(0, 0).setScrollFactor(0).setVisible(false);
  const capture = () => {
    let result: Uint8ClampedArray | undefined;
    game.events.once(Phaser.Core.Events.POST_RENDER, () => {
      const output = document.createElement('canvas'); output.width = 940; output.height = 590;
      const ctx = output.getContext('2d')!; ctx.drawImage(game.canvas, 0, 0);
      result = ctx.getImageData(0, 0, 940, 590).data;
    });
    render(); if (!result) throw Error('No production render'); return result;
  };
  const rows = [];
  try {
    for (const ref of refs) {
      const actual = objects.find(o => o.name === ref.name)!;
      if (!actual) throw Error(`Missing live view ${ref.name}`);
      const root = actual.getData('turtleOwners').root, viewport = actual.getData('turtleViewport');
      const image = new Image(); image.src = ref.url; await image.decode();
      context.clearRect(0, 0, 940, 590);
      const dx = root.x - ref.root.x - viewport.x, dy = root.y - ref.root.y - viewport.y;
      context.drawImage(image, dx, dy);
      for (const pixel of ref.approvedPixels ?? []) {
        const data = context.createImageData(1, 1); data.data.set(pixel.candidate);
        context.putImageData(data, pixel.x + dx, pixel.y + dy);
      }
      texture.refresh(); reference.setVisible(true);
      const expected = capture(); reference.setVisible(false); actual.setVisible(true);
      const observed = capture(); actual.setVisible(false);
      let differentPixels = 0, maxDelta = 0, comparedPixels = 0;
      for (let i = 0; i < observed.length; i += 4) {
        const x = i / 4 % 940, y = Math.floor(i / 4 / 940);
        // A shifted native stage PNG only proves its captured rectangle. Full
        // independent owner surfaces and every state are covered by P1TA0/225.
        if (ref.boundedCapture && (x < dx || x >= dx + 940 || y < dy || y >= dy + 590)) continue;
        comparedPixels++;
        if (observed.slice(i, i + 4).some((v, c) => v !== expected[i + c])) differentPixels++;
        for (let c = 0; c < 4; c++) maxDelta = Math.max(maxDelta, Math.abs(observed[i + c]! - expected[i + c]!));
      }
      rows.push({ stateId: ref.stateId, root, viewport, nativeSha256: ref.sha256,
        comparedPixels, excludedOutsideNativeCapture: 940 * 590 - comparedPixels,
        approvedPixels: ref.approvedPixels?.length ?? 0, differentPixels, maxDelta });
    }
    return rows;
  } finally {
    reference.destroy(); game.textures.remove(key);
    objects.forEach((o, i) => o.setVisible(visibility[i]!));
    scenes.forEach(s => s.scene.resume());
  }
}
