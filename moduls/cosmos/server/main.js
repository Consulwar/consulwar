initCosmosServer = function() {
	initCosmosLib();
	initCosmosContentServer();
	initCosmosConfigServer();
	initCosmosPlanetsServer();
	initCosmosEventsServer();

	Game.Helpers.deepFreeze(Game.Planets.types);
};