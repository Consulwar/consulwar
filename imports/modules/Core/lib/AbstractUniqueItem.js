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

  getRequirements({ itemLevel = this.getCurrentLevel() } = {}) {
    return this.requirements(itemLevel).map(([id, level]) => (
      [AbstractItem.getObject({ id }), level]
    ));
  }

  getCurrentLevel(options) {
    return this.getLevel({
      ...options,
      id: this.id,
    });
  }

  getBasePrice(level) {
    const curPrice = {};

    // Цена идет на подъем ДО указаного уровня с предыдущего
    // т.к. начальный уровень нулевой, то цена для первого уровня
    // является ценой подъема с нулевого до первого
    const toLevel = level ? level - 1 : this.getCurrentLevel();

    let basePrice;
    if (_(this.basePrice).isFunction()) {
      basePrice = this.basePrice(toLevel);
    } else {
      switch (this.basePrice.tier) {
        case 1:
          basePrice = priceT1.call(this, toLevel, this.basePrice.group);
          break;
        case 2:
          basePrice = priceT2.call(this, toLevel, this.basePrice.group);
          break;
        case 3:
          basePrice = priceT3.call(this, toLevel, this.basePrice.group);
          break;
        default:
          basePrice = priceT4.call(this, toLevel, this.basePrice.group);
          break;
      }

      _(basePrice).pairs().forEach(([
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
        curPrice[realName] = Game.functions[funcName].call(
          this,
          toLevel,
          startValue,
          from,
        );
      });
    }

    return curPrice;
  }

  getPrice(level, cards = []) {
    return this.applyPriceEffects({
      price: this.getBasePrice(level),
      cards,
    });
  }

  canBuild(level, cards = []) {
    const hasResources = Game.Resources.has({
      resources: this.getPrice(level, cards),
    });
    const hasTechnologies = this.meetRequirements();
    return hasResources && hasTechnologies && !this.isQueueBusy();
  }
}

export default AbstractUniqueItem;
