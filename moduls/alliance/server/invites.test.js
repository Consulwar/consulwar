import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import '../lib/invites';
import './invites';

describe("Alliance invites", function() {
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

		initAllianceInvitesServer();
	});

	after(function() {
		Meteor.user = storedUser;
		Meteor.userId = storedUserId;
	});

	describe("create", function() {
		it("should check recipient", function() {
			checkThrow(undefined, 'Expected string, got undefined');
			checkThrow(123, 'Match error: Expected string, got number');
		});

		it("should check recipient user", function() {
			checkThrow('tester2', 'Получателя с таким ником не существует');
		});

		it("should check recipient free for invite", function() {
			Meteor.users.insert({_id: '78', username: 'tester2', alliance: 'allianceOther'});
			checkThrow('tester2', 'Игрок уже состоит в альянсе');
		});

		it("should check owner alliance", function() {
			Meteor.users.insert({_id: '78', username: 'tester2'});
			checkThrow('tester2', 'Вы не являетесь владельцем альянса!');
		});

		it("should check invite existing", function() {
			Meteor.users.insert({_id: '78', username: 'tester2'});
			Game.Alliance.Collection.insert({owner: '123', url: 'alliance1'});
			Game.Alliance.Invites.Collection.insert({
				alliance: 'alliance1',
				username: 'tester2',
				status: Game.Alliance.Invites.status.SENT,
				timestamp: Game.getCurrentTime()
			});

			checkThrow('tester2', 'Этому игроку уже отправлено приглашение в данный альянс!');
		});

		it("should check status of exist invite", function() {
			Meteor.users.insert({_id: '78', username: 'tester2'});
			Game.Alliance.Collection.insert({owner: '123', url: 'alliance1'});
			Game.Alliance.Invites.Collection.insert({
				alliance: 'alliance1',
				username: 'tester2',
				status: Game.Alliance.Invites.status.ACCEPTED,
				timestamp: Game.getCurrentTime()
			});

			game.Mail = { addAllianceMessage: function() {} };
			checkNotThrow('tester2');
		});

		it("should check timestamp of exist invite", function() {
			Meteor.users.insert({_id: '78', username: 'tester2'});
			Game.Alliance.Collection.insert({owner: '123', url: 'alliance1'});
			Game.Alliance.Invites.Collection.insert({
				alliance: 'alliance1',
				username: 'tester2',
				status: Game.Alliance.Invites.status.SENT,
				timestamp: Game.getCurrentTime() - Game.Alliance.Invites.INVALIDATE_TIMEOUT
			});

			game.Mail = { addAllianceMessage: function() {} };
			checkNotThrow('tester2');
		});

		it("should send mail if ok", function() {
			Meteor.users.insert({_id: '78', username: 'tester2'});
			Game.Alliance.Collection.insert({owner: '123', url: 'alliance1', name: 'allianceName'});

			let mailSender = '';
			game.Mail = {
				addAllianceMessage: function(allianceName) {
					mailSender = allianceName;
				}
			};

			checkNotThrow('tester2');

			expect(mailSender).to.equal('allianceName');
		});

		let checkThrow = function(recipient, err) {
			expect(function() {Meteor.call('allianceInvites.create', recipient);}).to.throw(err);
		};
		let checkNotThrow = function(recipient) {
			expect(function() {Meteor.call('allianceInvites.create', recipient);}).to.not.throw();
		};
	});

	describe("apply", function() {
		it("should check invite exists", function() {
			checkThrow('alliance1', 'Приглашение не найдено');
		});

		it("should ok if invite exists", function() {
			Game.Alliance.Collection.insert({url: 'alliance1'});
			Game.Alliance.Invites.Collection.insert({
				username: 'tester1',
				alliance: 'alliance1',
				status: Game.Alliance.Invites.status.SENT});

		  checkNotThrow('alliance1');

			let alliance = Game.Alliance.Collection.findOne({url: 'alliance1'});
			expect(alliance.participants).to.eql(['tester1']);
		});

		let checkThrow = function(allianceName, err) {
			expect(function() {Meteor.call('allianceInvites.apply', allianceName);}).to.throw(err);
		};

		let checkNotThrow = function(allianceName) {
			expect(function() {Meteor.call('allianceInvites.apply', allianceName);}).to.not.throw();
		};
	});
});