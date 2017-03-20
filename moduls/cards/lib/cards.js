initCardsLib = function() {

game.Card = function(options) {
	this.doNotRegisterEffect = true;

	game.Card.superclass.constructor.apply(this, arguments);

	this.type = 'card';
	this.cardGroup = options.cardGroup;
	this.cardType = options.cardType;
	this.durationTime = options.durationTime;
	this.reloadTime = options.reloadTime;

	for (var key in Game.Cards.items) {
		if (Game.Cards.items[key][this.engName]) {
			throw new Meteor.Error('Ошибка в контенте', 'Дублируется карточка ' + this.engName);
		}
	}

	this.url = function(options) {
		options = options || {
			group: 'house',
			subgroup: (this.cardType != 'general' ? this.cardType : 'cards'),
			item: this.engName
		};
		return Router.routes.house.path(options);
	};

	this.icon = function() {
		return '/img/game/house/donate/i/' + this.engName + '.png';
	};

	this.image = function() {
		return '/img/game/house/donate/i/' + this.engName + '.png';
	};

	Game.Cards.items[this.cardType][this.engName] = this;

	this.amount = function() {
		var cards = Game.Cards.getValue();
		return (cards && cards[this.engName] && cards[this.engName].amount)
			? cards[this.engName].amount
			: 0;
	};

	this.getPrice = function() {
		return options.price;
	};

	this.currentLevel = function() {
		return 0;
	};

	this.getActiveTask = function() {
		return Game.Queue.Collection.findOne({
			user_id: Meteor.userId(),
			status: Game.Queue.status.INCOMPLETE,
			type: 'card',
			engName: this.engName
		});
	};

	this.canBuy = function() {
		var price = this.getPrice();
		if (!price) {
			return false;
		}

		var resources = Game.Resources.getValue();
		for (var name in price) {
			if (name != 'time' && resources[name].amount < (price[name])) {
				return false;
			}
		}

		return true;
	};

	this.nextReloadTime = function() {
		var cards = Game.Cards.getValue();
		if (cards && cards[this.engName] && cards[this.engName].nextReloadTime) {
			return cards[this.engName].nextReloadTime;
		}
		return null;
	};
};
game.extend(game.Card, game.Item);

Game.Cards = {
	Collection: new Meteor.Collection('cards'),

	items: {
		general: {},
		donate: {},
		pulsecatcher: {},
		penalty: {}
	},

	getValue: function(uid) {
		return Game.Cards.Collection.findOne({
			user_id: uid === undefined ? Meteor.userId() : uid
		});
	},

	getActive: function() {
		var tasks = Game.Queue.Collection.find({
			user_id: Meteor.userId(),
			status: Game.Queue.status.INCOMPLETE,
			type: 'card'
		}).fetch();

		var active = {};
		for (var i = 0; i < tasks.length; i++) {
			active[tasks[i].engName] = true;
		}

		var result = [];
		for (var type in Game.Cards.items) {
			for (var name in Game.Cards.items[type]) {
				if (active[name]) {
					result.push(Game.Cards.items[type][name]);
				}
			}
		}
		
		return result;
	},

	hasTypeActive: function(type) {
		var tasks = Game.Queue.Collection.find({
			user_id: Meteor.userId(),
			status: Game.Queue.status.INCOMPLETE,
			type: 'card'
		}).fetch();

		var active = {};
		for (var i = 0; i < tasks.length; i++) {
			active[tasks[i].engName] = true;
		}

		for (let name in active) {
			if (Game.Cards.items[type][name]) {
				return true;
			}
		}
		
		return false;
	},

	getItem: function (id) { 
		for (var type in Game.Cards.items) {
			if (Game.Cards.items[type][id]) {
				return Game.Cards.items[type][id];
			}
		}
		return null;
	}
};

initCardsContent();

Game.Helpers.deepFreeze(Game.Cards.items);

};