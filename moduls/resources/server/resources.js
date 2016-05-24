initResourcesServer = function() {

initResourcesLib();
initArtefactsLib();

Game.Resources.Collection._ensureIndex({
	user_id: 1
});

// Добавляет/вычитает ресурсы текущему пользователю
// invertSign - true если вычитаем ресурсы
Game.Resources.set = function(resource, invertSign, uid) {
	invertSign = invertSign === true ? -1 : 1;

	var inc = null;
	var set = null;

	for (var name in resource) {
		if (name == 'time') {
			continue;
		}

		// increment resource
		if (!inc) {
			inc = {};
		}

		var increment = (resource[name].amount !== undefined)
			? resource[name].amount
			: resource[name];

		if (isNaN(increment)) {
			increment = 0;
		}

		inc[name + '.amount'] = parseInt(increment * invertSign);

		// set resource bonus seconds
		if (resource[name].bonusSeconds !== undefined) {
			if (!set) {
				set = {};
			}

			set[name + '.bonusSeconds'] = resource[name].bonusSeconds;
		}

		// set resource bonus
		if (resource[name].totalBonus !== undefined) {
			if (!set) {
				set = {};
			}

			set[name + '.bonus'] = resource[name].totalBonus;
		}
	}

	var update = null;
	
	if (inc || set) {
		update = {};
		if (set) {
			update.$set = set;
		}
		if (inc) {
			update.$inc = inc;
		}
	}

	if (update) {
		Game.Resources.Collection.update({
			user_id: uid !== undefined ? uid : Meteor.userId()
		}, update);
	}
};

Game.Resources.add = function(resource, uid) {
	Game.Resources.set(resource, false, uid);
	saveStatistic('resources.gained', resource, uid);
};

Game.Resources.spend = function(resource, uid) {
	Game.Resources.set(resource, true, uid);
	saveStatistic('resources.spent', resource, uid);
};

Game.Resources.steal = function(resource, uid) {
	Game.Resources.set(resource, true, uid);
	saveStatistic('resources.stolen', resource, uid);
};

var saveStatistic = function(field, resources, uid) {
	var increment = {};
	increment[field + '.total'] = 0;

	for (var key in resources) {
		if (key == 'time') {
			continue;
		}

		var amount = (resources[key].amount !== undefined)
			? parseInt( resources[key].amount )
			: parseInt( resources[key] );

		increment[field + '.' + key] = amount;
		increment[field + '.total'] += amount;
	}
	
	if (increment[field + '.total'] > 0) {
		Game.Statistic.incrementUser(uid !== undefined ? uid : Meteor.userId(), increment);
	}
};

var rollRandomValues = function(object) {
	for (var key in object) {
		if (_.isArray(object[key])) {
			object[key] = Game.Random.interval( object[key][0], object[key][1] );
		} else if (_.isObject(object[key])) {
			object[key] = rollRandomValues(object[key]);
		}
	}
	return object;
};

Game.Resources.rollProfit = function(drop) {
	var max = 0;
	var i = 0;
	for (i = 0; i < drop.length; i++) {
		max += drop[i].chance;
	}

	var rand = Game.Random.random() * max;
	var val = 0;

	for (i = 0; i < drop.length; i++) {
		val += drop[i].chance;
		if (rand <= val) {
			break;
		}
	}

	return rollRandomValues( drop[i].profit );
};

Game.Resources.addProfit = function(profit, uid) {
	if (profit.resources) {
		Game.Resources.add(profit.resources, uid);
	}

	if (profit.units) {
		var units = profit.units;
		for (var group in units) {
			for (var name in units[group]) {
				Game.Unit.add({
					engName: name,
					group: group,
					count: parseInt( units[group][name], 10 )
				}, uid);
			}
		}
	}

	if (profit.votePower) {
		Meteor.users.update({
			_id: uid !== undefined ? uid : Meteor.userId()
		}, {
			$inc: { votePowerBonus: profit.votePower }
		});
	}

	if (profit.cards) {
		Game.Cards.add(profit.cards);
	}

	if (profit.houseItems) {
		for (var itemGroup in profit.houseItems) {
			for (var itemName in profit.houseItems[itemGroup]) {
				Game.House.add(itemGroup, itemName);
			}
		}
	}
};

Game.Resources.updateWithIncome = function(currentTime) {
	var resources = Game.Resources.getValue();

	if (currentTime < resources.updated - 10) {
		throw new Meteor.Error('Ошибка при рассчете доходов', 'Подождите 5 минут');
	}

	var delta = currentTime - resources.updated;
	if (delta < 1) {
		return true;
	}

	var income = Game.Resources.getIncome();

	Game.Resources.Collection.update({
		user_id: Meteor.userId()
	}, {
		$set: {
			updated: currentTime
		}
	});

	// fix values if NaN
	var fixedSet = {};

	if (isNaN(resources.humans.amount)) {
		fixedSet['humans.amount'] = 0;
	}
	if (isNaN(resources.metals.amount)) {
		fixedSet['metals.amount'] = 0;
	}
	if (isNaN(resources.crystals.amount)) {
		fixedSet['crystals.amount'] = 0;
	}
	if (isNaN(resources.honor.amount)) {
		fixedSet['honor.amount'] = 0;
	}
	if (isNaN(resources.credits.amount)) {
		fixedSet['credits.amount'] = 0;
	}

	if (_.keys(fixedSet).length > 0) {
		console.log('User ' + Meteor.userId() + ' got NaN resource value!', _.keys(fixedSet));
		Game.Resources.Collection.update({
			user_id: Meteor.userId()
		}, {
			$set: fixedSet
		});
	}

	// calculate income
	var result = {
		humans: Game.Resources.calculateProduction(
			income.humans, 
			delta,
			resources.humans.bonusSeconds
		),
		crystals: Game.Resources.calculateProduction(
			income.crystals, 
			delta,
			resources.crystals.bonusSeconds,
			true
		),
		metals: Game.Resources.calculateProduction(
			income.metals, 
			delta,
			resources.metals.bonusSeconds,
			true
		),
		honor: Game.Resources.calculateProduction(
			income.honor, 
			delta,
			resources.honor.bonusSeconds
		),
		credits: Game.Resources.calculateProduction(
			income.credits, 
			delta,
			resources.credits.bonusSeconds
		)
	};

	for (var name in result) {
		// set resource bonus
		if (result[name].bonus !== undefined) {
			var currentBonus = (resources[name] && resources[name].bonus)
				? resources[name].bonus
				: 0;

			result[name].totalBonus = Math.min(
				currentBonus + result[name].bonus,
				(income[name] || 0) * Game.Resources.bonusStorage
			);
		}
	}

	Game.Resources.add(result);
	return result;
};

Game.Resources.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Resources.getValue();

	if (currentValue === undefined) {
		Game.Resources.Collection.insert({
			'user_id': user._id,
			humans: {amount: 5000},
			metals: {amount: 20000},
			crystals: {amount: 15000},
			credits: {amount: 0},
			honor: {amount: 0},
			updated: Game.getCurrentTime()
		});
	}
};

Meteor.methods({
	getBonusResources: function(name) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (name != 'crystals' && name != 'metals') {
			throw new Meteor.Error('А как тебе вариант, что сейчас у тебя обнулится весь рейтинг? ха-ха');
		}

		console.log('getBonusResources: ', new Date(), user.username);

		Meteor.call('actualizeGameInfo');

		var currentValue = Game.Resources.getValue();
		var income = Game.Resources.getIncome();

		if (currentValue[name].bonus < Math.floor(income[name] / 4)) {
			throw new Meteor.Error('Слишком мало накопилось… подкопите ещё');
		}

		var set = {};
		set[name] = {
			amount: (currentValue[name].amount || 0) + currentValue[name].bonus,
			bonus: 0
		};

		Game.Resources.Collection.update({'user_id': Meteor.userId()}, {$set: set});

		return currentValue[name].bonus;
	}
});

Meteor.publish('resources', function () {
	if (this.userId) {
		return Game.Resources.Collection.find({user_id: this.userId});
	}
});

};