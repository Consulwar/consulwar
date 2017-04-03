initEarthConfigLib = function() {
	'use strict';

	if (!Meteor.settings.public.earth
	 || !Meteor.settings.public.earth.schedule
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры боев на земле (см. settings.sample public.earth)');
	}

	Game.Earth.UPDATE_SCHEDULE = Meteor.settings.public.earth.schedule;

};