initResourcesLib = function() {

Game.Resources = {
	Collection: new Meteor.Collection('resources'),

	bonusStorage: 6,

	getValue: function(uid) {
		return Game.Resources.Collection.findOne({user_id: uid != undefined ? uid : Meteor.userId()});
	},

	/**
	 * income - общая добыца
	 * delta - количество секунд
	 * uncountedSeconds - бонусные секунды
	 */
	calculateFinalAmount: function(baseAmount, income, delta, uncountedSeconds, bonus) {
		var result = Game.Resources.calculateProduction(income, delta, uncountedSeconds, bonus);

		result.amount += baseAmount;
		if (bonus) {
			result.bonus = Math.min(result.bonus + bonus, income * Game.Resources.bonusStorage);
		}

		return result;
	},

	calculateProduction: function(income, delta, uncountedSeconds, halfToBonus) {
		delta += uncountedSeconds ? uncountedSeconds : 0;

		var interval = 3600 * (halfToBonus ? 2 : 1);

		// Добыча в секунду (дробное)
		var incomePerSecond = income / interval;
		if (incomePerSecond < 1 || Meteor.isClient) {
			// Количество секунд необходимых для получения единицы ресурса
			var secondsForOne = interval / income;

			// Общая сумма прибыли
			var amount = Math.floor(delta / secondsForOne);

			// Количество использованных секунд (округление в большу сторону)
			var usedSeconds = Math.ceil(amount * secondsForOne);
			if (Meteor.isClient) {
				usedSeconds = amount * secondsForOne;
			}

			// Количетсво неиспользованных секунд
			var secondsLeft = delta - usedSeconds;

			var result = {
				amount: amount,
				bonusSeconds: secondsLeft
			};

			if (halfToBonus) {
				result.bonus = amount;
			}

			return result;
		} else {
			var totalAmount = Math.floor((income * delta) / interval);

			var result = {
				amount: totalAmount,
				bonusSeconds: 0
			};

			if (halfToBonus) {
				result.bonus = totalAmount;
			}
		
			return result
		}
	},

	getIncome: function() {
		return Game.Effect.Income.getValue();
	},

	calculateHonorFromResources: function(resources) {
		var honor = 0;

		honor += ((resources.base.metals) || 0);
		honor += ((resources.base.crystals * 3) || 0);
		honor += ((resources.base.humans * 4) || 0);

		return Math.floor(honor / 150);
	},

	calculateHonorFromReinforcement: function(resources) {
		return Math.floor(Game.Resources.calculateHonorFromResources(resources) / 2)
	}
};

}