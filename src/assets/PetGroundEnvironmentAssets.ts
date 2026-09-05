import truth from '../../docs/reverse-engineering/ground-truth/manifests/task-settings-217-pet-ground-environment.json';
import properties from '../../docs/tasks/evidence/TASK-SETTINGS-217/environment-properties.json';
import source from '../../docs/tasks/evidence/TASK-SETTINGS-217/source-contract.json';
import type { PetGroundWall } from '../systems/PetGroundMovementSystem';
import { STAGE11_SCENE_OFFSET_Y } from '../systems/Stage11Layout';

export type PetGroundEnvironment = Readonly<{
  walls: readonly PetGroundWall[];
  /** Convert the modern hero foot into the existing verified collision-profile root. */
  ownerRootOffsetY: number;
}>;

export function getPetGroundEnvironment(level: 11 | 12 | 13 | 21 | 22): PetGroundEnvironment {
  if (truth.status !== 'verified' || properties.status !== 'verified'
    || properties.truthId !== truth.truthId) throw new Error('Unverified pet ground environment');
  const environment = properties.levels.find((item) => item.level === level);
  if (!environment) throw new Error(`Missing pet ground level ${level}`);
  const offsetY = level === 11 ? STAGE11_SCENE_OFFSET_Y : 0;
  const walls = environment.collisionOrder.map((id): PetGroundWall => {
    const flags = environment.walls.find((wall) => wall.objectId === id);
    const object = truth.displayObjects.find((item) => item.id === id);
    const box = object?.placements[0]?.stageBounds;
    if (!flags?.axisAligned || !box) throw new Error(`Unsupported pet wall ${id}`);
    return Object.freeze({
      id, left: box.left, right: box.left + box.width,
      top: box.top + offsetY, bottom: box.top + box.height + offsetY,
      through: flags.through, throughDown: flags.throughDown, throughUp: flags.throughUp,
      isThroughWallClass: flags.isThroughWallClass, usesWallTolerance: flags.usesWallTolerance,
    });
  });
  return Object.freeze({ walls: Object.freeze(walls),
    ownerRootOffsetY: source.ownerMapping.existingProfileGroundRootOffsetY });
}

export const PetGroundOwnerAnchors = Object.freeze({
  spawnOffsetY: source.ownerMapping.spawnOffsetY,
  warpOffsetY: source.ownerMapping.warpOffsetY,
});
