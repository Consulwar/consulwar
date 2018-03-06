import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import PriceEffect from '/imports/modules/Effect/lib/PriceEffect';
import effectClasses from '/imports/modules/Effect/lib';

let Game;
Meteor.startup(() => {
  // Temporary hack to avoid circular dependency
  // Must be changed to imports after
  // House, Cards, Achievements will be separate modules
  // eslint-disable-next-line global-require
  Game = require('/moduls/game/lib/main.game').default;
});


let order = 0;

const items = {};

const addItem = function(item) {
  if (item.id in items) {
    throw new Meteor.Error(
      'Ошибка в контенте',
      `Дублируется сущность ${item.id}`,
    );
  }

  items[item.id] = item;
};

class AbstractItem {
  static getObject({ id }) {
    return items[id];
  }

  constructor({
    id,
    title,
    description,
    effects,
    queue,
    color = 'cw--color_metal',
    doNotRegisterEffects = false,
    notImplemented = false,
    basePrice = {},
    requirements = () => [],
  }) {
    if (new.target === AbstractItem) {
      throw new Meteor.Error('Попытка создания экземпляра абстрактного класса');
    }

    this.order = order;
    order += 1;
    this.effects = [];

    this.id = id;

    this.title = title;
    this.description = description;

    this.queue = queue;

    this.color = color;
    this.doNotRegisterEffects = doNotRegisterEffects;

    this.notImplemented = notImplemented;

    // Building related? Buy related?

    this.basePrice = basePrice;
    this.requirements = requirements;

    this.registerEffects(effects);

    addItem(this);
  }

  registerEffects(effects = {}) {
    _(effects).pairs().forEach(([type, effectList]) => {
      effectList.forEach((effect) => {
        const effectObject = new effectClasses[type](effect);
        this.effects.push(effectObject);

        if (!this.doNotRegisterEffects) {
          effectObject.register(this);
        } else {
          effectObject.setProvider(this);
        }
      });
    });
  }

  isEnoughResources(options) {
    return Game.Resources.has({
      ...options,
      resources: this.getPrice(options),
    });
  }

  getRequirements() {
    return this.requirements().map(([id, level]) => (
      [AbstractItem.getObject({ id }), level]
    ));
  }

  meetRequirements(options = {}) {
    return this.getRequirements(options).every(([item, level]) => (
      item.has({ ...options, level })
    ));
  }

  getQueue() {
    return Game.Queue.getByItemId(this.id);
  }

  isQueueBusy() {
    return Game.Queue.isBusy(this.queue || this.group);
  }

  applyPriceEffects({ price, cards = [] }) {
    let curPrice = price;

    if (!curPrice.time) {
      curPrice.time = Game.Resources.calculateTimeFromResources(curPrice);
    }

    Object.defineProperty(curPrice, 'base', {
      value: _.clone(curPrice),
    });

    curPrice = PriceEffect.applyTo({
      target: this,
      obj: curPrice,
      instantEffects: _(cards.map(card => card.effects)).flatten(),
    });

    _(curPrice).pairs().forEach(([value, name]) => {
      if (name === 'time') {
        if (value < 2) {
          curPrice[name] = 2;
        }
      } else if (value < 0) {
        curPrice[name] = 0;
      }
    });

    return curPrice;
  }
}

export default AbstractItem;
