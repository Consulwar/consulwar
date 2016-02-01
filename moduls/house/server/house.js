initHouseServer = function() {

initHouseLib();

Game.House.update = function(data) {
	Game.House.Collection.update({
		user_id: Meteor.userId()
	}, data);

	return data;
}

Game.House.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.House.getValue();

	if (currentValue == undefined) {
		Game.House.Collection.insert({
			'user_id': user._id,
			'tron': {
				'consul': {
					isPlaced: true
				}
			}
		})
	}
}

Meteor.methods({
	'house.buyItem': function(group, id) {
		var data = Game.House.getValue();

		var item = Game.House.items[group].types[id];
		if (!item) {
			throw new Meteor.Error('Нет такого предмета');
		}

		if (data[group][id]) {
			throw new Meteor.Error('Предмет уже куплен');
		}

		if (!data[group]) {
			data[group] = {};
		}

		data[group][id] = {
			isPlaced: false
		}

		// TODO: Check and grab money!

		Game.House.update(data);
	},

	'house.placeItem': function(group, id) {
		var data = Game.House.getValue();

		if (!data[group] || !data[group][id]) {
			throw new Meteor.Error('Нет такого предмета');
		}

		for (var key in data[group]) {
			data[group][key].isPlaced = false;	
		}

		data[group][id].isPlaced = true;
		Game.House.update(data);
	}
})

Meteor.publish('houseItems', function () {
	if (this.userId) {
		return Game.House.Collection.find({
			user_id: this.userId
		})
	}
});

}