import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import { _ } from 'meteor/underscore';
import collection from './collection';

class Container {
  static getAll({ userId = Meteor.userId() }) {
    return collection.findOne({ userId });
  }

  constructor({
    id,
    title,
    description,
    price,
    drop,
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.drop = drop;
    this.totalChance = this.drop.reduce((total, item) => total + item.chance, 0);

    // New-to-legacy
    const idParts = id.split('/');
    this.name = title;
    this.engName = idParts[idParts.length - 1].toLocaleLowerCase();

    if (this.engName == 'small') {
      this.engName = 'defaultContainer';
    }

    if (this.drop) {
      this._drop = this.drop;
      this.drop = [];
      this._drop.forEach((iDrop) => {
        let profit = { units: { fleet: {} } };
        _(iDrop.profit).keys().forEach((profitId) => {
          const idParts = profitId.split('/');
          let engName = idParts[idParts.length - 1].toLocaleLowerCase();
          profit.units.fleet[engName] = iDrop.profit[profitId];
        });
        this.drop.push({
          chance: iDrop.chance,
          profit,
        });
      });
    }
  }

  getPrice({ count = 1 } = {}) {
    const price = Game.Resources.multiplyResources({
      resources: _.clone(this.price),
      count,
    });

    // TODO: pass userId / cached effects, etc.
    return Game.Effect.Price.applyTo({
      engName: 'containerPrice',
    }, price, true);
  }

  isEnoughResources({ count = 1 } = {}) {
    return Game.Resources.has({
      resources: this.getPrice({ count }),
    });
  }

  getCount({
    userId = Meteor.userId(),
    containers = Container.getAll({ userId }),
  } = {}) {
    return (
         containers
      && containers[this.id]
      && containers[this.id].count
    ) || 0;
  }

  has({ count = 1, ...options } = {}) {
    return this.getCount(options) >= count;
  }

  icon() {
    return `/img/game/${this.id}/icon.png`;
  }

  image() {
    return `/img/game/${this.id}/transparent.jpg`;
  }

  card() {
    return `/img/game/${this.id}/card.jpg`;
  }
}

export default Container;
