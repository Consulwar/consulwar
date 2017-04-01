initBackRewardServer = function() {

'use strict';

Game.BackReward = {
	getReward: function() {
		let daysFromUpdate = (currentTime - Game.Resources.getValue().updated) / (24 * 3600);
		let cards = Game.Cards.items['backReward'];
		let applicableCard;

		if (daysFromUpdate > Game.BackRewardCard.DAYS_BETWEEN_CHECK) {
			for (let key in cards) {
				if (cards.hasOwnProperty(key)) {
					let card = cards[key];
					if ((card.fromDay <= daysFromUpdate) && (!applicableCard || (applicableCard.fromDay < card.fromDay))) {
						applicableCard = card;
					}
				}
			}
		}

		if (applicableCard) {
			Game.Cards.activate(applicableCard, Meteor.user());
		}
	}
};

};