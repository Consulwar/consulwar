initArtefactsLib = function() {

game.Artefact = function(options) {
	this.group = options.group;
	this.engName = options.engName;
	this.name = options.name;
	this.description = options.description;

	this.amount = function() {
		return Game.Artefacts.getAmount(this.engName);
	}

	Game.Artefacts.items[options.engName] = this;
}

Game.Artefacts = {
	Collection: new Meteor.Collection('artefacts'),

	getValue: function() {
		return Game.Artefacts.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	getAmount: function(id) {
		var data = Game.Artefacts.getValue();
		return (data && data[id]) ? data[id] : 0;
	},

	items: {}
}

initArtefactsContent();

}