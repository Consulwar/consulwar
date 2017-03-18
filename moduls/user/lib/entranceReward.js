initEntranceRewardLib = function() {

Game.EntranceReward = {
	Collection: new Meteor.Collection('entranceRewards'),

	getValue: function() {
		return Game.EntranceReward.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	perPage: 60,

	items: [],
	ranks: {},
	default: null
};

game.EntranceRewardRank = function (options) {
	if (Game.EntranceReward.ranks[options.engName] !== undefined) {
		throw new Meteor.Error('Ошибка в контенте', 'Ранг награда с engName ' + options.engName + ' уже существует');
	}

	_.extend(this, options);

	this.icon = function() {
		return '/img/game/entrancereward/' + this.engName + '.png';
	}

	Game.EntranceReward.ranks[this.engName] = this;

	this.type = 'rank';
};

};