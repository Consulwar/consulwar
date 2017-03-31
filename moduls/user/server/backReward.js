initBackRewardServer = function() {

'use strict';

Game.BackReward = {
	getReward: function() {
		let daysFromUpdate = (Game.getCurrentTime() - Game.Resources.getValue().updated) / (24 * 3600);
		let Cards = Game.Cards.items['backReward'];
		let card;

		for (let key in Cards) {
			if (Cards.hasOwnProperty(key)) {
				let c = Cards[key];
				let fromDay = c.fromDay;
				if ((fromDay <= daysFromUpdate) && (!card || (card.fromDay < fromDay))) {
					card = c;
				}
			}
		}

		if (card) {
			Game.Cards.activate(card, Meteor.user());
		}
	}
};

};