initBackRewardServer = function() {

'use strict';

Game.BackReward = {
	checkedTimestamps: {

	},
	getReward: function() {
		let user = Meteor.user();

		if (!lastCheck || 
			((currentTime - lastCheck) > Game.BackRewardCard.SECONDS_BETWEEN_CHECK)
		) {
			let daysFromUpdate = (currentTime - Game.Resources.getValue().updated) / (24 * 3600);
			let cards = Game.Cards.items['backReward'];
			let applicableCard;

			if (daysFromUpdate > Game.BackRewardCard.DAYS_BETWEEN_CHECK) {
				for (let key in cards) {
					if (cards.hasOwnProperty(key)) {
						let card = cards[key];
						let fromDay = card.fromDay;
						if ((fromDay <= daysFromUpdate) && (!applicableCard || (applicableCard.fromDay < fromDay))) {
							applicableCard = card;
						}
					}
				}
			}

			if (applicableCard) {
				Game.Cards.activate(applicableCard, user);
			}
		}
	}
};

};