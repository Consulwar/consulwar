initCardsLib = function() {

game.Card = function(options) {
	this.doNotRegisterEffect = true;

	game.Card.superclass.constructor.apply(this, arguments);

	this.type = 'card';
	this.cardGroup = options.cardGroup;
	this.durationTime = options.durationTime;
	this.reloadTime = options.reloadTime;

	if (Game.Cards.items[this.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется карточка ' + this.engName);
	}

	this.url = function(options) {
		options = options || {
			group: 'house',
			subgroup: 'cards',
			item: this.engName
		};
		return Router.routes.house.path(options);
	};

	Game.Cards.items[this.engName] = this;

	this.amount = function() {
		var resources = Game.Resources.getValue();
		return (resources && resources[this.engName] && resources[this.engName].amount)
			? resources[this.engName].amount
			: 0;
	};

	this.getPrice = function() {
		return options.price;
	};

	this.currentLevel = function() {
		return 0;
	};

	this.getActive = function() {
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
		var resources = Game.Resources.getValue();
		if (resources[this.engName] && resources[this.engName].nextReloadTime) {
			return resources[this.engName].nextReloadTime;
		}
		return null;
	};
};
game.extend(game.Card, game.Item);

Game.Cards = {
	items: {},

	getActive: function() {
		var result = [];
		for (var key in Game.Cards.items) {
			if (Game.Cards.items[key].getActive()) {
				result.push(Game.Cards.items[key]);
			}
		}
		return result;
	}
};

initCardsContent();

};