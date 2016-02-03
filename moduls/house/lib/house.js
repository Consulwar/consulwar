initHouseLib = function() {

game.HouseItem = function(options) {
	this.doNotRegisterEffect = true;

	game.HouseItem.superclass.constructor.apply(this, arguments);

	this.type = 'house';
	this.subgroup = options.subgroup;

	Game.House.items[this.subgroup][this.engName] = this;

	this.url = function(options) {
		options = options || {
			group: this.group,
			subgroup: this.subgroup,
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

	getPlacedItems: function() {
		var items = [];
		var data = Game.House.getValue();
		
		for (var group in data) {
			if (!Game.House.items[group]) {
				continue;
			}

			for (var id in data[group]) {
				if (!Game.House.items[group][id]) {
					continue;
				}

				if (data[group][id].isPlaced) {
					items.push(Game.House.items[group][id]);
				}
			}
		}

		return items;
	},

	checkBought: function(group, id) {
		var data = Game.House.getValue();
		return (data && data[group] && data[group][id]) ? true : false;
	},

	checkPlaced: function(group, id) {
		var data = Game.House.getValue();
		return (data && data[group] && data[group][id] && data[group][id].isPlaced) ? true : false;
	},

	items: {
		tron: {}
	}
}

// ------------------------------------
// TODO: Move to content

game.setToMenu = 'planet';
game.setToSide = 'house';

new game.HouseItem({
	subgroup: 'tron',
	engName: 'consul',
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
});

new game.HouseItem({
	subgroup: 'tron',
	engName: 'czar',
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
});

new game.HouseItem({
	subgroup: 'tron',
	engName: 'gameofthrones',
	name: 'Трон Игра Престолов',
	description: 'Здесь не Вестерос, однако же проблем далеко не меньше. Нужно управлять целой планетой, судьба всего человечества зависит от Консула. Рептилоиды продолжают атаковать по всем фронтам и только самые стойкие из консулов смогут устоять. Железный Трон уникален и изготавливается именно для таких Правителей.',
	//effect: 'броня флота +2%',
	effect: new Game.Effect.Military({
		pretext: 'Броня флота +',
		aftertext: '%',
		condition: {
			type: 'unit',
			group: 'fleet'
		},
		priority: 2,
		affect: 'life',
		result: function(level) {
			return 25;
		}
	}),
	price: {
		credits: 100500
	}
});

// ------------------------------------

}