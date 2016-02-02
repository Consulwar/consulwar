initArtefactsLib = function() {

game.Artefact = function(options) {
	Game.Artefacts.items[options.engName] = options;
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