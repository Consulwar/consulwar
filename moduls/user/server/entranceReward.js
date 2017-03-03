initEntranceRewardServer = function() {

initEntranceRewardLib();

Game.EntranceReward.Collection._ensureIndex({
	userId: 1
});

Game.EntranceReward.rewards = [];

game.EntranceReward = function(options) {
	if (options.seqNum === undefined) {
		throw new Meteor.Error('Ошибка в контенте', 'Не указан порядковый номер награды за вход');
	}

	if (Game.EntranceReward.rewards[options.seqNum] !== undefined) {
		throw new Meteor.Error('Ошибка в контенте', 'Награда за вход с порядковым номером ' + options.seqNum + ' уже существует');
	}

	_.extend(this, options);

	Game.EntranceReward.rewards[this.seqNum] = this;
};

initEntranceRewardsContent();

Game.EntranceReward.actualize = function() {
	let user = Meteor.user();

	if (!user || !user._id) {
		throw new Meteor.Error('Требуется авторизация');
	}

	if (user.blocked === true) {
		throw new Meteor.Error('Аккаунт заблокирован');
	}

	let currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	if (!user.lastRewardTime) {
		let createdDate = new Date(user.createdAt);
		createdDate.setHours(0, 0, 0, 0);

		if (createdDate.getTime() === currentDate.getTime()) {
			return;
		}
	}
	else {
		let lastRewardDate = new Date(user.lastRewardTime);
		lastRewardDate.setHours(0, 0, 0, 0);

		if (lastRewardDate.getTime() === currentDate.getTime()) {
			return;
		}
	}

	let nextSeqNum = Game.EntranceReward.getNextSeqNum();

	let reward = Game.EntranceReward.rewards[nextSeqNum];

	if (reward === undefined) {
		return;
	}

	let now = new Date();
	let record = {
		date: now,
		reward: reward.reward
	};

	if (nextSeqNum === 0) {
		Game.EntranceReward.Collection.insert({
			userId: user._id,
			history: [record],
		});
	}
	else {
		Game.EntranceReward.Collection.update({ userId: user._id }, {$push: {history: record}});
	}

	Meteor.users.update({
		_id: user._id
	}, {
		$set: {
			lastRewardTime: now
		}
	});
};

};