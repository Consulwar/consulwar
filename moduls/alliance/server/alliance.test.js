import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import '../lib/alliance';
import '../lib/config';
import './alliance';

describe("Alliance", function() {
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
		initAllianceServer();
	});

	afterEach(function() {
		Meteor.user = storedUser;
		Meteor.userId = storedUserId;
	});

	describe("create", function() {
		it("should check options name", function() {
			checkThrow({}, "Match error: Missing key 'name'");
			checkThrow({name: 123}, 'Match error: Expected string, got number');
			checkThrow({name: ''}, 'Название не должно быть пустым');
			checkThrow({name: 'name!'}, 'Название может содержать пробел, тире, нижнее подчеркивание, буквы и цифры');
			checkThrow({name: new Array(33).fill('a').join('')}, 'Максимальная длинна названия 32 символов');
		});

		it("should check options url", function() {
			checkThrow({name: 'name1'}, "Match error: Missing key 'url'");
			checkThrow({name: 'name1', url: 123}, 'Match error: Expected string, got number');
			checkThrow({name: 'name1', url: ''}, 'URL альянса не должно быть пустым');
			checkThrow({name: 'name1', url: 'url 1'}, 'URL альянса должно состоять только из латинских букв, цифр, дефисов и подчеркиваний');
			checkThrow({name: 'name1', url: new Array(33).fill('a').join('')}, 'URL альянса должно быть не длиннее 32 символов');
		});

		it("should check options tag", function() {
			checkThrow({name: 'name1', url: 'url1'}, "Match error: Missing key 'tag'");
			checkThrow({name: 'name1', url: 'url1', tag: 123}, 'Match error: Expected string, got number');
			checkThrow({name: 'name1', url: 'url1', tag: ''}, 'Таг не должен быть пустым');
			checkThrow({name: 'name1', url: 'url1', tag: 'tag 1'}, 'Таг альянса должен состоять только из латинских букв, цифр, дефисов и подчеркиваний');
			checkThrow({name: 'name1', url: 'url1', tag: new Array(6).fill('a').join('')}, 'Максимальная длинна тага 5 символов');
		});

		it("should check options type", function() {
			checkThrow({name: 'name1', url: 'url1', tag: 'tag1'}, "Match error: Missing key 'type'");
			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: '3'}, 'Expected number, got string');
			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 3}, 'Неверный тип альянса');
		});

		it("should check options information", function() {
			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1}, "Match error: Missing key 'information'");
		});

		it("should check options priceType", function() {
			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:''}, "Match error: Missing key 'priceType'");
			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'tt'}, 'Неверный тип оплаты');
		});

		it("should check unique of name, url and tag", function() {
			Game.Alliance.Collection.insert({name: 'name1'});
			Game.Alliance.Collection.insert({url: 'url2'});
			Game.Alliance.Collection.insert({tag: 'tag3'});

			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'credits'}, 'Альянс с именем name1 уже существует');
			checkThrow({name: 'name2', url: 'url2', tag: 'tag2', type: 1, information:'', priceType: 'credits'}, 'Альянс с URL url2 уже существует');
			checkThrow({name: 'name3', url: 'url3', tag: 'tag3', type: 1, information:'', priceType: 'credits'}, 'Альянс с TAG tag3 уже существует');
		});

		it("should check user creation conditions", function() {
			Meteor.user = function() {
				return {
					_id: '123',
					rating: Game.Alliance.CREATOR_RATING - 1,
					username: 'tester1'
				};
			};

			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'credits'}, 'Недостаточно рейтинга [Невозможно создать альянс]');

			Meteor.user = function() {
				return {
					_id: '123',
					rating: Game.Alliance.CREATOR_RATING,
					username: 'tester1'
				};
			};

			Game.Building = {
				Collection: new Meteor.Collection('buildings'),

				has: function(group, name, level) {
					let buildings = Game.Building.Collection.findOne({user_id: Meteor.userId()});

					if (buildings && buildings[group] && buildings[group][name]) {
						return buildings[group][name] >= level;
					} else {
						return false;
					}
				}
			};

			Game.Building.Collection.insert({
				user_id: '123',
				residential: {
					alliance: Game.Alliance.CREATOR_BUILDING_LEVEL - 1
				}
			});

			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'credits'}, 'Недостаточный уровень системы связи [Невозможно создать альянс]');

			Game.Building.Collection.update({user_id: '123'},{
				$set: {'residential.alliance': Game.Alliance.CREATOR_BUILDING_LEVEL}
			});

			Meteor.user = function() {
				return {
					_id: '123',
					rating: Game.Alliance.CREATOR_RATING,
					username: 'tester1',
					alliance: 'other_alliance'
				};
			};

			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'credits'}, 'Вы являетесь участником другого альянса [Невозможно создать альянс]');

			Meteor.user = function() {
				return {
					_id: '123',
					rating: Game.Alliance.CREATOR_RATING,
					username: 'tester1'
				};
			};

			Game.Resources = {
				getValue: function() {
					return {
						credits: {amount: Game.Alliance.PRICE_IN_CREDITS - 1}
					};
				}
			};

			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'credits'}, 'Недостаточно средств [Невозможно создать альянс]');

			Game.Resources = {
				getValue: function() {
					return {
						honor: {amount: Game.Alliance.PRICE_IN_HONOR - 1}
					};
				}
			};

			checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'honor'}, 'Недостаточно средств [Невозможно создать альянс]');
		});

		it("should spend appropriate resources", function() {
			Meteor.user = function() {
				return {
					_id: '123',
					rating: Game.Alliance.CREATOR_RATING,
					username: 'tester1'
				};
			};

			Game.Building.Collection.insert({
				user_id: '123',
				residential: {
					alliance: Game.Alliance.CREATOR_BUILDING_LEVEL
				}
			});

			let spend = null;
			Game.Resources = {
				getValue: function() {
					return {
						credits: {amount: Game.Alliance.PRICE_IN_CREDITS},
						honor: {amount: Game.Alliance.PRICE_IN_HONOR}
					};
				},

				spend: function(what) {
					spend = what;
				}
			};

			let args = null;
			Game.Chat = {
				createPrivateRoom: function() {
					args = [].slice.call(arguments);
				}
			};

			checkNotThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'credits'});
			expect(spend).to.eql({credits: Game.Alliance.PRICE_IN_CREDITS});
			expect(args[1]).to.equal('alliance/url1');
			expect(args[2]).to.equal('name1');

			Game.Alliance.Collection.remove({owner: 'tester1'});

			checkNotThrow({name: 'name2', url: 'url2', tag: 'tag2', type: 1, information:'', priceType: 'honor'});
			expect(spend).to.eql({honor: Game.Alliance.PRICE_IN_HONOR});
			expect(args[1]).to.equal('alliance/url2');
			expect(args[2]).to.equal('name2');
		});

		let checkThrow = function(options, err) {
			expect(function() {Meteor.call('alliance.create', options);}).to.throw(err);
		};

		let checkNotThrow = function(options) {
			expect(function() {Meteor.call('alliance.create', options);}).to.not.throw();
		};
	});

	describe("enter", function() {
		it("should check another alliance", function() {
			Meteor.user = function() {
				return {
					_id: '123',
					alliance: 'alliance1',
					username: 'tester1'
				};
			};
			checkThrow('url2', 'Вы уже состоите в альянсе');
		});

		it("should check alliance exists and not deleted", function() {
			checkThrow('url3', 'Такого альянса не существует');

			Game.Alliance.Collection.insert({url: 'url3', deleted: true});

			checkThrow('url3', 'Такого альянса не существует');
		});

		it("should check alliance public type", function() {
			Game.Alliance.Collection.insert({url: 'url3', type: Game.Alliance.type.OPEN});

			checkThrow('url3', 'Этот альянс не публичный');
		});

		it("should add participant and set user.alliance", function() {
			Game.Alliance.Collection.insert({url: 'url4', type: Game.Alliance.type.PUBLIC});
			Meteor.users.insert({_id: '123', username: 'tester1'});

			checkNotThrow('url4');

			let alliance = Game.Alliance.Collection.findOne({url: 'url4'});
			expect(alliance.participants).to.eql(['tester1']);

			let user = Meteor.users.findOne({_id: Meteor.userId()});
			expect(user.alliance).to.equal('url4');
		});

		let checkThrow = function(alliance, err) {
			expect(function() {Meteor.call('alliance.enter', alliance);}).to.throw(err);
		};

		let checkNotThrow = function(alliance) {
			expect(function() {Meteor.call('alliance.enter', alliance);}).to.not.throw();
		};
	});
});