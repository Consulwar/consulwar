initBackRewardServer = function() {

'use strict';

Game.BackReward = {
	getProfit: function() {
		let backTime = Game.getCurrentTime() - Game.Resources.getValue().updated;
		let Rewards = Game.Cards.items['backReward'];
		let reward;

		for (var key in Rewards) {
			let r = Rewards[key];
			let fromDay = r.fromDay * 24 * 3600;
			if ((fromDay <= backTime) && (!reward || (reward.fromDay * 24 * 3600 < fromDay))) {
				reward = r;
			}
		}

		return reward;		
	}
};

Meteor.methods({
	'backReward.takeReward': function() {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		let card = Game.BackReward.getProfit();

		if (card) {
			Game.Cards.activate(card, user)
		}
	}	
});

};