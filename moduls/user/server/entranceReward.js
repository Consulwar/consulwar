initEntranceRewardServer = function() {

initEntranceRewardLib();

Game.EntranceReward.Collection._ensureIndex({
	user_id: 1
});

Game.EntranceReward.rewards = [];
Game.EntranceReward.defaultRewards = undefined;

game.EntranceReward = function(options) {
	if (options.day === undefined) {
		throw new Meteor.Error('Ошибка в контенте', 'Не указан номер дня награды за вход');
	}

	_.extend(this, options);

	let day = options.day;

	// fill multiple awards if day is array
	if (_.isArray(day)) {
		let from = day[0];
		let to = day[1];
		for (let i = from; i <= to; i++) {
			addReward(i, this);
		}
	} else if (_.isNumber(day)) {
		addReward(day, this);
	}	else {
		Game.EntranceReward.defaultRewards = this.reward;
	}
};

let addReward = function(day, reward) {
	if (Game.EntranceReward.rewards[day] !== undefined) {
		throw new Meteor.Error('Ошибка в контенте', 'Награда за вход с номером дня ' + day + ' уже существует');
	}

	Game.EntranceReward.rewards[day] = reward.reward;
};

initEntranceRewardsContent();

Game.EntranceReward.actualize = function() {
	let user = Meteor.user();

	let currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	// recently registered users do not have lastRewardTime field
	if (!user.lastRewardTime) {
		let createdDate = new Date(user.createdAt);
		createdDate.setHours(0, 0, 0, 0);

		// if registered today skip checking awards
		if (createdDate.getTime() === currentDate.getTime()) {
			return;
		}
	} else {
		let lastRewardDate = new Date(user.lastRewardTime);
		lastRewardDate.setHours(0, 0, 0, 0);

		if (lastRewardDate.getTime() === currentDate.getTime()) {
			return;
		}
	}

	let nextDay = Game.EntranceReward.getNextDay();

	let reward = Game.EntranceReward.rewards[nextDay] || Game.EntranceReward.defaultRewards;

	if (reward === undefined) {
		console.log('User ' + Meteor.userId() + ' got undefined reward value on day =', nextDay);
		return;
	}

	let now = new Date();
	let record = {
		date: now,
		reward: reward
	};

	if (nextDay === 0) {
		Game.EntranceReward.Collection.insert({
			user_id: user._id,
			history: [record],
		});
	} else {
		Game.EntranceReward.Collection.update({
			user_id: user._id
		}, {
			$push: {
				history: record
			}
		});
	}

	Meteor.users.update({
		_id: user._id
	}, {
		$set: {
			lastRewardTime: now
		}
	});
};

};