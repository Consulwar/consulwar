initEntranceRewardServer = function() {

initEntranceRewardLib();

Game.EntranceReward.Collection._ensureIndex({
	user_id: 1
});

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
		profit: reward.profit
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

Meteor.publish('entranceRewards', function() {
	if (this.userId) {
		return Game.EntranceReward.Collection.find({
			user_id: this.userId
		}, {
			limit: 1
		});
	} else {
		this.ready();
	}
});

};