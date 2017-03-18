initResearchLib = function() {

game.Research = function(options){
	game.Research.superclass.constructor.apply(this, arguments);

	if (Game.Research.items[this.group][this.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется исследование ' + this.group + ' ' + this.engName);
	}

	Game.Research.items[this.group][this.engName] = this;

	this.url = function(options) {
		options = options || {
			group: this.group,
			item: this.engName
		};
		
		return Router.routes[this.type].path(options);
	};

	this.icon = function() {
		return '/img/game/research/' + this.group + '/i/' + this.engName + '.png';
	};

	this.image = function() {
		return '/img/game/research/' + this.group + '/' + this.engName + '.jpg';
	};

	this.type = 'research';
};
game.extend(game.Research, game.Item);

Game.Research = {
	Collection: new Meteor.Collection('researches'),

	getValue: function(uid) {
		return Game.Research.Collection.findOne({
			user_id: uid === undefined ? Meteor.userId() : uid
		});
	},

	get: function(group, name) {
		var researches = Game.Research.getValue();

		if (researches && researches[group] && researches[group][name]) {
			return researches[group][name];
		} else {
			return 0;
		}
	},

	has: function(group, name, level) {
		level = level || 1;
		return Game.Research.get(group, name) >= level;
	},

	items: {
		evolution: {},
		fleetups: {}
	}
};

initResearchContent();

};