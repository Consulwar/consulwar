import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import AbstractItem from './AbstractItem.js';

let Game;
Meteor.startup(() => {
  // Temporary hack to avoid circular dependency
  // Must be changed to imports after
  // House, Cards, Achievements will be separate modules
  // eslint-disable-next-line global-require
  Game = require('/moduls/game/lib/main.game').default;
});

class AbstractCountableItem extends AbstractItem {
  constructor({
    ...options
  }) {
    super(options);
  }

  getCurrentCount(options) {
    return this.getCount({
      ...options,
      id: this.id,
    });
  }

  getBasePrice(count) {
    return _.mapObject(this.basePrice, value => value * count);
  }

  getPrice(count = 1, cards = []) {
    const basePrice = this.getBasePrice(count);

    const curPrice = {};
    _(basePrice).pairs().forEach(([resourceName, value]) => {
      const idParts = resourceName.split('/');
      let realName = idParts[idParts.length - 1].toLocaleLowerCase();
      if (Game.newToLegacyNames[realName]) {
        realName = Game.newToLegacyNames[realName];
      }
      curPrice[realName] = value;
    });

    const price = this.applyPriceEffects({
      price: curPrice,
      cards,
    });

    return price;
  }

  canBuild(
    count,
    cards,
  ) {
    const hasResources = Game.Resources.has({
      resources: this.getPrice(count, cards),
    });
    const hasTechnologies = this.meetRequirements();
    return hasResources && hasTechnologies && !this.isQueueBusy();
  }
}

export default AbstractCountableItem;
