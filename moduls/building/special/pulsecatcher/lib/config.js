initBuildingSpecialPulsecatcherConfigLib = function() {
'use strict';

	if (!Meteor.settings.public.building
	 || !Meteor.settings.public.building.special
	 || !Meteor.settings.public.building.special.pulsecatcher
	 || !Meteor.settings.public.building.special.pulsecatcher.schedule
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры импульсного уловителя (см. settings.sample public.building.special.pulsecatcher.schedule)');
	}

	Game.Building.special.Pulsecatcher.UPDATE_SCHEDULE = Meteor.settings.public.building.special.pulsecatcher.schedule;

};