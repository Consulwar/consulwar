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

Game.Artefacts.increment = function(increment) {
	if (increment && _.keys(increment).length > 0) {
		Game.Artefacts.initialize();
		Game.Artefacts.Collection.update({
			user_id: Meteor.userId()
		}, {
			$inc: increment
		});
	}
}

Game.Artefacts.add = function(artefacts) {
	var increment = {};

	for (var key in artefacts) {
		if (!Game.Artefacts.items[key]) {
			throw new Meteor.Error('Артефакт ' + key + ' не существует.');
		}

		increment[key] = artefacts[key];
	}

	Game.Artefacts.increment(increment);
}

Game.Artefacts.remove = function(artefacts) {
	var increment = {};

	for (var key in artefacts) {
		if (!Game.Artefacts.items[key]) {
			throw new Meteor.Error('Артефакт ' + key + ' не существует.');
		}

		var amount = artefacts[key];
		var current = Game.Artefacts.getAmount(key);
		if (current - amount < 0) {
			amount = current;
		}

		increment[key] = amount * -1;
	}

	Game.Artefacts.increment(increment);
}

Meteor.publish('artefacts', function () {
	if (this.userId) {
		return Game.Artefacts.Collection.find({
			user_id: this.userId
		})
	}
});

}