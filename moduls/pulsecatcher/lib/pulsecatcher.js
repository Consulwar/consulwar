initPulsecatcherLib = function() {

Game.Pulsecatcher = {
	getActiveQuiz: function() {
		return Game.Quiz.Collection.findOne({
			type: 'pulsecatcher'
		}, {
			sort: { endDate: -1 }
		});
	},

	getPreviousQuiz: function() {
		return Game.Quiz.Collection.findOne({
			type: 'pulsecatcher'
		}, {
			sort: { endDate: -1 },
			skip: 1
		});
	},

	getChoosenBonus: function(previousQuiz) {
		if (!previousQuiz) {
			return null;
		}

		var choosen = null;
		for (var key in previousQuiz.result) {
			if (choosen == null || previousQuiz.result[key] > previousQuiz.result[choosen]) {
				choosen = key;
			}
		}

		return Game.Cards.items[choosen] ? Game.Cards.items[choosen] : null;
	},

	getActiveBonusList: function() {
		var result = {};
		for (var key in Game.Cards.items) {
			if (Game.Cards.items[key].cardType == 'pulsecatcher'
			 && Game.Cards.items[key].getActive()
			) {
				result[key] = Game.Cards.items[key];
			}
		}
		return result;
	}
};

initPulsecatcherContent();

};