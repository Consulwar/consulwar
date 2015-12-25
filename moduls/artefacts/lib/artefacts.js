initArtefactsLib = function() {

game.Artefact = function(options) {
	Game.Artefacts.items.push(options);
}

Game.Artefacts = {

	getRandom: function() {
		var iRand = Math.floor( Math.random() * Game.Artefacts.items.length );
		return Game.Artefacts.items[iRand];
	},

	items: []

}

initArtefactsContent();

}