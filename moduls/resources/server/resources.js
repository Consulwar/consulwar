initResourcesServer = function() {

initResourcesLib();
initArtefactsLib();

// Добавляет/вычитает ресурсы текущему пользователю
// invertSign - true если вычитаем ресурсы
Game.Resources.set = function(resource, invertSign, uid) {
	invertSign = invertSign == true ? -1 : 1;

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

		var increment = (resource[name].amount != undefined)
			? resource[name].amount
			: resource[name];

		inc[name + '.amount'] = parseInt(increment * invertSign);

		// set resource bonus seconds
		if (resource[name].bonusSeconds != undefined) {
			if (!set) {
				set = {};
			}

			set[name + '.bonusSeconds'] = resource[name].bonusSeconds;
		}

		// set resource bonus
		if (resource[name].bonus != undefined) {
			if (!set) {
				set = {};
			}

			var income = Game.Resources.getIncome();
			var currentValue = Game.Resources.getValue(uid);
			var currentBonus = (currentValue[name] && currentValue[name].bonus)
				? currentValue[name].bonus
				: 0;

			set[name + '.bonus'] = Math.min(
				currentBonus + resource[name].bonus,
				(income[name] || 0) * Game.Resources.bonusStorage
			);
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
			user_id: uid != undefined ? uid : Meteor.userId()
		}, update);
	}
}

Game.Resources.add = function(resource, uid) {
	return Game.Resources.set(resource, false, uid);
}

Game.Resources.spend = function(resource, uid) {
	return Game.Resources.set(resource, true, uid);
}

Game.Resources.updateWithIncome = function(currentTime) {
	var resources = Game.Resources.getValue();
	if (currentTime < resources.updated - 10) {
		throw new Meteor.Error('Ошибка при рассчете доходов');
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
		credits: Game.Resources.calculateProduction(
			income.credits, 
			delta,
			resources.credits.bonusSeconds
		)
	}

	Game.Resources.add(result);
	return result;
}

Game.Resources.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Resources.getValue();

	if (currentValue == undefined) {
		Game.Resources.Collection.insert({
			'user_id': user._id,
			humans: {amount: 500 * 3},
			metals: {amount: 3000 * 3},
			crystals: {amount: 1500 * 3},
			credits: {amount: 0},
			honor: {amount: 0},
			updated: Math.floor(new Date().valueOf() / 1000)
		})
	}
}

Meteor.methods({
	getBonusResources: function(name) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (name != 'crystals' && name != 'metals') {
			throw new Meteor.Error('А как тебе вариант, что сейчас у тебя обнулится весь рейтинг? ха-ха');
		}

		console.log('getBonusResources: ', new Date(), user.login);

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
		}

		Game.Resources.Collection.update({'user_id': Meteor.userId()}, {$set: set});

		return currentValue[name].bonus;
	}
});


Meteor.publish('resources', function () {
	if (this.userId) {
		return Game.Resources.Collection.find({user_id: this.userId});
	}
});

}