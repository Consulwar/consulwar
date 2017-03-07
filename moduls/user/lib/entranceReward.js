initEntranceRewardLib = function() {

Game.EntranceReward = {
	Collection: new Meteor.Collection('entranceRewards'),

	getValue: function() {
		return Game.EntranceReward.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	getNextDay: function () {
		let rewards = Game.EntranceReward.getValue();

		if (rewards) {
			return rewards.history.length;
		}
		else {
			return 0;
		}
	}
};

Game.EntranceReward.rewards = [];
Game.EntranceReward.defaultRewards = undefined;

game.EntranceReward = function(options) {
	if (options.day === undefined) {
		throw new Meteor.Error('Ошибка в контенте', 'Не указан номер дня награды за вход');
	}

	_.extend(this, options);

	let day = options.day;

	// fill multiple awards if day is array
	if (_.isArray(day)) {
		let from = day[0];
		let to = day[1];
		for (let i = from; i <= to; i++) {
			addReward(i, this);
		}
	} else if (_.isNumber(day)) {
		addReward(day, this);
	}	else {
		Game.EntranceReward.defaultRewards = this;
	}
};

let addReward = function(day, reward) {
	if (Game.EntranceReward.rewards[day] !== undefined) {
		throw new Meteor.Error('Ошибка в контенте', 'Награда за вход с номером дня ' + day + ' уже существует');
	}

	Game.EntranceReward.rewards[day] = reward;
};

initEntranceRewardsContent();

};