initResourcesServer = function() {

initResourcesLib();
initArtefactsLib();
initCardsLib();

Game.Resources.Collection._ensureIndex({
	user_id: 1
});

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
		if (resource[name].totalBonus != undefined) {
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

Game.Resources.addProfit = function(profit) {
	if (profit.resources) {
		Game.Resources.add(profit.resources);
	}

	if (profit.units) {
		var units = profit.units;
		for (var group in units) {
			for (var name in units[group]) {
				Game.Unit.add({
					engName: name,
					group: group,
					count: parseInt( units[group][name], 10 )
				});
			}
		}
	}

	if (profit.votePower && Meteor.userId()) {
		Meteor.users.update({
			_id: Meteor.userId()
		}, {
			$inc: { votePowerBonus: profit.votePower }
		});
	}
}

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
	}

	for (var name in result) {
		// set resource bonus
		if (result[name].bonus != undefined) {
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
			updated: Game.getCurrentTime()
		})
	}
}

Game.Cards.complete = function(task) {
	// no action on complete
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
		}

		Game.Resources.Collection.update({'user_id': Meteor.userId()}, {$set: set});

		return currentValue[name].bonus;
	},

	'cards.buy': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		if (!Game.Cards.items[id]) {
			throw new Meteor.Error('Нет такой карточки');
		}

		var item = Game.Cards.items[id];

		Meteor.call('actualizeGameInfo');

		if (!item.canBuy()) {
			throw new Meteor.Error('Нельзя купить эту карточку');
		}
		
		// spend price
		Game.Resources.spend(item.getPrice());

		// add card
		var cardResource = {};
		cardResource[id] = 1;
		Game.Resources.add(cardResource);
	},

	'cards.activate': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}
		
		if (!Game.Cards.items[id]) {
			throw new Meteor.Error('Нет такой карточки');
		}

		Meteor.call('actualizeGameInfo');

		var item = Game.Cards.items[id];

		if (item.amount() <= 0) {
			throw new Meteor.Error('Карточки заночились');
		}

		// check reload time
		if (item.reloadTime) {
			var nextReloadTime = item.nextReloadTime();
			if (nextReloadTime > Game.getCurrentTime()) {
				throw new Meteor.Error('Не прошло время перезарядки');
			}

			// set next reload time
			var set = {};
			set[item.engName + '.nextReloadTime'] = Game.getCurrentTime() + item.durationTime + item.reloadTime;

			Game.Resources.Collection.update({
				user_id: user._id
			}, {
				$set: set
			})
		}

		var task = {
			type: item.type,
			engName: item.engName,
			time: item.durationTime
		}

		if (item.cardGroup) {
			task.group = item.cardGroup;
		}

		// activate card
		if (!Game.Queue.add(task)) {
			throw new Meteor.Error('Эту карточку нельзя активировать сейчас')
		}

		// spend card
		var cardResource = {};
		cardResource[id] = 1;
		Game.Resources.spend(cardResource);
	}
});


Meteor.publish('resources', function () {
	if (this.userId) {
		return Game.Resources.Collection.find({user_id: this.userId});
	}
});

}