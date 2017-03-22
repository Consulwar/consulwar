initBeginnerBoostLib = function () {
'use strict';

const SEC_PER_DAY = 1000 * 60 * 60 * 24;

Game.BeginnerBoost = {
	calculatePower: function (affectName, userRegisterDate = Meteor.user().createdAt) {
		let serverDate = new Date(Game.getCurrentServerTime() * 1000);
		let serverDays = Math.floor((serverDate - Game.BeginnerBoost.SERVER_START_DATE) / SEC_PER_DAY);
		let userDays = Math.floor((serverDate - userRegisterDate) / SEC_PER_DAY);

		let power = this.calculateGrowth(serverDays) - this.calculateDecrease(userDays);
		return Math.max(0, power) * Game.BeginnerBoost.POWER_UNIT[affectName];
	},

	calculateGrowth: function(days) {
		if (days <= Game.BeginnerBoost.GROWTH.days) {
			return Math.floor(days / Game.BeginnerBoost.GROWTH.firstPartPerDays) * Game.BeginnerBoost.GROWTH.firstPartValue;
		} else {
			const growthMax = Math.round(Game.BeginnerBoost.GROWTH.days / Game.BeginnerBoost.GROWTH.firstPartPerDays * Game.BeginnerBoost.GROWTH.firstPartValue);

			return growthMax + Math.floor((days - Game.BeginnerBoost.GROWTH.days) / Game.BeginnerBoost.GROWTH.secondPartPerDays) * Game.BeginnerBoost.GROWTH.secondPartValue;
		}
	},

	calculateDecrease: function(days) {
		if (days <= Game.BeginnerBoost.DECREASE.days) {
			return Math.floor(days / Game.BeginnerBoost.DECREASE.firstPartPerDays) * Game.BeginnerBoost.DECREASE.firstPartValue;
		} else {
			const decreaseMax = Math.round(Game.BeginnerBoost.DECREASE.days / Game.BeginnerBoost.DECREASE.firstPartPerDays * Game.BeginnerBoost.DECREASE.firstPartValue);

			return decreaseMax + Math.floor((days - Game.BeginnerBoost.DECREASE.days) / Game.BeginnerBoost.DECREASE.secondPartPerDays) * Game.BeginnerBoost.DECREASE.secondPartValue;
		}
	}
};

initBeginnerBoostConfigLib();

};