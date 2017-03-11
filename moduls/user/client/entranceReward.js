initEntranceRewardClient = function () {

initEntranceRewardLib();

Game.EntranceReward.showPopup = function (history) {
	let showHistory = [];
	for (let reward of history) {
		showHistory.push({profit: reward.profit, state: 'taken'});
	}

	let currentReward = showHistory[showHistory.length - 1];
	currentReward.state = 'current';

	let leftUniqueCount = 0;

	for (let i = showHistory.length; i < Game.EntranceReward.rewards.length; i++) {
		let reward = Game.EntranceReward.rewards[i];
		showHistory.push({profit: reward.profit, state: 'possible'});

		if (reward.profit.rank === undefined) {
			leftUniqueCount++;
		}
	}

	let info = {
		takenCount: history.length,
		leftUniqueCount: leftUniqueCount,
		history: showHistory,
		currentReward,
		ranks: Game.EntranceReward.rewardRanks
	};

	this.subtemplate = Game.Popup.show('entranceReward', info);
};

Game.EntranceReward.closePopup = function() {
	if (this.subtemplate) {
		Blaze.remove(this.subtemplate);
		this.subtemplate = null;
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
		Game.EntranceReward.closePopup();
		Meteor.call('entranceReward.takeReward');
	},
	'click .close': function() {
		this.subtemplate = null;
		Notifications.success('Награда за день получена.');
		Meteor.call('entranceReward.takeReward');
	}
});


};