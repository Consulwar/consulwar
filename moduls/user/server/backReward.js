initBackRewardServer = function() {

'use strict';

Game.BackReward = {
	checkedTimestamps: {

	},
	getReward: function() {
		let user = Meteor.user();
		const currentTime = Game.getCurrentTime();
		const lastCheck = Game.BackReward.checkedTimestamps[user._id];
		if (!lastCheck || 
			((currentTime - lastCheck) > Game.BackRewardCard.SECONDS_BETWEEN_CHECK)
		) {
			let daysFromUpdate = (currentTime - Game.Resources.getValue().updated);
			let cards = Game.Cards.items['backReward'];
			let applicableCard;

			for (let key in cards) {
				if (cards.hasOwnProperty(key)) {
					let card = cards[key];
					let fromDay = card.fromDay;
					if ((fromDay <= daysFromUpdate) && (!applicableCard || (applicableCard.fromDay < fromDay))) {
						applicableCard = card;
					}
				}
			}

			if (applicableCard) {
				Game.Cards.activate(applicableCard, user);
			}

			Game.BackReward.checkedTimestamps[user._id] = currentTime;
		}
	}
};

};