import { turtleManifest, turtleManifestPath } from './PetTurtleAssetCatalog';
import decodedHashes from './PetTurtleDecodedHashes.json';
import { decodeTurtlePng, inflateTurtleBytes } from './PetTurtlePng';
import { PetTurtleCollisionAssets } from './PetTurtleCollisionAssets';
import type { TurtleCollisionPackage, TurtlePixels, TurtleVisualPackage, TurtleVisualState } from './PetTurtleAssetTypes';

export type TurtleAssetRead = (path: string) => Uint8Array;
export class PetTurtleAssets {
  private readonly stateMap = new Map<string, TurtleVisualState>();
  private readonly imageMap = new Map<string, TurtlePixels>();
  private readonly packageMap = new Map<string, TurtleVisualPackage>();
  readonly states: ReadonlyMap<string, TurtleVisualState> = this.stateMap;
  readonly images: ReadonlyMap<string, TurtlePixels> = this.imageMap;
  readonly packages: ReadonlyMap<string, TurtleVisualPackage> = this.packageMap;
  readonly collision: PetTurtleCollisionAssets;
  readonly display: Readonly<{ states: readonly Readonly<{ id: string }>[];
    projectionDisplayObjects: readonly Readonly<{ id: string }>[]; sourceDisplayObjects: readonly unknown[] }>;

  private constructor(packages: Readonly<Record<string, unknown>>) {
    this.display = packages.display as typeof this.display;
    this.collision = new PetTurtleCollisionAssets(packages.collision as TurtleCollisionPackage);
    for (const mode of ['body', 'effects', 'dynamic', 'buff']) {
      const data = packages[mode] as TurtleVisualPackage;
      this.packageMap.set(mode, data);
      for (const state of data.states) {
        if (this.states.has(state.id)) throw new Error(`Duplicate turtle state ${state.id}`);
        this.stateMap.set(state.id, state);
      }
    }
  }
  static async decode(read: TurtleAssetRead): Promise<PetTurtleAssets> {
    const delivered = JSON.parse(new TextDecoder().decode(read(turtleManifestPath))) as typeof turtleManifest;
    if (JSON.stringify(delivered) !== JSON.stringify(turtleManifest)) throw new Error('Turtle manifest differs from bundle catalog');
    const packages: Record<string, unknown> = {};
    // Sequential package decoding bounds peak decompression memory. No filesystem/evidence access.
    for (const [name, record] of Object.entries(turtleManifest.packages)) {
      const bytes = read(record.path);
      const integrity = decodedHashes[name as keyof typeof decodedHashes];
      if (integrity.compressedSha256 !== record.sha256) throw new Error('Stale turtle decoded integrity table');
      const compressed = bytes[0] === 31 && bytes[1] === 139;
      if (compressed) await checkHash(bytes, record.sha256);
      const decoded = compressed ? await inflateTurtleBytes(bytes, 'gzip') : bytes;
      await checkHash(decoded, integrity.decodedSha256);
      packages[name] = JSON.parse(new TextDecoder().decode(decoded));
    }
    const assets = new PetTurtleAssets(packages);
    for (const [id, record] of Object.entries(turtleManifest.images)) {
      const bytes = read(record.path); await checkHash(bytes, record.sha256);
      const pixels = await decodeTurtlePng(bytes);
      if (pixels.width !== record.width || pixels.height !== record.height) throw new Error(`Turtle image dimensions ${id}`);
      assets.imageMap.set(id, pixels);
    }
    assets.validate();
    return assets;
  }
  state(id: string): TurtleVisualState {
    const result = this.states.get(id);
    if (!result) throw new Error(`Unknown turtle visual state ${id}`);
    return result;
  }
  body(form: number, row: number, column: number, direct: 0 | 1, owner: 'P1' | 'P2') {
    return this.state(`body:turtle${form}-r${row}-c${column}-d${direct}-${owner}`);
  }
  effect(symbol: string, tick: number, scale: 1 | 2, sign: -1 | 1) {
    return this.state(`effect:${symbol}:${tick}:s${scale}:d${sign}`);
  }
  bodyAnimation(form: number, action: string) {
    const body = turtleManifest.bodyAnimations.find(row => row.form === form);
    const selection = body?.actions.find(row => row.action === action);
    const row = body?.rows.find(row => row.row === selection?.row);
    if (!body || !selection || !row) throw new Error(`Unknown turtle animation ${form}/${action}`);
    // Definition only. EntitySession remains responsible for advancing PetAnimationClock.
    return { ...selection, cells: row.cells, totalHostTicks: row.totalHostTicks,
      cellSize: body.cellSize, offset: body.offset };
  }
  private validate(): void {
    if (this.states.size !== 11572 || this.images.size !== 643 || turtleManifest.contracts.length !== 32
      || Object.keys(this.collision.data.mapping).length !== 61424) throw new Error('Incomplete turtle asset delivery');
    const displayStates = new Set(this.display.states.map(row => row.id));
    const objectIds = new Set(this.display.projectionDisplayObjects.map(row => row.id));
    for (const [mode, data] of this.packages) {
      const count = turtleManifest.packages[mode as 'body' | 'effects' | 'dynamic' | 'buff'].states;
      if (data.states.length !== count) throw new Error(`Turtle state coverage ${mode}`);
      for (const state of data.states) {
        if (!displayStates.has(state.id)) throw new Error(`Missing turtle display state ${state.id}`);
        let previousDepth = -Infinity;
        const owners = new Set<string>();
        for (const group of state.groups) {
          if (owners.has(group.ownerPath) || group.depth < previousDepth) throw new Error(`Turtle owner/depth order ${state.id}`);
          owners.add(group.ownerPath); previousDepth = group.depth;
          for (const part of [...group.paintParts, ...group.components]) {
            const pixels = this.images.get(part.image);
            if (!pixels || pixels.width !== part.width || pixels.height !== part.height
              || !Number.isInteger(part.origin.x) || !Number.isInteger(part.origin.y)) {
              throw new Error(`Invalid turtle paint part ${state.id}/${part.sourcePath}`);
            }
          }
        }
        for (const link of state.projectionLinks) if (!objectIds.has(link.objectId) || !owners.has(link.ownerPath)) {
          throw new Error(`Missing turtle display link ${state.id}/${link.objectId}`);
        }
      }
    }
  }
}
async function checkHash(bytes: Uint8Array, expected: string): Promise<void> {
  const copy = new Uint8Array(bytes.length); copy.set(bytes);
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', copy)))
    .map(value => value.toString(16).padStart(2, '0')).join('');
  if (hash !== expected) throw new Error(`Turtle asset hash mismatch: ${expected}`);
}
