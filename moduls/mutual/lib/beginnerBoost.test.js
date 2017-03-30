import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';

if (Meteor.isServer) {
	require('../../../content/lib/functions/functions');
	require('../../game/lib/main.game');

	require('./beginnerBoost');
	require('./beginnerBoostConfig');

	initBeginnerBoostLib();
	initBeginnerBoostConfigLib();

	require('../../resources/lib/resources.js');
	initResourcesLib();

	// set 510 days of serverTime
	Game.BeginnerBoost.GROWTH = {
		"initial": {
			"days": 300,
			"power": 1,
			"interval": 30
		},
		"continuous": {
			"power": 0.1,
			"interval": 30
		}
	};
	Game.BeginnerBoost.DECREASE = {
		"initial": {
			"days": 150,
			"power": 2,
			"interval": 30
		},
		"continuous": {
			"power": 0.2,
			"interval": 30
		}
	};
	Game.BeginnerBoost.POWER_UNIT = {
		"humans": 100,
		"metals": 1000,
		"crystals": 300,
		"honor": 5,
		"time": 10
	};

	describe("Beginner boost", function () {
		describe("Growth", function () {
			it("should grows by 1 for 30 days until 300 days", function () {
				checkGrowth(1, 0.033);
				checkGrowth(150, 5);
				checkGrowth(300, 10);
			});

			it("should grows by 0.1 for all other days", function () {
				checkGrowth(301, 10.0033);
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
				checkDecrease(1, 0.066);
				checkDecrease(100, 6.666);
				checkDecrease(150, 10);
			});

			it("should decrease by 0.2 for all other days", function () {
				checkDecrease(151, 10.0066);
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
				checkCalculatePower(510, 10000, 0, 'metals');
			});

			it("should get affectName from settings", function () {
				checkCalculatePower(510, 120, 2.7 * 100, 'humans');
				checkCalculatePower(510, 120, 2.7 * 1000, 'metals');
				checkCalculatePower(510, 210, 0.3 * 300, 'crystals');
				checkCalculatePower(510, 120, 2.7 * 5, 'honor');
				checkCalculatePower(510, 210, 0.3 * 10, 'time');
			});

			function checkCalculatePower(serverDays, userDays, checkPower, affectName) {
				let result = Game.BeginnerBoost.calculatePower(affectName, serverDays, userDays);
				expect(result).to.closeTo(checkPower, 0.001);
			}

			it("should calculate server days if not set", function() {
				let currentServerTime = Game.getCurrentServerTime() * 1000;
				Game.BeginnerBoost.SERVER_START_DATE = new Date(currentServerTime - 1000*60*60*24*510);

				// let userRegisterDate = new Date(Game.getCurrentServerTime() * 1000 - 1000 * 60 * 60 * 24 * userDays);

				let result = Game.BeginnerBoost.calculatePower('metals', undefined, 120);
				expect(result).to.closeTo(2.7 * 1000, 0.001);
			});

			Meteor.methods({
				'beginnerBoost.calculate': function() {
					return Game.BeginnerBoost.calculatePower('metals', 510);
				}
			});

			it("should calculate user days if not set", function() {
				let storedUser = Meteor.user;
				let storedUserId = Meteor.userId;

				Meteor.user = function() {
					return {
						createdAt: Game.BeginnerBoost.SERVER_START_DATE
					};
				};

				Meteor.userId = function() {
					return "123";
				};

				Game.Resources.Collection.remove({});

				Game.Resources.Collection.insert({
					"user_id" : "123",
					"metals" : {
						"amount" : 1459154.92,
						"bonus" : 448,
						"bonusSeconds" : 7
					},
					"updated" : ((new Date(Meteor.user().createdAt).getTime() / 1000) + 120 * 24 * 60 * 60)
				});

				let result = Meteor.call('beginnerBoost.calculate');
				expect(result).to.closeTo(2.7 * 1000, 0.001);

				Meteor.user = storedUser;
				Meteor.userId = storedUserId;
			});
		});
	});
}