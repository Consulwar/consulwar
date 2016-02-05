initCosmosConfigServer = function() {

	if (!Meteor.settings.cosmos
	 || !Meteor.settings.cosmos.enemyRespawnPeriod
	 || !Meteor.settings.cosmos.attackPlayerPeriod
	 || !Meteor.settings.cosmos.collectArtefactsPeriod
	) {
		throw new Meteor.Error('Заполни параметры космоса (см. settings.sample cosmos)');
	}

	Game.Cosmos.ENEMY_RESPAWN_PERIOD = Meteor.settings.cosmos.enemyRespawnPeriod;
	Game.Cosmos.ATTACK_PLAYER_PERIOD = Meteor.settings.cosmos.attackPlayerPeriod;
	Game.Cosmos.COLLECT_ARTEFACTS_PERIOD = Meteor.settings.cosmos.collectArtefactsPeriod;

}