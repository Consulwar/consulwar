initEarthConfigServer = function() {

	if (!Meteor.settings.earth
	 || !Meteor.settings.earth.reinforcementsDelay
	 || !Meteor.settings.earth.minActivePlayers
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры боев на земле (см. settings.sample earth)');
	}

	Game.Earth.REINFORCEMENTS_DELAY = Meteor.settings.earth.reinforcementsDelay;
	Game.Earth.MIN_ACTIVE_PLAYERS = Meteor.settings.earth.minActivePlayers;

}