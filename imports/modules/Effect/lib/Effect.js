import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

let Game;
Meteor.startup(() => {
  // Temporary hack to avoid circular dependency
  // Must be changed to imports after
  // House, Cards, Achievements will be separate modules
  // eslint-disable-next-line global-require
  Game = require('/moduls/game/lib/main.game').default;
});

// Create subarray with name if no exists
const createArr = function(obj, name) {
  if (obj[name] === undefined) {
    // eslint-disable-next-line no-param-reassign
    obj[name] = [];
  }
};

// Push newEffects to proper place in effects object
const extendEffects = function(effects, newEffects) {
  if (newEffects) {
    newEffects.forEach((effect) => {
      const priority = effect.priority;
      createArr(effects, priority);

      effects[priority].push(effect);
    });
  }
};

// Filter unrelevant to obj newEffects and push relevant to effects
// Must be called with .call(this) from Effect object
const pushRelativeEffects = function(obj, effects, newEffects) {
  newEffects.forEach((effect) => {
    // Check that effect type equals to effect we want to receive
    if (effect.type !== this.type) {
      return;
    }

    // Check that effect is relevant to obj
    if (effect.condition) {
      const { type, engName, group, special } = effect.condition;

      if (engName && engName !== obj.engName) {
        return;
      }
      if (type && type !== obj.type) {
        return;
      }
      if (group && group !== obj.group) {
        return;
      }
      if (special && special !== obj.special) {
        return;
      }
    }

    createArr(effects, effect.priority);

    effects[effect.priority].push(effect);
  });
};

const createList = function(obj, name) {
  if (obj[name] === undefined) {
    // eslint-disable-next-line no-param-reassign
    obj[name] = { list: [] };
  }
};

// Put effect in proper place inside effects
const putEffect = function(effects, effect) {
  const { condition } = effect;

  createList(effects, effect.type);

  const typeEffects = effects[effect.type];

  if (condition && condition.type !== 'all') {
    const { type, group, special } = condition;
    const engName = condition.engName;
    // Если влияет только на конкретный объект
    if (engName) {
      createList(typeEffects, engName);
      typeEffects[engName].list.push(effect);
    } else {
      createList(typeEffects, type);
      const groupEffects = typeEffects[type];

      if (group) {
        createList(groupEffects, group);
        const specialEffects = groupEffects[group];
        if (special) {
          createList(specialEffects, special);
          specialEffects[special].list.push(effect);
        } else {
          specialEffects.list.push(effect);
        }
      } else {
        groupEffects.list.push(effect);
      }
    }
  } else {
    typeEffects.list.push(effect);
  }
};

// Handle all effects
// Structure:
// {
//  [engName]: { list: [] }, // Affect directly on something with same name
//  [type]: {
//    list: [], // Affect on anything with same type
//    [group]: {
//      list: [], // Affect on anything with same type and group
//      [special]: { list: [] }, // Affect on anything with same type, group and special
//    }
//  }
// }
const allEffects = {};

class Effect {
  // Return effects object sorted by priority with relevant to obj effects
  static getRelatedTo({
    obj = {},
    isOnlyMutual = false,
    instantEffects = [],
    userId = Meteor.userId(),
  } = {}) {
    const effects = {};

    const {
      [obj.engName]: { list: objectEffects = [] } = {},
      [obj.type]: { list: typeEffects = [] } = {},
      [obj.type]: {
        [obj.group]: { list: groupEffects = [] } = {},
        [obj.group]: {
          [obj.special]: { list: specialEffects = [] } = {},
        } = {},
      } = {},
    } = allEffects[this.type];

    extendEffects(effects, [
      ...objectEffects,
      ...typeEffects,
      ...groupEffects,
      ...specialEffects,
    ]);

    pushRelativeEffects.call(this, obj, effects, instantEffects);


    if (this.type !== 'special') {
      extendEffects(effects, allEffects[this.type].list);
    }

    if (!isOnlyMutual) {
      // Items, Cards, Achievements
      const items = [
        ...Game.House.getPlacedItems({ userId }),
        ...Game.Cards.getActive({ userId }),
        ...Game.Achievements.getCompleted({ userId }),
      ];

      pushRelativeEffects.call(
        this,
        obj,
        effects,
        _(items)
          .chain()
          .map(item => item.effect)
          .flatten(true)
          .filter(effect => typeof effect !== 'undefined')
          .value(),
      );
    }

    return effects;
  }

