import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import '../lib/requests';
import './requests';

describe("Alliance requests", function() {
	let storedUser, storedUserId;

	beforeEach(function () {
		resetDatabase();
	});

	before(function() {
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

		initAllianceRequestsServer();
	});

	after(function() {
		Meteor.user = storedUser;
		Meteor.userId = storedUserId;
	});

	describe("create", function() {
		it("should check allianceName", function() {
			checkThrow(undefined, 'Expected string, got undefined');
			checkThrow(123, 'Match error: Expected string, got number');
		});

		it("should check alliance by name", function() {
			checkThrow('alliance1', 'Такого альянса не существует!');
		});

		it("should check repeated requests", function() {
			Game.Alliance.Collection.insert({name: 'alliance1'});
			Game.Alliance.Requests.Collection.insert({alliance: 'alliance1', username: 'tester1'});

			checkThrow('alliance1', 'Вы уже подали заявку в этот альянс ранее!');
		});

		let checkThrow = function(allianceName, err) {
			expect(function() {Meteor.call('allianceRequests.create', allianceName, '');}).to.throw(err);
		};

		let checkNotThrow = function(allianceName) {
			expect(function() {Meteor.call('allianceRequests.create', allianceName, '');}).to.not.throw();
		};
	});
});