initHouseServer = function() {

initHouseLib();

Game.House.defaultItems = {
	'room': {
		'consul': {
			isPlaced: true
		}
	},
	'tron': {
		'consul': {
			isPlaced: true
		}
	},
	'avatar': {
		'consul': {
			isPlaced: true
		}
	}
}

Game.House.initialize = function(user, isRewrite) {
	user = user || Meteor.user();
	var currentValue = Game.House.getValue();

	if (currentValue == undefined) {
		Game.House.Collection.insert({
			user_id: user._id,
			items: Game.House.defaultItems
		});
	} else if (isRewrite) {
		Game.House.Collection.update({
			user_id: user._id
		}, {
			$set: {
				items: Game.House.defaultItems
			}
		});
	}
}

Game.House.update = function(data) {
	Game.House.Collection.update({
		user_id: Meteor.userId()
	}, data);

	return data;
}

Meteor.methods({
	'house.buyItem': function(group, id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		// check config
		if (!Game.House.items[group] || !Game.House.items[group][id]) {
			throw new Meteor.Error('Нет такого предмета');
		}

		var item = Game.House.items[group][id];

		if (item.isUnique) {
			throw new Meteor.Error('Только всемогущий админ может подарить тебе этот предмет!');
		}

		if (!item.canBuy()) {
			throw new Meteor.Error('Нельзя купить этот предмет');
		}

		// check db
		var house = Game.House.getValue();

		if (!house) {
			throw new Meteor.Error('Требуется инициализация палаты консула');
		}

		if (!house.items) {
			house.items = {};
		}

		if (!house.items[group]) {
			house.items[group] = {};
		}

		if (house.items[group][id]) {
			throw new Meteor.Error('Предмет уже куплен');
		}

		// add item and spend price
		house.items[group][id] = {
			isPlaced: false
		}
		
		Game.Resources.spend(item.getPrice());
		Game.House.update(house);
	},

	'house.placeItem': function(group, id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		var house = Game.House.getValue();

		if (!house) {
			throw new Meteor.Error('Требуется инициализация палаты консула');
		}

		if (!house.items || !house.items[group] || !house.items[group][id]) {
			throw new Meteor.Error('У тебя нет такого предмета');
		}

		for (var key in house.items[group]) {
			house.items[group][key].isPlaced = false;	
		}

		house.items[group][id].isPlaced = true;
		Game.House.update(house);
	}
})

Meteor.publish('houseItems', function () {
	if (this.userId) {
		return Game.House.Collection.find({
			user_id: this.userId
		});
	}
});

}