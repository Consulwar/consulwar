import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { priceT1, priceT2, priceT3, priceT4 } from '/imports/content/formula';
import AbstractItem from './AbstractItem.js';

let Game;
Meteor.startup(() => {
  // Temporary hack to avoid circular dependency
  // Must be changed to imports after
  // House, Cards, Achievements will be separate modules
  // eslint-disable-next-line global-require
  Game = require('/moduls/game/lib/main.game').default;
});

class AbstractUniqueItem extends AbstractItem {
  constructor({
    maxLevel = 100,
    overlay,
    ...options
  }) {
    super({ ...options });

    this.maxLevel = maxLevel;

    this.overlay = overlay;
    if (overlay && typeof overlay.type === 'undefined') {
      this.overlay.type = 'png';
    }
  }

  getRequirements({ level = this.getCurrentLevel() + 1 } = {}) {
    return this.requirements(level - 1).map(([id, reqLevel]) => (
      [AbstractItem.getObject({ id }), reqLevel]
    ));
  }

  getCurrentLevel(options) {
    return this.getLevel({
      ...options,
      id: this.id,
    });
  }

  getBasePrice({
    fromLevel = this.getCurrentLevel(),
    level = fromLevel + 1,
  } = {}) {
    const curPrice = {};

    for (let iLevel = fromLevel; iLevel < level; iLevel += 1) {
      let levelPrice;
      switch (this.basePrice.tier) {
        case 1:
          levelPrice = priceT1.call(this, iLevel, this.basePrice.group);
          break;
        case 2:
          levelPrice = priceT2.call(this, iLevel, this.basePrice.group);
          break;
        case 3:
          levelPrice = priceT3.call(this, iLevel, this.basePrice.group);
          break;
        case 4:
          levelPrice = priceT4.call(this, iLevel, this.basePrice.group);
          break;
        default:
          levelPrice = this.basePrice(iLevel);
          break;
      }

      // eslint-disable-next-line no-loop-func
      _(levelPrice).pairs().forEach(([
        resourceName,
        [
          startValue,
          funcName,
          from,
        ],
      ]) => {
        const idParts = resourceName.split('/');
        let realName = idParts[idParts.length - 1].toLocaleLowerCase();
        if (Game.newToLegacyNames[realName]) {
          realName = Game.newToLegacyNames[realName];
        }
        curPrice[realName] = (curPrice[realName] || 0);
        curPrice[realName] += Game.functions[funcName].call(
          this,
          iLevel,
          startValue,
          from,
        );
      });
    }

    return curPrice;
  }

  getPrice(level) {
    return this.applyPriceEffects({
      price: this.getBasePrice({ level }),
    });
  }

  canBuild(level) {
    const hasResources = Game.Resources.has({
      resources: this.getPrice(level),
    });
    const hasTechnologies = this.meetRequirements({ level });
    const limitExceeded = this.maxLevel && level >= this.maxLevel;
    return hasResources && hasTechnologies && !limitExceeded && !this.isQueueBusy();
  }
}

export default AbstractUniqueItem;