  // Add real results to effects
  // Return structure:
  // {
  //   [priority]: {
  //     [affect]: [
  //       {
  //         value, // Number
  //         provider, // Object, that provide this effect
  //         type, // Effect type
  //         priority, // priority
  //       },
  //       ...
  //     ]
  //   }
  // }
  static getEffectsResult({
    effectsByPriority,
    isOnlyMutual = false,
    ...options
  }) {
    const result = {};
    const cache = {};
    let value = null;

    _(effectsByPriority).pairs().forEach(([priority, effects]) => {
      result[priority] = {};
      effects.forEach((effect) => {
        if (isOnlyMutual && effect.provider.type !== 'mutual') {
          return;
        }

        // Cache for building & research
        if (['building', 'research'].indexOf(effect.provider.type) !== -1) {
          const provider = effect.provider;
          if (cache[provider.type] === undefined) {
            const providerClass = Game.getObjectByType(provider.type);
            cache[provider.type] = providerClass.getValue(options) || {};
          }

          const level = (
               cache[provider.type]
            && cache[provider.type][provider.group]
            && cache[provider.type][provider.group][provider.engName]
              ? cache[provider.type][provider.group][provider.engName]
              : 0
          );

          value = effect.result({ ...options, level });
        } else {
          value = effect.result(options);
        }

        if (!_.isArray(effect.affect)) {
          // eslint-disable-next-line no-param-reassign
          effect.affect = [effect.affect];
        }

        if (value && value !== undefined) {
          effect.affect.forEach((affect) => {
            createArr(result[priority], affect);

            result[priority][affect].push({
              value: (Math.floor((value * 100)) / 100),
              provider: effect.provider,
              type: effect.type,
              priority: effect.priority,
            });
          });
        }
      });
    });


    return result;
  }

  // Get related effects and calculate result from them
  static getEffectsResultFor(options) {
    return this.getEffectsResult({
      ...options,
      effectsByPriority: this.getRelatedTo(options),
    });
  }

  // Alias for getEffectsResultFor.
  // Can be used without arguments
  static getAll(options) {
    return this.getEffectsResultFor(options);
  }

  // Calculate final numbers that applied to obj
  // Return structure:
  // {
  //   [affect]: Float,
  // }
  static getValue({
    obj = {},
    instantEffects = [],
    hideEffects = true,
    ...options
  } = {}) {
    let effectsByPriority = options.effectsByPriority;
    if (!effectsByPriority) {
      effectsByPriority = this.getEffectsResultFor({
        ...options,
        obj,
        instantEffects,
      });
    }
    const result = {};

    Object.defineProperty(result, 'effects', {
      value: effectsByPriority,
      configurable: true,
      enumerable: !hideEffects,
    });

    _(effectsByPriority).pairs().forEach(([priority, effects]) => {
      _(effects).pairs().forEach(([affect, affectEffects]) => {
        const effectValue = affectEffects.reduce(
          (sum, effect) => sum + effect.value,
          0,
        );

        if (result[affect] === undefined) {
          result[affect] = 0;
        }

        if (priority % 2 === 1) {
          result[affect] += effectValue;
        } else {
          result[affect] += Math.floor(result[affect] * (0.01 * effectValue));
        }
      });
    });

    return result;
  }

