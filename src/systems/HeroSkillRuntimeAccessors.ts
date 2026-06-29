import {
  createRole1SkillRuntime,
  type Role1SkillRuntimeModel,
} from './Role1BasicSkillSystem';
import {
  createRole1ShadowSkillRuntime,
  type Role1ShadowSkillRuntime,
} from './Role1ShadowSkillSystem';
import {
  createRole1FinisherSkillRuntime,
  type Role1FinisherSkillRuntime,
} from './Role1FinisherSkillSystem';
import {
  createRole2SkillRuntime,
  type Role2SkillRuntimeModel,
} from './Role2SkillRuntimeSystem';
import {
  createRole3SkillRuntime,
  type Role3SkillRuntimeModel,
} from './Role3DefenseSkillSystem';
import {
  createRole4PoisonSkillRuntime,
  type Role4PoisonSkillRuntime,
} from './Role4PoisonSkillSystem';
import {
  createRole4VoodooDollRuntime,
  type Role4VoodooDollRuntime,
} from './Role4VoodooDollSystem';
import {
  createRole4PoisonChainRuntime,
  type Role4PoisonChainRuntime,
} from './Role4PoisonChainSystem';
import {
  createRole4MobilitySkillRuntime,
  type Role4MobilitySkillRuntime,
} from './Role4MobilitySkillSystem';
import {
  createRole4FinisherSkillRuntime,
  type Role4FinisherSkillRuntime,
} from './Role4FinisherSkillSystem';
import {
  createRole5SkillRuntime,
  type Role5SkillRuntime,
} from './Role5SkillSystem';
import type { HeroRoleSkillRuntimes, HeroSkillModel } from './HeroSkillSystem';

export function installHeroSkillRuntimeAccessors(model: HeroSkillModel): void {
  Object.defineProperties(model, {
    role1Runtime: {
      get: () => getRole1RuntimeBundle(model).basic,
      set: (value: Role1SkillRuntimeModel) => {
        getRole1RuntimeBundle(model).basic = value;
      },
    },
    role1ShadowRuntime: {
      get: () => getRole1RuntimeBundle(model).shadow,
      set: (value: Role1ShadowSkillRuntime) => {
        getRole1RuntimeBundle(model).shadow = value;
      },
    },
    role1FinisherRuntime: {
      get: () => getRole1RuntimeBundle(model).finisher,
      set: (value: Role1FinisherSkillRuntime) => {
        getRole1RuntimeBundle(model).finisher = value;
      },
    },
    role2Runtime: {
      get: () => getRole2RuntimeBundle(model).main,
      set: (value: Role2SkillRuntimeModel) => {
        getRole2RuntimeBundle(model).main = value;
      },
    },
    role3Runtime: {
      get: () => getRole3RuntimeBundle(model).main,
      set: (value: Role3SkillRuntimeModel) => {
        getRole3RuntimeBundle(model).main = value;
      },
    },
    role4Runtime: {
      get: () => getRole4RuntimeBundle(model).poison,
      set: (value: Role4PoisonSkillRuntime) => {
        getRole4RuntimeBundle(model).poison = value;
      },
    },
    role4VoodooRuntime: {
      get: () => getRole4RuntimeBundle(model).voodoo,
      set: (value: Role4VoodooDollRuntime) => {
        getRole4RuntimeBundle(model).voodoo = value;
      },
    },
    role4PoisonChainRuntime: {
      get: () => getRole4RuntimeBundle(model).chain,
      set: (value: Role4PoisonChainRuntime) => {
        getRole4RuntimeBundle(model).chain = value;
      },
    },
    role4MobilityRuntime: {
      get: () => getRole4RuntimeBundle(model).mobility,
      set: (value: Role4MobilitySkillRuntime) => {
        getRole4RuntimeBundle(model).mobility = value;
      },
    },
    role4FinisherRuntime: {
      get: () => getRole4RuntimeBundle(model).finisher,
      set: (value: Role4FinisherSkillRuntime) => {
        getRole4RuntimeBundle(model).finisher = value;
      },
    },
    role5Runtime: {
      get: () => getRole5RuntimeBundle(model).main,
      set: (value: Role5SkillRuntime) => {
        getRole5RuntimeBundle(model).main = value;
      },
    },
  });
}

function getRole1RuntimeBundle(model: HeroSkillModel): NonNullable<HeroRoleSkillRuntimes[1]> {
  model.roleRuntimes[1] ??= {
    basic: createRole1SkillRuntime(),
    shadow: createRole1ShadowSkillRuntime(),
    finisher: createRole1FinisherSkillRuntime(),
  };
  return model.roleRuntimes[1];
}

function getRole2RuntimeBundle(model: HeroSkillModel): NonNullable<HeroRoleSkillRuntimes[2]> {
  model.roleRuntimes[2] ??= { main: createRole2SkillRuntime() };
  return model.roleRuntimes[2];
}

function getRole3RuntimeBundle(model: HeroSkillModel): NonNullable<HeroRoleSkillRuntimes[3]> {
  model.roleRuntimes[3] ??= { main: createRole3SkillRuntime() };
  return model.roleRuntimes[3];
}

function getRole4RuntimeBundle(model: HeroSkillModel): NonNullable<HeroRoleSkillRuntimes[4]> {
  model.roleRuntimes[4] ??= {
    poison: createRole4PoisonSkillRuntime(),
    voodoo: createRole4VoodooDollRuntime(),
    chain: createRole4PoisonChainRuntime(),
    mobility: createRole4MobilitySkillRuntime(),
    finisher: createRole4FinisherSkillRuntime(),
  };
  return model.roleRuntimes[4];
}

function getRole5RuntimeBundle(model: HeroSkillModel): NonNullable<HeroRoleSkillRuntimes[5]> {
  model.roleRuntimes[5] ??= { main: createRole5SkillRuntime() };
  return model.roleRuntimes[5];
}
