initBeginnerBoostLib = function () {
'use strict';

const beginnersBoost = Meteor.settings.public.beginnersBoost;
const growth = beginnersBoost.growth;
const growthMax = Math.round(growth.days / growth.firstPartPerDays * growth.firstPartValue);

const decrease = beginnersBoost.decrease;
const decreaseMax = Math.round(decrease.days / decrease.firstPartPerDays * decrease.firstPartValue);

const serverStartDate = new Date(Meteor.settings.public.serverStartDate);
const SEC_PER_DAY = 1000 * 60 * 60 * 24;

Game.BeginnerBoost = {
	calculatePower: function (user, affectName) {
		let serverDate = new Date(Game.getCurrentServerTime() * 1000);
		let serverDays = Math.floor((serverDate - serverStartDate) / SEC_PER_DAY);
		let userDays = Math.floor((serverDate - user.createdAt) / SEC_PER_DAY);

		let power = this.calculateGrowth(serverDays) - this.calculateDecrease(userDays);
		return Math.max(0, power) * beginnersBoost.onePower[affectName];
	},

	calculateGrowth: function(days) {
		if (days <= growth.days) {
			return Math.floor(days / growth.firstPartPerDays) * growth.firstPartValue;
		} else {
			return growthMax + Math.floor((days - growth.days) / growth.secondPartPerDays) * growth.secondPartValue;
		}
	},

	calculateDecrease: function(days) {
		if (days <= decrease.days) {
			return Math.floor(days / decrease.firstPartPerDays) * decrease.firstPartValue;
		} else {
			return decreaseMax + Math.floor((days - decrease.days) / decrease.secondPartPerDays) * decrease.secondPartValue;
		}
	}
};

};