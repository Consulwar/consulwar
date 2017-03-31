initBackRewardServer = function() {

'use strict';

Game.BackReward = {
	getReward: function() {
		let backTime = Game.getCurrentTime() - Game.Resources.getValue().updated;
		let Cards = Game.Cards.items['backReward'];
		let card;

		for (var key in Cards) {
			if (Cards.hasOwnProperty(key)) {
				let c = Cards[key];
				let fromDay = c.fromDay * 24 * 3600;
				if ((fromDay <= backTime) && (!card || (card.fromDay * 24 * 3600 < fromDay))) {
					card = c;
				}
			}
		}

		if (card) {
			Game.Cards.activate(card, user)
		}
	}
};

};