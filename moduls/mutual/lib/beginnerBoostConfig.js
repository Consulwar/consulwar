initBeginnerBoostConfigLib = function() {
  'use strict';

  const beginnersBoost = Meteor.settings.public.beginnersBoost;

  if (!beginnersBoost
    || !beginnersBoost.powerUnit
    || !beginnersBoost.powerUnit.metals
    || !beginnersBoost.powerUnit.crystals
    || !beginnersBoost.powerUnit.honor
    || !beginnersBoost.powerUnit.time

  ) {
    throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры буста новичков (см. settings.sample public.beginnersBoost)');
  }

  Game.BeginnerBoost.POWER_UNIT = beginnersBoost.powerUnit;
};