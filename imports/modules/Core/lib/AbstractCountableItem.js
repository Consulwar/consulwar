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

  getPrice({ count = 1, cards = [] }) {
    return this.applyPriceEffects({
      price: this.getBasePrice(count),
      cards,
    });
  }

  getRequirements() {
    return this.requirements.map(([id, level]) => (
      [AbstractItem.getObject({ id }), level]
    ));
  }

  canBuild({
    count,
    counts,
    ...options
  }) {
    return super.canBuild({
      value: count,
      values: counts,
      ...options,
    });
  }
}

export default AbstractCountableItem;
