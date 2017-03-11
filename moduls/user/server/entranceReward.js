initEntranceRewardServer = function() {

initEntranceRewardLib();

Game.EntranceReward.Collection._ensureIndex({
	user_id: 1
});

Game.EntranceReward.getRewardProfit = function() {
	let rewards = Game.EntranceReward.getValue();
	let nextDay = rewards ? rewards.history.length : 0;
	let reward = Game.EntranceReward.rewards[nextDay] || Game.EntranceReward.defaultRewards;

	if (reward.profit.rank !== undefined) {
		let rewards = Game.EntranceReward.rewardRanks[reward.profit.rank].rewards;
		return Game.Resources.rollProfit(rewards);
	}
	else {
		return reward.profit;
	}
};

Game.EntranceReward.actualize = function() {
	let user = Meteor.user();

	let currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	// recently registered users do not have entranceReward field
	if (!user.entranceReward) {
		let createdDate = new Date(user.createdAt);
		createdDate.setHours(0, 0, 0, 0);

		// if registered today skip checking awards
		if (createdDate.getTime() === currentDate.getTime()) {
			return;
		}
	} else {
		let lastRewardDate = new Date(user.entranceReward.givenTime);
		lastRewardDate.setHours(0, 0, 0, 0);

		if (lastRewardDate.getTime() === currentDate.getTime()) {
			return;
		}
	}

	let profit = Game.EntranceReward.getRewardProfit();

	let now = new Date();
	let record = {
		date: now,
		profit: profit
	};

	let rewards = Game.EntranceReward.getValue();

	if (rewards === undefined) {
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
			'entranceReward.givenTime': now
		}
	});
};

Meteor.methods({
	'entranceReward.getHistory': function() {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('entranceReward.getHistory:', new Date(), user.username);

		return Game.EntranceReward.getValue().history;
	},

	'entranceReward.takeReward': function() {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('entranceReward.takeReward:', new Date(), user.username);

		Meteor.users.update({
			_id: user._id
		}, {
			$set: {
				'entranceReward.takenTime': new Date()
			}
		});
	}
});
};