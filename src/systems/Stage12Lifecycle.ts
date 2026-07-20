export type Stage12CleanupHandle = Readonly<{
  destroyed: () => boolean;
  destroy: () => void;
}>;

export function createStage12Cleanup(onDestroy: () => void): Stage12CleanupHandle {
  let isDestroyed = false;
  return {
    destroyed: () => isDestroyed,
    destroy: () => {
      if (isDestroyed) return;
      isDestroyed = true;
      onDestroy();
    },
  };
}
