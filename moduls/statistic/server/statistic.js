initStatisticServer = function() {
	
initStatisticLib();

Game.Statistic.Collection._ensureIndex({
	user_id: 1
});

Game.Statistic.initialize = function(user) {
	var statistic = Game.Statistic.Collection.findOne({
		user_id: user._id
	});

	if (!statistic) {
		Game.Statistic.Collection.insert({
			user_id: user._id
		});
	}
};

Game.Statistic.incrementUser = function(uid, increment) {
	Game.Statistic.Collection.update({
		user_id: uid
	}, {
		$inc: increment
	});
};

Game.Statistic.incrementAllUsers = function(increment) {
	Game.Statistic.Collection.update({
		user_id: { $ne: 'system' }
	}, {
		$inc: increment
	}, {
		multi: true
	});
};

Game.Statistic.incrementGame = function(increment) {
	Game.Statistic.Collection.upsert({
		user_id: 'system'
	}, {
		$inc: increment
	});
};

Game.Statistic.fixGame = function() {
	// fix only essential for GUI values!
	var set = {};

	set['mail.complaint'] = Game.Mail.Collection.find({
		complaint: true
	}).count();

	set['battle.total'] = Game.BattleHistory.Collection.find({
		user_id: 'earth'
	}).count();

	Game.Statistic.Collection.upsert({
		user_id: 'system'
	}, {
		$set: set
	});
};

Game.Statistic.fixUser = function(userId) {
	var user = Meteor.users.findOne({
		_id: userId
	});

	if (!user) {
		throw new Meteor.Error('Пользователь не существует');
	}

	// fix only essential for GUI values!
	var set = {};

	// mail
	set['mail.current'] = Game.Mail.Collection.find({
		owner: user._id,
		deleted: { $ne: true }
	}).count();

	set['mail.total'] = Game.Mail.Collection.find({
		owner: user._id
	}).count();

	// payment
	set['payment.income'] = Game.Payment.Collection.find({
		user_id: user._id,
		income: true
	}).count();

	set['payment.expense'] = Game.Payment.Collection.find({
		user_id: user._id,
		income: { $ne: true }
	}).count();

	// cosmos
	set['battle.total'] = Game.BattleHistory.Collection.find({
		user_id: user._id
	}).count();

	Game.Statistic.Collection.upsert({
		user_id: user._id
	}, {
		$set: set
	});
};

Meteor.methods({
	'statistic.fixGame': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('statistic.fixGame: ', new Date(), user.username);

		if (['admin'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Нужны парва администратора');
		}

		Game.Statistic.fixGame();
	},

	'statistic.fixUser': function(username) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('statistic.fixUser: ', new Date(), user.username);

		if (['admin', 'helper'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Нужны парва администратора или модератора');
		}

		check(username, String);

		var target = Meteor.users.findOne({
			username: username
		});

		if (!target) {
			throw new Meteor.Error('Пользователя с именем ' + username + ' не существует');
		}

		Game.Statistic.fixUser(target._id);
	}
});

Meteor.publish('statistic', function() {
	if (this.userId) {

		var user = Meteor.users.findOne({ _id: this.userId });
		var isAdmin = user && ['admin', 'helper'].indexOf(user.role) >= 0;

		if (isAdmin) {
			return Game.Statistic.Collection.find({
				$or: [
					{ user_id: this.userId },
					{ user_id: 'system' }
				]
			});
		} else {
			return Game.Statistic.Collection.find({
				$or: [
					{ user_id: this.userId },
					{ user_id: 'system' }
				]
			}, {
				fields: {
					user_id: 1,
					resources: 1,
					building: 1,
					research: 1,
					cards: 1,
					quests: 1,
					units: 1,
					reptiles: 1,
					reinforcements: 1,
					cosmos: 1,
					battle: 1,
					chat: 1,
					mail: 1,
					payment: 1
				}
			});
		}
	}
});

};