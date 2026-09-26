import source from './pet-horse-target-ice.json';

export const petHorseIceAsset = source;

/** Flash width/height setters store positive source scales as 16.16 fixed point. */
export function getPetHorseIceTransform(colipseWidth: number, colipseHeight: number) {
  return {
    scaleX: Math.trunc(colipseWidth / source.sourceBounds.width * 65536) / 65536,
    scaleY: Math.trunc(colipseHeight / source.sourceBounds.height * 65536) / 65536,
    originX: -source.crop.left / source.width,
    originY: -source.crop.top / source.height,
  };
}
