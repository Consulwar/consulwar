initStatisticConfigLib = function() {
  'use strict';

  if (!Meteor.settings.public.statistic
   || !Meteor.settings.public.statistic.countPerPage
  ) {
    throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры статистики (см. settings.sample public.statistics)');
  }

  Game.Statistic.COUNT_PER_PAGE = Meteor.settings.public.statistic.countPerPage;

};