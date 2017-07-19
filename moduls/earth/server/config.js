initEarthConfigServer = function() {
	'use strict';

	if (!Meteor.settings.earth
	 || !Meteor.settings.earth.reinforcementsDelay
	 || !Meteor.settings.earth.minActivePlayers
	 || !Meteor.settings.earth.spawnCoefficient
	 || !Meteor.settings.earth.damageReduction
	 || !Meteor.settings.earth.spawn
	 || !Meteor.settings.earth.generating
	 || !Meteor.settings.earth.generating.hexSize
	 || !Meteor.settings.earth.generating.hexUnits
	 || !Meteor.settings.earth.generating.minAreaMerge
	 || !Meteor.settings.earth.generating.autoLinkList
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры боев на земле (см. settings.sample earth)');
	}

	Game.Earth.REINFORCEMENTS_DELAY = Meteor.settings.earth.reinforcementsDelay;
	Game.Earth.MIN_ACTIVE_PLAYERS = Meteor.settings.earth.minActivePlayers;
	Game.Earth.SPAWN_COEFFICIENT = Meteor.settings.earth.spawnCoefficient;
	Game.Earth.DAMAGE_REDUCTION = Meteor.settings.earth.damageReduction;
	Game.Earth.SPAWN = Meteor.settings.earth.spawn;

	Game.Earth.GENERATING = Meteor.settings.earth.generating;
};