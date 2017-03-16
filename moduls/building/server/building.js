initBuildingServer = function() {

initBuildingLib();

Game.Building.Collection._ensureIndex({
	user_id: 1
});

Game.Building.add = function(building) {
	Game.Building.initialize();

	var set = {};
	set[building.group + '.' + building.engName] = building.level;

	Game.Building.Collection.update({
		user_id: Meteor.userId()
	}, {
		$set: set
	});

	return set;
};

Game.Building.complete = function(task) {
	addBonus(task);
	Game.Building.add(task);

	Game.Statistic.incrementUser(Meteor.userId(), {
		'building.total': 1
	});
};

Game.Building.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Building.getValue();

	if (currentValue === undefined) {
		Game.Building.Collection.insert({
			'user_id': user._id
		});
	}
};

var addBonus = function(building) {
	var profit = null;
	var effects = Game.Building.items[building.group][building.engName].effect;

	// message text
	var text = 'За постройку здания '
	         + Game.Building.items[building.group][building.engName].name
	         + ' (' + building.level + ') '
	         + 'получен единоразовый бонус:';

	// reduce all profit in one object
	for (var i = 0; i < effects.length; i++) {
		if (effects[i].type != 'profitOnce') {
			continue;
		}

		var value = effects[i].result(building.level);
		if (value <= 0) {
			continue;
		}

		// message text
		text += '\n' + value + effects[i].aftertext;

		if (!profit) {
			profit = {};
		}

		var keys = effects[i].affect.split('.');
		var curObj = profit;

		for (var j = 0; j < keys.length; j++) {
			if (!curObj[keys[j]]) {
				curObj[keys[j]] = {};
			}
			if (j == keys.length - 1) {
				curObj[keys[j]] = value;
			} else {
				curObj = curObj[keys[j]];
			}
		}
	}

	// add profit
	if (profit) {
		Game.Resources.addProfit(profit);
		game.Mail.addSystemMessage('profitOnce', 'Единоразовый бонус', text, building.finishTime);
	}
};

Meteor.publish('buildings', function () {
	if (this.userId) {
		return Game.Building.Collection.find({user_id: this.userId});
	}
});

initBuildingServerMethods();
initBuildingSpecialMarketServer();
initBuildingSpecialColosseumServer();
initBuildingSpecialContainerServer();
initBuildingSpecialPulsecatcherServer();

Game.Helpers.deepFreeze(Game.Building.special);
};