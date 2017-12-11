import { Meteor } from 'meteor/meteor';
import PriceEffect from '/imports/modules/Effect/lib/PriceEffect';
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
  }

  getPrice({ count = 1 } = {}) {
    const price = Game.Resources.multiplyResources({
      resources: _.clone(this.price),
      count,
    });

    // For legacy compatibility
    Object.defineProperty(price, 'base', {
      value: _.clone(price),
    });
    //

    // TODO: pass userId / cached effects, etc.
    return PriceEffect.applyTo({
      target: {
        engName: 'containerPrice',
      },
      obj: price,
      hideEffects: true,
    });
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

  getIcon() {
    return `/img/game/${this.id}/icon.png`;
  }

  getImage() {
    return `/img/game/${this.id}/transparent.png`;
  }

  getCard() {
    return `/img/game/${this.id}/card.jpg`;
  }

  // legacy
  icon() {
    return this.getIcon();
  }

  image() {
    return this.getCard();
  }
}

export default Container;
