import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';

if (Meteor.isServer) {
	require('../../../content/lib/functions/functions');
	require('../../game/lib/main.game');

	require('./beginnerBoost');

	let currentServerTime = Game.getCurrentServerTime() * 1000;

	// set 510 days of serverTime
	Meteor.settings.public.serverStartDate = new Date(currentServerTime - 1000*60*60*24*510);

	initBeginnerBoostLib();

	describe("Beginner boost", function () {
		describe("Growth", function () {
			it("should grows by 1 for 30 days until 300 days", function () {
				checkGrowth(1, 0);
				checkGrowth(150, 5);
				checkGrowth(300, 10);
			});

			it("should grows by 0.1 for all other days", function () {
				checkGrowth(301, 10);
				checkGrowth(330, 10.1);
				checkGrowth(1200, 13);
			});

			function checkGrowth(days, power) {
				let result = Game.BeginnerBoost.calculateGrowth(days);
				expect(result).to.closeTo(power, 0.001);
			}
		});

		describe("Decrease", function () {
			it("should decrease by 2 for 30 days until 150 days", function () {
				checkDecrease(1, 0);
				checkDecrease(100, 6);
				checkDecrease(150, 10);
			});

			it("should decrease by 0.2 for all other days", function () {
				checkDecrease(151, 10);
				checkDecrease(180, 10.2);
				checkDecrease(1530, 19.2);
			});

			function checkDecrease(days, power) {
				let result = Game.BeginnerBoost.calculateDecrease(days);
				expect(result).to.closeTo(power, 0.001);
			}
		});

		describe("Both together", function () {
			it("should check min power to be not negative", function () {
				const serverStartDateTime = new Date(Meteor.settings.public.serverStartDate).getTime() / 1000;
				const SEC_PER_DAY = 60 * 60 * 24;

				let serverTime = Game.getCurrentServerTime();
				let serverDays = Math.ceil((serverTime - serverStartDateTime) / SEC_PER_DAY);

				check(serverDays+10000, 0, 'metals');
			});

			it("should get affectName from settings", function () {
				const serverStartDateTime = new Date(Meteor.settings.public.serverStartDate).getTime() / 1000;
				const SEC_PER_DAY = 60 * 60 * 24;

				let serverTime = Game.getCurrentServerTime();
				let serverDays = Math.ceil((serverTime - serverStartDateTime) / SEC_PER_DAY);

				check(120, 2.7 * 1000, 'metals');
				check(210, 0.3 * 300, 'crystals');
				check(120, 2.7 * 5, 'honor');
				check(210, 0.3 * 10, 'time');
			});

			function check(userDays, checkPower, affectName) {
				let user = {
					createdAt: new Date(Game.getCurrentServerTime() * 1000 - 1000 * 60 * 60 * 24 * userDays)
				};

				let result = Game.BeginnerBoost.calculatePower(user, affectName);
				expect(result).to.closeTo(checkPower, 0.001);
			}
		});
	});
}