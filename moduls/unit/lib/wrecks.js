import { Meteor } from 'meteor/meteor';

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
};
};
