initCosmosConfigLib = function() {
	'use strict';

	if (!Meteor.settings.public.cosmos
	 || !Meteor.settings.public.cosmos.speedConfig
	 || !Meteor.settings.public.cosmos.minSpeed
	 || !Meteor.settings.public.cosmos.maxSpeed
	 || !Meteor.settings.public.cosmos.minAcc
	 || !Meteor.settings.public.cosmos.maxAcc
	 || !Meteor.settings.public.cosmos.speedFactor
	 || !Meteor.settings.public.cosmos.collectArtefactsPeriod
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры космоса (см. settings.sample public.cosmos)');
	}

	var speedFactor = Meteor.settings.public.cosmos.speedFactor;

	Game.Cosmos.SPEED_CONFIG = Meteor.settings.public.cosmos.speedConfig;
	Game.Cosmos.MIN_SPEED = Meteor.settings.public.cosmos.minSpeed * speedFactor;
	Game.Cosmos.MAX_SPEED = Meteor.settings.public.cosmos.maxSpeed * speedFactor;
	Game.Cosmos.MIN_ACC = Meteor.settings.public.cosmos.minAcc * Math.pow(speedFactor, 2);
	Game.Cosmos.MAX_ACC = Meteor.settings.public.cosmos.maxAcc * Math.pow(speedFactor, 2);

	Game.Cosmos.COLLECT_ARTEFACTS_PERIOD = Meteor.settings.public.cosmos.collectArtefactsPeriod;

};