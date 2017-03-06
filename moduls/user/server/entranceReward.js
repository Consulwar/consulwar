initEntranceRewardServer = function() {

initEntranceRewardLib();

Game.EntranceReward.Collection._ensureIndex({
	user_id: 1
});

Game.EntranceReward.rewards = [];

game.EntranceReward = function(options) {
	if (options.day === undefined) {
		throw new Meteor.Error('Ошибка в контенте', 'Не указан номер дня награды за вход');
	}

	if (Game.EntranceReward.rewards[options.day] !== undefined) {
		throw new Meteor.Error('Ошибка в контенте', 'Награда за вход с номером дня ' + options.day + ' уже существует');
	}

	_.extend(this, options);

	Game.EntranceReward.rewards[this.day] = this;
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

	let nextSeqNum = Game.EntranceReward.getNextSeqNum();

	let reward = Game.EntranceReward.rewards[nextSeqNum];

	if (reward === undefined) {
		return;
	}

	let now = new Date();
	let record = {
		date: now,
		reward: reward.reward
	};

	if (nextSeqNum === 0) {
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