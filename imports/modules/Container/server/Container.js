import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
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
      throw new Meteor.Error('Недостаточно ресурсов для покупки контейнеров');
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
      throw new Meteor.Error('Сперва необходимо приобрести контейнеры');
    }

    const profit = {};

    for (let i = 0; i < options.count; i += 1) {
      _(this.getRandomDrop()).pairs().forEach(([rewardId, rewardCount]) => {
        profit[rewardId] = (profit[rewardId] || 0) + rewardCount;
      });
    }

    Game.Resources.addProfit(profit);

    this.spend(options);

    return profit;
  }
}

export default Container;
