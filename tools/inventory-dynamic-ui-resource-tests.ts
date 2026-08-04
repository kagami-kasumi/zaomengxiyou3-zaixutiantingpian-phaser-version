import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

import { inventoryUiAssetList, inventoryUiAssets } from '../src/assets/InventoryUiAssets';

type PngInfo = Readonly<{
  width: number;
  height: number;
  hasTransparentPixel: boolean;
}>;

const root = process.cwd();

function readPngInfo(filePath: string): PngInfo {
  const png = readFileSync(filePath);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  assert.equal(png[24], 8, `${filePath} must use 8-bit PNG channels`);
  assert.equal(png[25], 6, `${filePath} must preserve an RGBA channel`);

  const idat: Buffer[] = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') {
      idat.push(png.subarray(offset + 8, offset + 8 + length));
    }
    offset += length + 12;
  }

  const scanlines = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  let previous = Buffer.alloc(stride);
  let hasTransparentPixel = false;
  for (let y = 0; y < height; y += 1) {
    const filter = scanlines[y * (stride + 1)];
    const encoded = scanlines.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const decoded = Buffer.alloc(stride);
    for (let x = 0; x < stride; x += 1) {
      const left = x >= 4 ? decoded[x - 4] : 0;
      const up = previous[x];
      const upperLeft = x >= 4 ? previous[x - 4] : 0;
      const predictor = left + up - upperLeft;
      const pa = Math.abs(predictor - left);
      const pb = Math.abs(predictor - up);
      const pc = Math.abs(predictor - upperLeft);
      const paeth = pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft;
      const delta = filter === 0 ? 0
        : filter === 1 ? left
          : filter === 2 ? up
            : filter === 3 ? Math.floor((left + up) / 2)
              : paeth;
      assert.ok(filter >= 0 && filter <= 4, `${filePath} uses unsupported PNG filter ${filter}`);
      decoded[x] = (encoded[x] + delta) & 0xff;
    }
    for (let x = 3; x < stride; x += 4) {
      hasTransparentPixel ||= decoded[x] < 255;
    }
    previous = decoded;
  }
  return { width, height, hasTransparentPixel };
}

function assertDimensions(assetPath: string, width: number, height: number): void {
  const info = readPngInfo(path.join(root, 'public', assetPath));
  assert.deepEqual([info.width, info.height], [width, height], assetPath);
  assert.equal(info.hasTransparentPixel, true, `${assetPath} must retain transparent pixels`);
}

function testStableManifestAndProvenance(): void {
  assert.equal(inventoryUiAssetList.length, 83);
  assert.equal(new Set(inventoryUiAssetList.map((asset) => asset.key)).size, 83);
  assert.equal(new Set(inventoryUiAssetList.map((asset) => asset.path)).size, 83);
  for (const asset of inventoryUiAssetList) {
    assert.equal(asset.sourcePackage, 'assets/backpack1.swf');
    assert.ok(asset.sourceCharacterId > 0);
    assert.match(asset.path, /^\/assets\/ui\/inventory\/native\/[\w-]+\.png$/);
    assert.equal(existsSync(path.join(root, 'public', asset.path)), true, asset.path);
  }

  assert.deepEqual(inventoryUiAssets.exp.frames.map((asset) => asset.sourceFrame), [...Array(30)].map((_, index) => index + 1));
  assert.deepEqual(inventoryUiAssets.level.digits.map((asset) => asset.sourceCharacterId), [11, 10, 12, 8, 7, 6, 5, 4, 3, 2]);
  assert.equal(inventoryUiAssets.operationSimple.default.sourceCharacterId, 358);
  assert.equal(inventoryUiAssets.operationThree.default.sourceCharacterId, 610);
  assert.equal(inventoryUiAssets.operationThree.equipRenew.sourceFrame, 3);
  assert.equal(inventoryUiAssets.sellWhite.down.sourceState, 'down');
}

function testDimensionsAlphaAndNoPageCaptures(): void {
  assertDimensions(inventoryUiAssets.operationSimple.default.path, 87, 117);
  assertDimensions(inventoryUiAssets.operationSimple.background.path, 87, 117);
  assertDimensions(inventoryUiAssets.operationThree.default.path, 87, 115);
  assertDimensions(inventoryUiAssets.operationThree.background.path, 87, 115);
  for (const asset of [
    ...Object.values(inventoryUiAssets.operationSimple).slice(2),
    ...Object.values(inventoryUiAssets.operationShared),
    ...Object.values(inventoryUiAssets.operationThree).slice(2),
  ]) {
    assertDimensions(asset.path, 77, 31);
  }
  assertDimensions(inventoryUiAssets.level.plate.path, 83, 59);
  for (const asset of inventoryUiAssets.level.digits) assertDimensions(asset.path, 47, 50);
  for (const asset of inventoryUiAssets.exp.frames) assertDimensions(asset.path, 452, 20);
  for (const asset of Object.values(inventoryUiAssets.sellWhite)) assertDimensions(asset.path, 62, 28);
  for (const asset of Object.values(inventoryUiAssets.fashionToggle)) assertDimensions(asset.path, 49, 18);

  for (const asset of inventoryUiAssetList) {
    const { width, height } = readPngInfo(path.join(root, 'public', asset.path));
    assert.ok(width < 940 && height < 590, `${asset.path} must not be a whole-page capture`);
  }
}

testStableManifestAndProvenance();
testDimensionsAlphaAndNoPageCaptures();
console.log('Inventory dynamic native UI manifest, provenance, dimensions, alpha, and no-page-capture gates passed.');
