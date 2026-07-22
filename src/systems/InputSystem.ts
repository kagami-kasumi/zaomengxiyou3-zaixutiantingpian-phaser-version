import Phaser from 'phaser';

export type PlayerSlot = 'p1' | 'p2';

export type AxisDirection = -1 | 0 | 1;

export type PlayerInputState = {
  slot: PlayerSlot;
  moveX: AxisDirection;
  down: boolean;
  up: boolean;
  attack: boolean;
  jump: boolean;
  skillSlots: readonly boolean[];
  special: boolean;
  magicWeapon: boolean;
};

export type InputState = {
  p1: PlayerInputState;
  p2: PlayerInputState;
};

export type InputSystem = {
  read(): InputState;
};

type PlayerKeyBindings = {
  left: number;
  right: number;
  down: number;
  up: number;
  attack: number;
  jump: number;
  skillSlots: readonly [number, number, number, number, number];
  special: number;
  magicWeapon: number;
};

type BoundPlayerKeys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  attack: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  skillSlots: readonly Phaser.Input.Keyboard.Key[];
  special: Phaser.Input.Keyboard.Key;
  magicWeapon: Phaser.Input.Keyboard.Key;
};

export const InputBindings: Record<PlayerSlot, PlayerKeyBindings> = {
  p1: {
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    up: Phaser.Input.Keyboard.KeyCodes.W,
    attack: Phaser.Input.Keyboard.KeyCodes.J,
    jump: Phaser.Input.Keyboard.KeyCodes.K,
    skillSlots: [
      Phaser.Input.Keyboard.KeyCodes.Y,
      Phaser.Input.Keyboard.KeyCodes.L,
      Phaser.Input.Keyboard.KeyCodes.U,
      Phaser.Input.Keyboard.KeyCodes.I,
      Phaser.Input.Keyboard.KeyCodes.O,
    ],
    special: Phaser.Input.Keyboard.KeyCodes.SPACE,
    magicWeapon: Phaser.Input.Keyboard.KeyCodes.H,
  },
  p2: {
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    attack: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE,
    jump: Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO,
    skillSlots: [
      Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT,
      Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE,
      Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR,
      Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE,
      Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX,
    ],
    special: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO,
    magicWeapon: Phaser.Input.Keyboard.KeyCodes.NUMPAD_SEVEN,
  },
};

export function createInputSystem(scene: Phaser.Scene): InputSystem {
  const keyboard = scene.input.keyboard;

  if (!keyboard) {
    return {
      read: () => ({
        p1: createEmptyPlayerInput('p1'),
        p2: createEmptyPlayerInput('p2'),
      }),
    };
  }

  const bufferedActionCodes = new Set<number>();
  const p1Keys = bindPlayerKeys(keyboard, InputBindings.p1, bufferedActionCodes);
  const p2Keys = bindPlayerKeys(keyboard, InputBindings.p2, bufferedActionCodes);

  return {
    read: () => ({
      p1: readPlayerInput('p1', p1Keys, bufferedActionCodes),
      p2: readPlayerInput('p2', p2Keys, bufferedActionCodes),
    }),
  };
}

function bindPlayerKeys(
  keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
  bindings: PlayerKeyBindings,
  bufferedActionCodes: Set<number>,
): BoundPlayerKeys {
  const keys = {
    left: keyboard.addKey(bindings.left),
    right: keyboard.addKey(bindings.right),
    down: keyboard.addKey(bindings.down),
    up: keyboard.addKey(bindings.up),
    attack: keyboard.addKey(bindings.attack),
    jump: keyboard.addKey(bindings.jump),
    skillSlots: bindings.skillSlots.map((keyCode) => keyboard.addKey(keyCode)),
    special: keyboard.addKey(bindings.special),
    magicWeapon: keyboard.addKey(bindings.magicWeapon),
  };
  for (const key of [
    keys.left,
    keys.right,
    keys.down,
    keys.up,
    keys.attack,
    keys.jump,
    ...keys.skillSlots,
    keys.special,
    keys.magicWeapon,
  ]) {
    key.on('down', () => bufferedActionCodes.add(key.keyCode));
  }
  return keys;
}

function readPlayerInput(
  slot: PlayerSlot,
  keys: BoundPlayerKeys,
  bufferedActionCodes: Set<number>,
): PlayerInputState {
  const leftDown = readBufferedAction(keys.left, bufferedActionCodes);
  const rightDown = readBufferedAction(keys.right, bufferedActionCodes);
  const moveX = leftDown === rightDown ? 0 : leftDown ? -1 : 1;

  return {
    slot,
    moveX,
    down: readBufferedAction(keys.down, bufferedActionCodes),
    up: readBufferedAction(keys.up, bufferedActionCodes),
    attack: readBufferedAction(keys.attack, bufferedActionCodes),
    jump: readBufferedAction(keys.jump, bufferedActionCodes),
    skillSlots: keys.skillSlots.map((key) => readBufferedAction(key, bufferedActionCodes)),
    special: readBufferedAction(keys.special, bufferedActionCodes),
    magicWeapon: readBufferedAction(keys.magicWeapon, bufferedActionCodes),
  };
}

function readBufferedAction(
  key: Phaser.Input.Keyboard.Key,
  bufferedActionCodes: Set<number>,
): boolean {
  const wasPressed = bufferedActionCodes.delete(key.keyCode);
  return key.isDown || wasPressed;
}

function createEmptyPlayerInput(slot: PlayerSlot): PlayerInputState {
  return {
    slot,
    moveX: 0,
    down: false,
    up: false,
    attack: false,
    jump: false,
    skillSlots: [false, false, false, false, false],
    special: false,
    magicWeapon: false,
  };
}
