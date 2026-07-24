import {
  runtimeAssetBundleOwners,
  sceneAssetBundles,
  type AssetBundleId,
  type BundleAssetDefinition,
  type SceneAssetBundleDefinition,
} from '../assets/SceneAssetBundles';

export type AssetBundleLoadStatus = 'idle' | 'loading' | 'loaded' | 'failed';

export type AssetBundleLoadAdapter = {
  has(asset: BundleAssetDefinition): boolean;
  load(bundleId: AssetBundleId, assets: readonly BundleAssetDefinition[]): Promise<void>;
};

export class AssetBundleCoordinator {
  private readonly status = new Map<AssetBundleId, AssetBundleLoadStatus>();
  private readonly inFlight = new Map<AssetBundleId, Promise<void>>();

  public constructor(
    private readonly catalog: Readonly<Record<AssetBundleId, SceneAssetBundleDefinition>> =
      sceneAssetBundles,
  ) {}

  public getStatus(bundleId: AssetBundleId): AssetBundleLoadStatus {
    return this.status.get(bundleId) ?? 'idle';
  }

  public isLoaded(bundleId: AssetBundleId): boolean {
    return this.getStatus(bundleId) === 'loaded';
  }

  public ensure(bundleId: AssetBundleId, adapter: AssetBundleLoadAdapter): Promise<void> {
    if (this.isLoaded(bundleId)) return Promise.resolve();
    const existing = this.inFlight.get(bundleId);
    if (existing) return existing;

    const request = this.loadBundle(bundleId, adapter);
    this.inFlight.set(bundleId, request);
    return request;
  }

  private async loadBundle(bundleId: AssetBundleId, adapter: AssetBundleLoadAdapter): Promise<void> {
    this.status.set(bundleId, 'loading');
    try {
      const bundle = this.catalog[bundleId];
      for (const dependency of bundle.dependencies) await this.ensure(dependency, adapter);
      const missing = bundle.assets.filter((asset) => !adapter.has(asset));
      if (missing.length > 0) await adapter.load(bundleId, missing);
      const unresolved = bundle.assets.filter((asset) => !adapter.has(asset));
      if (unresolved.length > 0) {
        throw new Error(
          `Asset bundle "${bundleId}" completed with missing resources: `
          + unresolved.map((asset) => asset.key).join(', '),
        );
      }
      this.status.set(bundleId, 'loaded');
    } catch (error) {
      this.status.set(bundleId, 'failed');
      throw error;
    } finally {
      this.inFlight.delete(bundleId);
    }
  }
}

export function requireRuntimeAssetOwner(assetKey: string): string {
  const owner = runtimeAssetBundleOwners.get(assetKey);
  if (!owner) throw new Error(`Ready runtime asset "${assetKey}" has no bundle owner.`);
  return owner;
}

