import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import allContainers from '/imports/content/Container/Fleet/server';
import LibContainer from '../lib/Container';
import collection from '../lib/collection';

const rollRandomValues = function(drop) {
  const result = {};

  _(drop).pairs().forEach(([key, value]) => {
    if (_.isArray(value)) {
      result[key] = Game.Random.interval(value[0], value[1]);
    } else if (_.isObject(value)) {
      result[key] = rollRandomValues(value);
    } else {
      result[key] = value;
    }
  });

  return result;
};

class Container extends LibContainer {
  static massIncrement({
    containers,
    ...options
  }) {
    _(containers).pairs().forEach(([id, count]) => {
      allContainers[id].increment({ ...options, count });
    });
  }

  increment({
    count = 1,
    invertSign = false,
    multiply = invertSign === true ? -1 : 1,
    userId = Meteor.userId(),
  }) {
    if (count !== 0) {
      collection.upsert({
        userId,
      }, {
        $inc: {
          [`${this.id}.count`]: count * multiply,
        },
      });
    }
  }

  add({ count = 1, ...options }) {
    this.increment({ ...options, count });
  }

  spend({ count = 1, ...options }) {
    this.increment({ ...options, count, invertSign: true });
  }

  getRandomDrop() {
    const rand = Game.Random.random() * this.totalChance;
    let val = 0;
    const winner = this.drop.find((item) => {
      val += item.chance;
      return rand <= val;
    });

    return rollRandomValues(winner.profit);
  }

  buy({ count = 1, ...options }) {
    if (count < 1) {
      throw new Meteor.Error('Ты пытаешься продать контейнер нам?');
    }

    const price = this.getPrice({ ...options, count });
    if (!Game.Resources.has({ ...options, resources: price })) {
      throw new Meteor.Error('Невозможно купить контейнер');
    }

    if (price) {
      Game.Resources.spend(price);

      if (price.credits) {
        Game.Payment.Expense.log(price.credits, 'container', {
          containerId: this.id,
        });
      }
    }

    this.add({ ...options, count });
  }

  open(options) {
    if (!this.has(options)) {
      throw new Meteor.Error('Сперва необходимо преобрести контейнер');
    }

    const profit = this.getRandomDrop();

    Game.Resources.addProfit(profit);

    this.spend(options);

    return profit;
  }

  buyAndOpen({ count = 1, ...options }) {
    if (count < 1) {
      throw new Meteor.Error('Ты пытаешься продать контейнер нам?');
    }

    const price = this.getPrice({ ...options, count });
    if (!Game.Resources.has({ ...options, resources: price })) {
      throw new Meteor.Error('Невозможно купить контейнер');
    }

    Game.Resources.spend(price);

    if (price.credits) {
      Game.Payment.Expense.log(price.credits, 'container', {
        containerId: this.id,
      });
    }

    const profit = this.getRandomDrop();

    Game.Resources.addProfit(profit);

    return profit;
  }
}

export default Container;
