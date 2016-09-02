initStatisticServer = function() {

initStatisticLib();

Game.Statistic.Collection._ensureIndex({
	user_id: 1
});

Meteor.users._ensureIndex({
	rating: 1
});

Game.Statistic.Collection._ensureIndex({
	'research.total': 1
});

Game.Statistic.Collection._ensureIndex({
	'chat.messages': 1
});

Game.Statistic.Collection._ensureIndex({
	'reinforcements.sent.total': 1
});

Game.Statistic.Collection._ensureIndex({
	'resources.gained.honor': 1
});

Game.Statistic.initialize = function(user) {
	var statistic = Game.Statistic.Collection.findOne({
		user_id: user._id
	});

	if (!statistic) {
		Game.Statistic.Collection.insert({
			user_id: user._id,
			username: user.username
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
	var bulkOp = Game.Statistic.Collection.rawCollection().initializeUnorderedBulkOp();
	bulkOp.find({ user_id: { $ne: 'system' } }).update({ $inc: increment });
	bulkOp.execute(function(err, data) {});
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

	set['promocode.total'] = Game.PromoCode.Collection.find({}).count();

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
	set['payment.income'] = Game.Payment.Income.Collection.find({
		user_id: user._id
	}).count();

	set['payment.expense'] = Game.Payment.Expense.Collection.find({
		user_id: user._id
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
	},

	'statistic.getUserPositionInRating': function(type, selectedUserName) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(selectedUserName, String);
		check(type, String);
		
		var selectedUser = Meteor.users.findOne({ username: selectedUserName });
			
		if (!selectedUser) {
			throw new Meteor.Error('Пользователя с именем ' + selectedUserName + ' не существует');
		}
		
		console.log('statistic.getUserPositionInRating: ', new Date(), user.username);
		
		var position;
		var total;
		var sortField = Game.Statistic.getSortFieldForType(type);

		if (!sortField) {
			throw new Meteor.Error('Несуществующий тип статистики');
		}

		if (type == "general") {
			position = Meteor.users.find({
				rating: { $gt: selectedUser.rating }
			}, {
				fields: {
					username: 1,
					rating: 1
				},
				sort: {rating: -1}
			}).count();

			total = Meteor.users.find({
				rating: { $gt: 0 }
			}, {
				fields: {
					username: 1,
					rating: 1
				},
				sort: {rating: -1}
			}).count();
		} else {
			var selectedUserStatistic = Game.Statistic.Collection.findOne({ user_id: selectedUser._id });
			var selector = {};
			selector[sortField] = { 
				$gt: Game.Statistic.getUserValue(sortField, selectedUserStatistic) 
			};

			var fields = {
				username: 1
			};
			fields[sortField] = 1;

			var sort = {};
			sort[sortField] = -1;

			position = Game.Statistic.Collection.find(selector, {
				fields: fields,
				sort: sort
			}).count();

			selector[sortField] = { 
				$gt: 0 
			};

			total = Game.Statistic.Collection.find(selector, {
				fields: fields,
				sort: sort
			}).count();
		}

		return {
			total: total,
			position: position + 1
		};
	},

	'statistic.getPageInRating': function(type, page, count) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('statistic.getPageInRating: ', new Date(), user.username);

		check(page, Match.Integer);
		check(count, Match.Integer);
		check(type, String);

		if (count > 100) {
			throw new Meteor.Error('Много будешь знать - скоро состаришься');
		}

		var sortField = Game.Statistic.getSortFieldForType(type);

		if (!sortField) {
			throw new Meteor.Error('Несуществующий тип статистики');
		}

		var result;

		if (type == "general") {
			result = Meteor.users.find({
				rating: { $gt: 0 }
			}, {
				fields: {
					username: 1,
					rating: 1
				},
				sort: {rating: -1},
				skip: (page > 0) ? (page - 1) * count : 0,
				limit: count
			});
		} else {
			var selector = {};
			selector[sortField] = { $gt: 0 };

			var fields = {
				username: 1
			};
			fields[sortField] = 1;

			var sort = {};
			sort[sortField] = -1;

			result = Game.Statistic.Collection.find(selector, {
				fields: fields,
				sort: sort,
				skip: (page > 0) ? (page - 1) * count : 0,
				limit: count
			});
		}

		return {
			users: result.fetch(),
			count: result.count()
		};
	},

	'statistic.getUserStatistic': function(userName) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(userName, String);

		var selectedUser = Meteor.users.findOne({username: userName});
		
		if (!selectedUser || !selectedUser._id) {
			throw new Meteor.Error('Пользователь не найден');
		}


		var statistic = Game.Statistic.Collection.findOne({
			user_id: selectedUser._id
		}, {
			fields: {
				user_id: 1,
				resources: 1,
				building: 1,
				research: 1,
				quests: 1,
				units: 1,
				reptiles: 1,
				reinforcements: 1,
				cosmos: 1,
				battle: 1,
				chat: 1,
				mail: 1,
				investments: 1,
				promocode: 1
			}
		});

		if (statistic.resources.spent) {
			delete statistic.resources.spent.credits;
			delete statistic.resources.spent.total;
		}
		if (statistic.resources.gained) {
			delete statistic.resources.gained.credits;
			delete statistic.resources.gained.total;
		}
		if (statistic.investments) {
			delete statistic.investments.credits;
			delete statistic.investments.total;
		}

		return statistic;
	},

	'statistic.getUserInfo': function(userName) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(userName, String);

		var userInfo = Meteor.users.findOne({
			username: userName
		}, {
			fields: {
				username: 1,
				achievements: 1,
				'settings.chat.icon': 1,
				createdAt: 1,
				'status.lastLogin.date': 1
			}
		});

		if (!userInfo || !userInfo._id) {
			throw new Meteor.Error('Пользователь не найден');
		}

		return userInfo;
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
					payment: 1,
					investments: 1,
					promocode: 1
				}
			});
		}
	}
});

initStatisticAchievementsServer();

};