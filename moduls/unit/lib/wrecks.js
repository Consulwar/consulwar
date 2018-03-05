import { Meteor } from 'meteor/meteor';
import PriceEffect from '/imports/modules/Effect/lib/PriceEffect';

initWrecksLib = function() {
'use strict';

Game.Wrecks = {
  Collection: new Meteor.Collection('unitsWrecks'),

  decay(unit, delta, uncountedSeconds = 0) {
    const seconds = delta + uncountedSeconds;

    // Количество секунд необходимых для разложения одного юнита
    const secondsForOne = unit.decayTime || unit.basePrice.time;
    // TODO: add effect(s) on decayTime

    // Общее количество разложившихся юнитов
    const count = Math.floor(seconds / secondsForOne);

    // Количество использованных секунд (округление в большу сторону)
    let usedSeconds = Math.ceil(count * secondsForOne);
    if (Meteor.isClient) {
      usedSeconds = count * secondsForOne;
    }

    // Количетсво неиспользованных секунд
    const secondsLeft = seconds - usedSeconds;

    return {
      count,
      bonusSeconds: secondsLeft,
    };
  },

  getPrice(unit, count) {
    let price = Game.Resources.multiplyResources({
      resources: _.clone(unit.getBasePrice(count)),
      count: Game.Wrecks.PRICE_COEFFICIENT,
    });

    delete price.time;

    Object.defineProperty(price, 'base', {
      value: _.clone(price),
    });

    price = PriceEffect.applyTo({
      target: { engName: 'Repair' },
      obj: price,
    });

    return price;
  },
};

initWrecksConfigLib();
};
