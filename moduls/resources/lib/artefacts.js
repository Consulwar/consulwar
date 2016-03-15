initArtefactsLib = function() {

game.Artefact = function(options) {
	this.group = options.group;
	this.engName = options.engName;
	this.name = options.name;
	this.description = options.description;

	this.amount = function() {
		var resources = Game.Resources.getValue();
		return (resources && resources[this.engName] && resources[this.engName].amount)
			? resources[this.engName].amount
			: 0;
	}

	Game.Artefacts.items[options.engName] = this;
}

Game.Artefacts = {
	items: {}
}

initArtefactsContent();

}