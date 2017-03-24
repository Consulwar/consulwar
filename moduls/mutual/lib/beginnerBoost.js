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
		const self = Game.BeginnerBoost;
		if (days <= self.GROWTH.initial.days) {
			return (days / self.GROWTH.initial.interval) * self.GROWTH.initial.power;
		} else {
			const growthMax = (self.GROWTH.initial.days / self.GROWTH.initial.interval *
				self.GROWTH.initial.power);

			return growthMax + ((days - self.GROWTH.initial.days) / self.GROWTH.continuous.interval) *
				self.GROWTH.continuous.power;
		}
	},

	calculateDecrease: function(days) {
		const self = Game.BeginnerBoost;
		if (days <= self.DECREASE.initial.days) {
			return (days / self.DECREASE.initial.interval) * self.DECREASE.initial.power;
		} else {
			const decreaseMax = (self.DECREASE.initial.days / self.DECREASE.initial.interval *
				self.DECREASE.initial.power);

			return decreaseMax + ((days - self.DECREASE.initial.days) / self.DECREASE.continuous.interval) *
				self.DECREASE.continuous.power;
		}
	}
};

};