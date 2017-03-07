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
			console.log('added', id, fields);
			showEntranceReward(fields);
		}
	},

	changed: function(id, fields) {
		console.log('changed', id, fields);
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

		for (let reward of Game.EntranceReward.rewards) {
			history.push({profit: reward.profit, state: 'possible'});
		}

		let info = {
			history,
			currentReward,
			takenCount: fields.history.length,
			leftCount: Game.EntranceReward.rewards.length - fields.history.length
		};
		Game.Popup.show('entranceReward', info);

		console.log(info);
	}
};

Template.entranceReward.helpers({
	getType: function () {
		let profit = this.profit;
		if (profit.resource) {
			return _.keys(profit.resource)[0];
		} else if (profit.unit) {
			return _.keys(profit.unit.ground)[0] + '-icon';
		}	else {
			return '';
		}
	}
});

};