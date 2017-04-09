import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import '../lib/requests';
import './requests';

describe("Alliance requests", function() {
	let storedUser, storedUserId;

	beforeEach(function () {
		resetDatabase();

		storedUser = Meteor.user;
		storedUserId = Meteor.userId;

		Meteor.user = function() {
			return {
				_id: '123',
				username: 'tester1'
			};
		};

		Meteor.userId = function() {
			return '123';
		};
	});

	before(function() {
		initAllianceRequestsServer();
	});

	afterEach(function() {
		Meteor.user = storedUser;
		Meteor.userId = storedUserId;
	});

	describe("create", function() {
		it("should check another alliance", function() {
			Meteor.user = function() {
				return {
					_id: '123',
					alliance: 'alliance1',
					username: 'tester1'
				};
			};
			checkThrow('alliance2', 'Вы уже состоите в альянсе');
		});

		it("should check allianceName", function() {
			checkThrow(undefined, 'Expected string, got undefined');
			checkThrow(123, 'Match error: Expected string, got number');
		});

		it("should check alliance by url", function() {
			checkThrow('alliance1', 'Такого альянса не существует');
		});

		it("should check repeated requests", function() {
			Game.Alliance.Collection.insert({url: 'alliance1'});
			Game.Alliance.Requests.Collection.insert({
				alliance: 'alliance1',
				username: 'tester1',
				status: Game.Alliance.Requests.status.SENT,
				timestamp: Game.getCurrentTime()
			});

			checkThrow('alliance1', 'Вы уже подали заявку ранее');
		});

		it("should check status of exist request", function() {
			Game.Alliance.Collection.insert({owner: '123', url: 'alliance1'});
			Game.Alliance.Requests.Collection.insert({
				alliance: 'alliance1',
				username: 'tester1',
				status: Game.Alliance.Requests.status.ACCEPTED,
				timestamp: Game.getCurrentTime()
			});

			checkNotThrow('alliance1');
		});

		it("should check declined by time", function() {
			Game.Alliance.Collection.insert({owner: '123', url: 'alliance1'});
			Game.Alliance.Requests.Collection.insert({
				alliance: 'alliance1',
				username: 'tester1',
				status: Game.Alliance.Requests.status.DECLINED,
				timestamp: Game.getCurrentTime()
			});

			checkThrow('alliance1', 'Вам недавно отказали в заявке в этот альянс');
		});

		it("should check declined timeout", function() {
			Game.Alliance.Collection.insert({owner: '123', url: 'alliance1'});
			Game.Alliance.Requests.Collection.insert({
				alliance: 'alliance1',
				username: 'tester1',
				status: Game.Alliance.Requests.status.DECLINED,
				timestamp: Game.getCurrentTime() - Game.Alliance.Requests.DECLINE_TIMEOUT
			});

			checkNotThrow('alliance1');
		});

		let checkThrow = function(allianceName, err) {
			expect(function() {Meteor.call('allianceRequests.create', allianceName, '');}).to.throw(err);
		};

		let checkNotThrow = function(allianceName) {
			expect(function() {Meteor.call('allianceRequests.create', allianceName, '');}).to.not.throw();
		};
	});

	describe("update", function() {
		it("should check request exists", function() {
			checkThrow('not_found', true, 'Заявка не найдена');
		});

		it("should check request accepted", function() {
			let requestId = Game.Alliance.Requests.Collection.insert({
				username: 'tester1',
				alliance: 'alliance1',
				status: Game.Alliance.Requests.status.ACCEPTED
			});

			checkThrow(requestId, true, 'Заявка уже принята');
		});

		it("should check request declined", function() {
			let requestId = Game.Alliance.Requests.Collection.insert({
				username: 'tester1',
				alliance: 'alliance1',
				status: Game.Alliance.Requests.status.DECLINED
			});

			checkThrow(requestId, true, 'Заявка уже отклонена');
		});

		it("should ok if request exists", function() {
			Game.Alliance.Collection.insert({url: 'alliance1'});
			let requestId = Game.Alliance.Requests.Collection.insert({
				username: 'tester2',
				alliance: 'alliance1',
				alliance_name: 'allianceName',
				status: Game.Alliance.Requests.status.SENT,
				timestamp: Game.getCurrentTime()
			});

			let mailSender = '';
			game.Mail = {
				addAllianceMessage: function(allianceName) {
					mailSender = allianceName;
				}
			};

			checkNotThrow(requestId, true);

			let alliance = Game.Alliance.Collection.findOne({url: 'alliance1'});
			expect(alliance.participants).to.eql(['tester2']);

			expect(mailSender).to.equal('allianceName');
		});

		it("should set status declined on isApply == false", function() {
			Game.Alliance.Collection.insert({url: 'alliance1'});
			let requestId = Game.Alliance.Requests.Collection.insert({
				username: 'tester2',
				alliance: 'alliance1',
				status: Game.Alliance.Requests.status.SENT,
				timestamp: Game.getCurrentTime()
			});

			checkNotThrow(requestId, false);

			let request = Game.Alliance.Requests.Collection.findOne({_id: requestId});
			expect(request.status).to.equal(Game.Alliance.Requests.status.DECLINED);

			let alliance = Game.Alliance.Collection.findOne({url: 'alliance1'});
			expect(alliance.participants).to.be.undefined;
		});


		let checkThrow = function(requestId, isAccept, err) {
			expect(function() {Meteor.call('allianceRequests.update', requestId, isAccept);}).to.throw(err);
		};

		let checkNotThrow = function(requestId, isAccept) {
			expect(function() {Meteor.call('allianceRequests.update', requestId, isAccept);}).to.not.throw();
		};
	});
});