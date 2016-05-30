initUnitServerMethods = function() {

Meteor.methods({
	'unit.build': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('unit.build: ', new Date(), user.username);

		check(options, Object);
		check(options.group, String);
		check(options.engName, String);
		check(options.count, Number);

		options.count = parseInt(options.count, 10);

		if (options.count < 1 || _.isNaN(options.count)) {
			throw new Meteor.Error('Не умничай');
		}

		Meteor.call('actualizeGameInfo');

		var item = Game.Unit.items.army[options.group] && Game.Unit.items.army[options.group][options.engName];

		if (!item || !item.canBuild(options.count)) {
			throw new Meteor.Error('Не достаточно ресурсов');
		}

		if (item.maxCount !== undefined) {
			var countDelta = item.maxCount - item.totalCount();
			if (countDelta < 1) {
				throw new Meteor.Error('Достигнуто максимальное количество юнитов данного типа');	
			}

			if (countDelta < options.count) {
				options.count = countDelta;
			}
		}

		var set = {
			type: item.type,
			group: item.group,
			engName: item.engName,
			count: options.count
		};

		var price = item.price(options.count);
		set.time = price.time;

		var isTaskInserted = Game.Queue.add(set);
		if (!isTaskInserted) {
			throw new Meteor.Error('Не удалось начать подготовку юнитов');
		}

		Game.Resources.spend(price);
		
		Meteor.users.update({
			_id: user._id
		}, {
			$inc: {
				rating: Game.Resources.calculateRatingFromResources(price)
			}
		});
	},

	'battleHistory.getPage': function(page, count, isEarth) {
		check(page, Match.Integer);
		check(count, Match.Integer);

		var user = Meteor.user();
		
		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('battleHistory.getPage: ', new Date(), user.username);

		if (count > 100) {
			throw new Meteor.Error('Много будешь знать - скоро состаришься');
		}

		return Game.BattleHistory.Collection.find({
			user_id: isEarth ? 'earth' : user._id
		}, {
			sort: { timestamp: -1 },
			skip: (page > 0) ? (page - 1) * count : 0,
			limit: count
		}).fetch();
	},

	'battleHistory.getById': function(id, isEarth) {
		check(id, String);

		var user = Meteor.user();
		
		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('battleHistory.getById: ', new Date(), user.username);

		return Game.BattleHistory.Collection.findOne({
			_id: id,
			user_id: isEarth ? 'earth' : user._id
		});
	}
});

};