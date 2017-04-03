initGameConfigLib = function() {
	'use strict';

	if (!Meteor.settings.public.serverStartDate) {
		throw new Meteor.Error('Ошибка в настройках', 'Не задан serverStartDate (см. settings.sample public.serverStartDate)');
	}

	Game.SERVER_START_DATE = new Date(Meteor.settings.public.serverStartDate);
};