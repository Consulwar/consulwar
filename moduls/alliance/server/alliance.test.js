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
	});

	before(function() {
		resetDatabase();

		storedUser = Meteor.user;
		storedUserId = Meteor.userId;

		Meteor.user = function() {
			return {
				_id: '123'
			};
		};

		Meteor.userId = function() {
			return '123';
		};

		initAllianceServer();
	});

	after(function() {
		Meteor.user = storedUser;
		Meteor.userId = storedUserId;
	});

	it("should check options name", function() {
		checkThrow({}, 'Expected string, got undefined');
		checkThrow({name: 123}, 'Match error: Expected string, got number');
		checkThrow({name: ''}, 'Название не должно быть пустым');
		checkThrow({name: 'name!'}, '[Название может содержать пробел, тире, нижнее подчеркивание, буквы и цифры]');
		checkThrow({name: new Array(33).fill('a').join('')}, 'Максимальная длинна названия 32 символов');
	});

	it("should check options url", function() {
		checkThrow({name: 'name1'}, 'Expected string, got undefined');
		checkThrow({name: 'name1', url: 123}, 'Match error: Expected string, got number');
		checkThrow({name: 'name1', url: ''}, 'URL альянса не должно быть пустым');
		checkThrow({name: 'name1', url: 'url 1'}, 'URL альянса должно состоять только из латинских букв, цифр, дефисов и подчеркиваний');
		checkThrow({name: 'name1', url: new Array(33).fill('a').join('')}, 'URL альянса должно быть не длиннее 32 символов');
	});

	it("should check options tag", function() {
		checkThrow({name: 'name1', url: 'url1'}, 'Expected string, got undefined');
		checkThrow({name: 'name1', url: 'url1', tag: 123}, 'Match error: Expected string, got number');
		checkThrow({name: 'name1', url: 'url1', tag: ''}, 'Таг не должен быть пустым');
		checkThrow({name: 'name1', url: 'url1', tag: 'tag 1'}, 'Таг альянса должен состоять только из латинских букв, цифр, дефисов и подчеркиваний');
		checkThrow({name: 'name1', url: 'url1', tag: new Array(6).fill('a').join('')}, 'Максимальная длинна тага 5 символов');
	});

	it("should check options type", function() {
		checkThrow({name: 'name1', url: 'url1', tag: 'tag1'}, 'Expected number, got undefined');
		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: '3'}, 'Expected number, got string');
		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 3}, 'Неверный тип альянса');
	});

	it("should check options information", function() {
		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1}, 'Expected string, got undefined');
	});

	it("should check options priceType", function() {
		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1}, 'Expected string, got undefined');
		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'tt'}, 'Неверный тип оплаты');
	});

	it("should check unique of name, url and tag", function() {
		Game.Alliance.Collection.insert({name: 'name1'});
		Game.Alliance.Collection.insert({url: 'url2'});
		Game.Alliance.Collection.insert({tag: 'tag3'});

		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'ggk'}, 'Альянс с именем name1 уже существует');
		checkThrow({name: 'name2', url: 'url2', tag: 'tag2', type: 1, information:'', priceType: 'ggk'}, 'Альянс с URL url2 уже существует');
		checkThrow({name: 'name3', url: 'url3', tag: 'tag3', type: 1, information:'', priceType: 'ggk'}, 'Альянс с TAG tag3 уже существует');
	});

	it("should check user creation conditions", function() {
		Meteor.user = function() {
			return {
				_id: '123',
				rating: Game.Alliance.CREATOR_RATING - 1
			};
		};

		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'ggk'}, 'Недостаточно рейтинга для создания альянса!');

		Meteor.user = function() {
			return {
				_id: '123',
				rating: Game.Alliance.CREATOR_RATING
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

		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'ggk'}, 'Недостаточный уровень системы связи!');

		Game.Building.Collection.update({user_id: '123'},{
			$set: {'residential.alliance': Game.Alliance.CREATOR_BUILDING_LEVEL}
		});

		Game.Alliance.Collection.insert({owner: '123'});

		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'ggk'}, 'Вы являетесь владельцем другого альянса!');

		Game.Alliance.Collection.remove({owner: '123'});

		Game.Resources = {
			getValue: function() {
				return {
					credits: {amount: Game.Alliance.PRICE_IN_GGK - 1}
				};
			}
		};

		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'ggk'}, 'Недостаточно средств для создания альянса');

		Game.Resources = {
			getValue: function() {
				return {
					honor: {amount: Game.Alliance.PRICE_IN_HONOR - 1}
				};
			}
		};

		checkThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'honor'}, 'Недостаточно средств для создания альянса');
	});

	it("should spend appropriate resources", function() {
		Meteor.user = function() {
			return {
				_id: '123',
				rating: Game.Alliance.CREATOR_RATING
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
					credits: {amount: Game.Alliance.PRICE_IN_GGK},
					honor: {amount: Game.Alliance.PRICE_IN_HONOR}
				};
			},

			spend: function(what) {
				spend = what;
			}
		};

		let chatRoom = null;
		Game.Chat = {
			Room: {
				Collection: {
					insert: function(room) {
						chatRoom = room;
					}
				}
			}
		};

		checkNotThrow({name: 'name1', url: 'url1', tag: 'tag1', type: 1, information:'', priceType: 'ggk'});
		expect(spend).to.eql({credits: Game.Alliance.PRICE_IN_GGK});
		expect(chatRoom.name).to.equal('alliance/url1');
		expect(chatRoom.title).to.equal('name1');

		Game.Alliance.Collection.remove({owner: '123'});

		checkNotThrow({name: 'name2', url: 'url2', tag: 'tag2', type: 1, information:'', priceType: 'honor'});
		expect(spend).to.eql({honor: Game.Alliance.PRICE_IN_HONOR});
		expect(chatRoom.name).to.equal('alliance/url2');
		expect(chatRoom.title).to.equal('name2');
	});

	let checkThrow = function(options, err) {
		expect(function() {Meteor.call('alliance.create', options);}).to.throw(err);
	};

	let checkNotThrow = function(options) {
		expect(function() {Meteor.call('alliance.create', options);}).to.not.throw();
	};
});