initArtefactsLib = function() {

game.Artefact = function(options) {
	Game.Artefacts.items.push(options);
}

Game.Artefacts = {

	getRandom: function() {
		var iRand = Game.Random.interval(0, Game.Artefacts.items.length - 1);
		return Game.Artefacts.items[iRand];
	},

	items: []

}

initArtefactsContent();

}