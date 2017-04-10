initBackRewardServer = function() {

'use strict';

Game.BackReward = {
	getReward: function() {
		let daysFromUpdate = (Game.getCurrentTime() - Game.Resources.getValue().updated) / (24 * 3600);

		if (daysFromUpdate < Game.BackRewardCard.MIN_REWARD_DAY) {
			return false;
		}

		let cards = Game.Cards.items['backReward'];
		let applicableCard;

		for (let key in cards) {
			if (cards.hasOwnProperty(key)) {
				let card = cards[key];
				if ((card.fromDay <= daysFromUpdate) && (!applicableCard || (applicableCard.fromDay < card.fromDay))) {
					applicableCard = card;
				}
			}
		}
		Game.Cards.activate(applicableCard, Meteor.user());

		return applicableCard;
	}
};

};