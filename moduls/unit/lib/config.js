initWrecksConfigLib = function() {
'use strict';

if (!Meteor.settings.public.wrecks
 || !Meteor.settings.public.wrecks.priceCoefficient
) {
  throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры статистики (см. settings.sample public.wrecks)');
}

Game.Wrecks.PRICE_COEFFICIENT = Meteor.settings.public.wrecks.priceCoefficient;
};
