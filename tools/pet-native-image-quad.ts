/** Execute the installed Phaser batching math, not a reimplementation of flip semantics. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript') as typeof import('typescript');
const Matrix = require('phaser/src/gameobjects/components/TransformMatrix');
const path = require.resolve('phaser/src/renderer/webgl/pipelines/MultiPipeline');
const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
let functionText: string | undefined;
function visit(node: import('typescript').Node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'batchSprite') functionText = node.initializer.getText(source);
  ts.forEachChild(node, visit);
}
visit(source);
assert.ok(functionText);
const batch = runInNewContext(`(${functionText})`, { Utils: { getTintAppendFloatAlpha: () => 0 } });

export function assertNativeImageQuad(image: any, width: number, height: number, crop: { left: number; top: number }, sign: number) {
  let actual: number[] = [];
  const pipeline = {
    _tempMatrix1: new Matrix(), _tempMatrix2: new Matrix(), _tempMatrix3: new Matrix(),
    manager: { set() {}, preBatch() {}, postBatch() {} }, shouldFlush: () => false, setGameObject: () => 0,
    batchQuad: (_image: unknown, ...values: number[]) => { actual = values.slice(0, 8); },
  };
  const gameObject = { ...image, frame: { x: 0, y: 0, cutWidth: width, cutHeight: height,
    realWidth: width, realHeight: height, customPivot: false, glTexture: {}, u0: 0, v0: 0, u1: 1, v1: 1 },
    displayOriginX: image.origin.x * width, displayOriginY: image.origin.y * height,
    flipX: image.flip ?? false, flipY: false, scaleX: image.scaleX ?? 1, scaleY: image.scaleY ?? 1,
    rotation: 0, scrollFactorX: 1, scrollFactorY: 1,
  };
  batch.call(pipeline, gameObject, { matrix: new Matrix(), scrollX: 0, scrollY: 0, alpha: 1, roundPixels: false, renderRoundPixels: false });
  const left = image.x + sign * crop.left, right = image.x + sign * (crop.left + width);
  const top = image.y + crop.top, bottom = image.y + crop.top + height;
  const expected = [left, top, left, bottom, right, bottom, right, top];
  assert.equal(actual.length, expected.length);
  assert.ok(actual.every((value, index) => Math.abs(value - expected[index]!) <= 0.0001),
    `Phaser quad must mirror the source registration point: ${JSON.stringify({ actual, expected })}`);
}
