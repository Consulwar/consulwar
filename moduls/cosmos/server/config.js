initCosmosConfigServer = function() {

	if (!Meteor.settings.cosmos
	 || !Meteor.settings.cosmos.enemyRespawnPeriod
	 || !Meteor.settings.cosmos.attackPlayerPeriod
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры космоса (см. settings.sample cosmos)');
	}

	Game.Cosmos.ENEMY_RESPAWN_PERIOD = Meteor.settings.cosmos.enemyRespawnPeriod;
	Game.Cosmos.ATTACK_PLAYER_PERIOD = Meteor.settings.cosmos.attackPlayerPeriod;

};