import type { PlayerInputState } from './InputSystem';

export function findJustPressedSkillSlot(
  input: PlayerInputState,
  previousInput: PlayerInputState | undefined,
): number | undefined {
  const index = input.skillSlots.findIndex((pressed, slotIndex) =>
    pressed && !(previousInput?.skillSlots[slotIndex] ?? false)
  );
  return index >= 0 ? index : undefined;
}