  // WARN! Modify obj and add effects property
  // Apply corresponding to target effects to obj
  static applyTo({
    target,
    obj,
    hideEffects = true,
    instantEffects = [],
    isOnlyMutual = false,
    ...options
  }) {
    let effectsByPriority = options.effectsByPriority;
    if (!effectsByPriority) {
      effectsByPriority = this.getEffectsResultFor({
        ...options,
        obj: target,
        instantEffects,
        isOnlyMutual,
      });
    }

    Object.defineProperty(obj, 'effects', {
      value: effectsByPriority,
      configurable: true,
      enumerable: !hideEffects,
    });

    const modifier = this.isReduce ? -1 : 1;

    _(effectsByPriority).pairs().forEach(([priority, effects]) => {
      _(effects).pairs().forEach(([affect, affectEffects]) => {
        const effectValue = affectEffects.reduce(
          (sum, effect) => sum + effect.value,
          0,
        );

        if (obj[affect] === undefined) {
          return;
        }

        if (affect === 'damage') {
          const damage = obj.weapon.damage;
          if (priority % 2 === 1) {
            damage.min += effectValue * modifier;
            damage.max += effectValue * modifier;
          } else {
            damage.min += Math.floor(damage.min * (0.01 * effectValue)) * modifier;
            damage.max += Math.floor(damage.max * (0.01 * effectValue)) * modifier;
          }
        } else if (affect === 'life') {
          const health = obj.health;
          if (priority % 2 === 1) {
            health.armor += effectValue * modifier;
          } else {
            health.armor += (Math.floor(health.armor * (0.01 * effectValue)) * modifier);
          }
        } else if (priority % 2 === 1) {
          // eslint-disable-next-line no-param-reassign
          obj[affect] += effectValue * modifier;
        } else if (affect === 'time') {
          const resultedValue = (Math.abs(effectValue) + 100) * 0.01;

          if ((this.isReduce && effectValue >= 0) || (!this.isReduce && effectValue < 0)) {
            // eslint-disable-next-line no-param-reassign
            obj[affect] = Math.ceil(obj[affect] / resultedValue);
          } else {
            // eslint-disable-next-line no-param-reassign
            obj[affect] = Math.ceil(obj[affect] * resultedValue);
          }
        } else {
          // eslint-disable-next-line no-param-reassign
          obj[affect] += Math.floor(obj[affect] * (0.01 * effectValue)) * modifier;
        }
      });
    });

    return obj;
  }

  constructor({
    textBefore = '',
    textAfter = '',
    condition,
    priority,
    affect,
    result,
    notImplemented = false,
  }) {
    // TODO : accept condition as id path / array
    this.textBefore = textBefore;
    this.textAfter = textAfter;
    this.condition = condition;
    this.priority = priority;
    this.affect = affect;

    // Provide (level) argument to result function
    this.result = (options = this.getCurrentLevel()) => {
      if (_(options).isObject()) {
        if (!_(options.level).isUndefined()) {
          return result(options.level);
        }
        return result(this.getCurrentLevel(options));
      }

      // legacy!
      // options = level
      return result(options);
    };

    this.notImplemented = notImplemented;

    this.isReduce = false;

    // legacy
    this.pretext = textBefore;
    this.aftertext = textAfter;
  }

  setProvider(provider) {
    this.provider = provider;
  }

  register(obj) {
    this.setProvider(obj);

    putEffect(allEffects, this);
  }

  // Return level of provider
  getCurrentLevel(options) {
    return this.provider.getCurrentLevel(options);
  }

  // legacy
  next({ level = this.getCurrentLevel() } = {}) {
    return {
      pretext: this.pretext,
      textBefore: this.textBefore,
      textAfter: this.textAfter,
      aftertext: this.aftertext,
      condition: this.condition,
      priority: this.priority,
      affect: this.affect,
      level: level + 1,
      result: this.result({ level: level + 1 }),
    };
  }

  get level() {
    return this.getCurrentLevel();
  }
}

export default Effect;
