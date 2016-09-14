initPulsecatcherConfigLib = function() {

	if (!Meteor.settings.public.pulsecatcher
	 || !Meteor.settings.public.pulsecatcher.schedule
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры импульсного уловителя (см. settings.sample public.pulsecatcher)');
	}

	Game.Pulsecatcher.UPDATE_SCHEDULE = Meteor.settings.public.pulsecatcher.schedule;

};