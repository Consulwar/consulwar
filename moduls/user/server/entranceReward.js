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
		return getRandomProfit(rewards);
	}
	else {
		return reward.profit;
	}
};

let getRandomProfit = function (rewards) {
	let profits = [];
	let allCount = 0;
	let count = 0;
	for (let profit of rewards) {
		let type = _.keys(profit)[0];
		switch (type) {
			case 'resources':
				let resName = _.keys(profit[type])[0];
				count = profit[type][resName];
				break;

			case 'units':
				let unitGroup = _.keys(profit[type])[0];
				let unitName = _.keys(profit[type][unitGroup])[0];
				count = profit[type][unitGroup][unitName];
				break;

			case 'cards':
				let cardId = _.keys(profit[type])[0];
				count = profit[type][cardId];
				break;

			case 'houseItems':
				let houseItemGroup = _.keys(profit[type])[0];
				let houseItemName = _.keys(profit[type][houseItemGroup])[0];
				count = profit[type][houseItemGroup][houseItemName];
				break;

			case 'containers':
				let containerId = _.keys(profit[type])[0];
				count = profit[type][containerId];
				break;
		}

		profits.push({profit, count});
		allCount += count;
	}

	let rand = Game.Random.interval(0, allCount);

	count = 0;
	for (let row of profits) {
		count += row.count;
		if (rand <= count) {
			return row.profit;
		}
	}
};

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