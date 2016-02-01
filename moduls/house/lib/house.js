initHouseLib = function() {

game.HouseItem = function(options) {
	game.HouseItem.superclass.constructor.apply(this, arguments);

	this.type = 'house';
	this.types = options.types;

	Game.House.items[this.engName] = this;

	// -------------------------------------------
	// TODO: Cheeki breeki!
	this.refreshEffects = function() {
		var currentItem = null;
		var newItem = null;

		for (var key in options.types) {
			if (!options.types[key].effect || !options.types[key].effect.register) {
				continue;
			}

			if (!newItem && Game.House.checkPlaced(options.engName, key)) {
				newItem = options.types[key];
			}

			if (!currentItem && options.types[key].effect.isRegistered) {
				currentItem = options.types[key];
			}
		}

		if (currentItem) {
			currentItem.effect.unregister(currentItem);
		}

		if (newItem) {
			newItem.effect.register(newItem);
		}
	}
	// -------------------------------------------

	this.url = function(options) {
		options = options || {
			group: this.group,
			item: this.engName
		};
		return Router.routes[this.type].path(options);
	}

	this.currentLevel = function() {
		return 0;
	}
}
game.extend(game.HouseItem, game.Item);

Game.House = {
	Collection: new Meteor.Collection('houseItems'),

	getValue: function() {
		return Game.House.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	getItem: function(group, id) {
		var items = Game.House.getValue();

		if (items && items[group] && items[group][id]) {
			return items[group][id];
		} else {
			return null;
		}
	},

	checkBought: function(group, id) {
		var data = Game.House.getValue();
		return (data && data[group] && data[group][id]) ? true : false;
	},

	checkPlaced: function(group, id) {
		var data = Game.House.getValue();
		return (data && data[group] && data[group][id] && data[group][id].isPlaced) ? true : false;
	},

	items: {}
}

// ------------------------------------
// TODO: Move to content

game.setToMenu = 'planet';
game.setToSide = 'house';

new game.HouseItem({
	name: 'Трон',
	engName: 'tron',
	types: {
		'consul': {
			name: 'Трон Консула',
			description: 'У каждого правителя должен быть свой трон. Этот трон был специально изготовлен для вашего аватара, Консул. Это один из символов вашей власти, вашей непоколебимой воли и справедливых решений. Вы - уникальны, и этот трон - ваш.',
			//effect: 'сидеть тепло и мягко'
			effect: new Game.Effect.Income({
				pretext: 'Приток населения ',
				aftertext: ' человек в час',
				priority: 1,
				affect: 'humans',
				result: function(level) {
					return 20;
				}
			})
		},
		'czar': {
			name: 'Царский Трон',
			description: 'Царский трон был создан специально для очень важных задниц, для самых важных задниц. На вашей планете, Консул, нет ни одной задницы важнее вашей. У вас есть уникальный шанс подчеркнуть это. Укажите всем на ваше превосходство, установив этот трон в свои покои.',
			//effect: 'приток населения +100 в час',
			effect: new Game.Effect.Income({
				pretext: 'Приток населения ',
				aftertext: ' человек в час',
				priority: 1,
				affect: 'humans',
				result: function(level) {
					return 100;
				}
			}),
			price: {
				credits: 1000
			}
		},
		'gameofthrones': {
			name: 'Трон Игра Престолов',
			description: 'Здесь не Вестерос, однако же проблем далеко не меньше. Нужно управлять целой планетой, судьба всего человечества зависит от Консула. Рептилоиды продолжают атаковать по всем фронтам и только самые стойкие из консулов смогут устоять. Железный Трон уникален и изготавливается именно для таких Правителей.',
			//effect: 'броня флота +2%',
			effect: new Game.Effect.Income({
				pretext: 'Приток населения ',
				aftertext: ' человек в час',
				priority: 1,
				affect: 'humans',
				result: function(level) {
					return 500;
				}
			}),
			price: {
				credits: 100500
			}
		}
	}
});

// ------------------------------------

}