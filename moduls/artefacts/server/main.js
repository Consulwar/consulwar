initArtefactsServer = function() {

initArtefactsLib();

Game.Artefacts.initialize = function(user) {
	user = user || Meteor.user();
	var data = Game.Artefacts.getValue();

	if (data == undefined) {
		Game.Artefacts.Collection.insert({
			user_id: user._id
		});
	}
}

Game.Artefacts.increment = function(id, amount) {
	Game.Artefacts.initialize();

	if (!Game.Artefacts.items[id]) {
		throw new Meteor.Error('Артефакт ' + id + ' не существует.');
	}

	var increment = {};
	increment[id] = amount;

	Game.Artefacts.Collection.update({
		user_id: Meteor.userId()
	}, {
		$inc: increment
	});
}

Game.Artefacts.add = function(id, amount) {
	Game.Artefacts.increment(id, amount);
}

Game.Artefacts.remove = function(id, amount) {
	var current = Game.Artefacts.getAmount(id);
	if (current - amount < 0) {
		amount = current;
	}

	Game.Artefacts.increment(id, amount * -1);
}

Meteor.publish('artefacts', function () {
	if (this.userId) {
		return Game.Artefacts.Collection.find({
			user_id: this.userId
		})
	}
});

}