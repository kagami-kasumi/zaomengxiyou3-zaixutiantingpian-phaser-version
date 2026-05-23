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

  const p1Keys = bindPlayerKeys(keyboard, InputBindings.p1);
  const p2Keys = bindPlayerKeys(keyboard, InputBindings.p2);

  return {
    read: () => ({
      p1: readPlayerInput('p1', p1Keys),
      p2: readPlayerInput('p2', p2Keys),
    }),
  };
}

function bindPlayerKeys(
  keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
  bindings: PlayerKeyBindings,
): BoundPlayerKeys {
  return {
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
}

function readPlayerInput(slot: PlayerSlot, keys: BoundPlayerKeys): PlayerInputState {
  const leftDown = keys.left.isDown;
  const rightDown = keys.right.isDown;
  const moveX = leftDown === rightDown ? 0 : leftDown ? -1 : 1;

  return {
    slot,
    moveX,
    down: keys.down.isDown,
    up: keys.up.isDown,
    attack: keys.attack.isDown,
    jump: keys.jump.isDown,
    skillSlots: keys.skillSlots.map((key) => key.isDown),
    special: keys.special.isDown,
    magicWeapon: keys.magicWeapon.isDown,
  };
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
