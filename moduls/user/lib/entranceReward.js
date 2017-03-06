initEntranceRewardLib = function() {

Game.EntranceReward = {
	Collection: new Meteor.Collection('entranceRewards'),

	getValue: function() {
		return Game.EntranceReward.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	getNextSeqNum: function () {
		let rewards = Game.EntranceReward.getValue();

		if (rewards) {
			return rewards.history.length;
		}
		else {
			return 0;
		}
	}
};

};