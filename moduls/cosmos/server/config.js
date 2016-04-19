initCosmosConfigServer = function() {

	if (!Meteor.settings.cosmos
	 || !Meteor.settings.cosmos.enemyRespawnPeriod
	 || !Meteor.settings.cosmos.tradeFleetPeriod
	 || !Meteor.settings.cosmos.attackPlayerPeriod
	 || !Meteor.settings.cosmos.triggerAttackDelay
	 || !Meteor.settings.cosmos.funPeriod
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры космоса (см. settings.sample cosmos)');
	}

	Game.Cosmos.ENEMY_RESPAWN_PERIOD = Meteor.settings.cosmos.enemyRespawnPeriod;
	Game.Cosmos.TRADE_FLEET_PERIOD = Meteor.settings.cosmos.tradeFleetPeriod;
	Game.Cosmos.ATTACK_PLAYER_PERIOD = Meteor.settings.cosmos.attackPlayerPeriod;
	Game.Cosmos.TRIGGER_ATTACK_DELAY = Meteor.settings.cosmos.triggerAttackDelay;
	Game.Cosmos.FUN_PERIOD = Meteor.settings.cosmos.funPeriod;

};