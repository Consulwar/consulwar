initBuildingSpecialPulsecatcherLib = function() {

Game.Building.special.Pulsecatcher = {
	getQuiz: function(skip = 0) {
		return Game.Quiz.Collection.findOne({
			type: 'pulsecatcher'
		}, {
			sort: { endDate: -1 },
			skip: skip
		});
	},

	getChoosenBonus: function(previousQuiz) {
		if (!previousQuiz) {
			return null;
		}

		var choosen = null;
		for (var key in previousQuiz.result) {
			if (choosen === null || previousQuiz.result[key] > previousQuiz.result[choosen]) {
				choosen = key;
			}
		}

		return Game.Cards.items.pulsecatcher[choosen] ? Game.Cards.items.pulsecatcher[choosen] : null;
	},

	getActiveBonusList: function() {
		var result = {};
		for (var key in Game.Cards.items.pulsecatcher) {
			if (Game.Cards.items.pulsecatcher[key].cardType == 'pulsecatcher'
			 && Game.Cards.items.pulsecatcher[key].getActiveTask()
			) {
				result[key] = Game.Cards.items.pulsecatcher[key];
			}
		}
		return result;
	}
};

initBuildingSpecialPulsecatcherConfigLib();

};