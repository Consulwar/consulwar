initEntranceRewardClient = function () {

initEntranceRewardLib();

// let initializing = true;
//todo replace
let initializing = false;

Meteor.subscribe('entranceRewards', function () {
	initializing = false;
});

Game.EntranceReward.Collection.find({}).observeChanges({
	added: function(id, fields) {
		if (!initializing) {
			showEntranceReward(fields);
		}
	},

	changed: function(id, fields) {
		showEntranceReward(fields);
	}
});

let showEntranceReward = function (fields) {
	if (fields && fields.history) {
		let history = [];
		for (let reward of fields.history) {
			history.push({profit: reward.profit, state: 'taken'});
		}

		let currentReward = history[history.length - 1];
		currentReward.state = 'current';

		for (let i = history.length; i < Game.EntranceReward.rewards.length; i++) {
			let reward = Game.EntranceReward.rewards[i];
			history.push({profit: reward.profit, state: 'possible'});
		}

		let info = {
			takenCount: fields.history.length,
			leftCount: Game.EntranceReward.rewards.length - fields.history.length,
			history,
			currentReward,
			ranks: Game.EntranceReward.rewardRanks
		};
		Game.Popup.show('entranceReward', info);

		console.log(info); //todo remove
	}
};

Template.entranceReward.helpers({
	getType: function() {
		let profit = this.profit;
		let type = _.keys(profit)[0];
		let res = profit[type];

		switch (type) {
			case 'resources':
				return _.keys(res)[0];

			case 'units':
				let unitType = _.keys(res)[0];
				return _.keys(res[unitType])[0] + '-icon';

			case 'cards':
				return _.keys(res)[0];

			case 'houseItems':
				let houseType = _.keys(res)[0];
				return _.keys(res[houseType])[0];

			case 'containers':
				return _.keys(res)[0];

			case 'rank':
				return 'rank-' + profit.rank;

			default:
				return '';
		}
	},

	getAmount: function () {
		let profit = this.profit;
		let type = _.keys(profit)[0];
		let res = profit[type];
		let secondType = _.keys(res)[0];
		if (typeof res[secondType] === 'object') {
			let thirdType = _.keys(res[secondType])[0];
			return res[secondType][thirdType];
		} else {
			if (type === 'rank') {
				return '';
			} else {
				return res[secondType];
			}
		}
	},
});

Template.entranceReward.events({
	'click .take': function(e, t) {
		Blaze.remove(t.view);
	},
	'click .close': function() {
		Notifications.success('Награда за день получена.');
	}
});


};