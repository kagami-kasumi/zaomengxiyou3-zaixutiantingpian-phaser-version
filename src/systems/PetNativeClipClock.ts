/** Native MovieClip phase, read independently from the paused combat caller. */
export function createPetNativeFrameReader(readTick: () => number, frameCount: number): () => number {
  if (!Number.isSafeInteger(frameCount) || frameCount <= 0) throw new Error('Invalid native clip frame count');
  const born = Math.floor(readTick() + 1e-9);
  return () => {
    const elapsed = Math.max(1, Math.floor(readTick() + 1e-9) - born);
    return (elapsed - 1) % frameCount + 1;
  };
}
