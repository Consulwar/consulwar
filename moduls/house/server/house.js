initHouseServer = function() {

initHouseLib();

Game.HouseItems.update = function(data) {
	Game.HouseItems.Collection.update({
		user_id: Meteor.userId()
	}, data);

	return data;
}

Game.HouseItems.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.HouseItems.getValue();

	if (currentValue == undefined) {
		Game.HouseItems.Collection.insert({
			'user_id': user._id
		})
	}
}

Meteor.methods({

	'houseItems.buy': function(group, name) {
		Game.HouseItems.initialize();

		var data = Game.HouseItems.getValue();

		// TODO: check and grab money!
		var itemConfig = Game.HouseItems.getItemConfig(group, name);
		if (!itemConfig) {
			return; // no such item
		}

		if (!data[group]) {
			data[group] = {};
		}

		if (data[group][name]) {
			return; // already bought
		}

		data[group][name] = {
			isPlaced: false
		}

		Game.HouseItems.update(data);
	},

	'houseItems.place': function(group, name) {
		var data = Game.HouseItems.getValue();

		if (!data[group] || !data[group][name]) {
			return; // no such item
		}

		for (var index in data[group]) {
			data[group][index].isPlaced = false;	
		}

		data[group][name].isPlaced = true;
		Game.HouseItems.update(data);
	},

	'houseItems.remove': function(group, name) {
		var data = Game.HouseItems.getValue();

		if (!data[group] || !data[group][name]) {
			return; // no such item
		}

		data[group][name].isPlaced = false;
		Game.HouseItems.update(data);
	}

})

Meteor.publish('houseItems', function () {
	if (this.userId) {
		return Game.HouseItems.Collection.find({
			user_id: this.userId
		})
	}
});

}