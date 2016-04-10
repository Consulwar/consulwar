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

	if (Game.Artefacts.items[options.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется артефакт ' + options.engName);
	}

	this.url = function(options) {
		options = options || {
			group: 'house',
			subgroup: 'artefacts',
			item: this.engName
		};
		return Router.routes.house.path(options);
	}

	Game.Artefacts.items[options.engName] = this;
}

Game.Artefacts = {
	items: {}
}

initArtefactsContent();

}