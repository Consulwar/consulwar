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

};