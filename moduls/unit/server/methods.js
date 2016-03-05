initUnitServerMethods = function(){

Meteor.methods({
	'unit.build': function(options) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('unit: ', new Date(), user.login);

		check(options, Object);
		check(options.group, String);
		check(options.engName, String);
		check(options.count, Number);

		options.count = parseInt(options.count);


		if (options.count < 1 || _.isNaN(options.count)) {
			throw new Meteor.Error('Не умничай');
		}

		Meteor.call('actualizeGameInfo');

		var item = Game.Unit.items.army[options.group] && Game.Unit.items.army[options.group][options.engName];

		if (item && item.canBuild(options.count)) {
			var set = {
				type: item.type,
				group: item.group,
				engName: item.engName,
				count: options.count
			};

			if (set.level > item.maxLevel) {
				throw new Meteor.Error("Исследование уже максимального уровня");
			}

			var price = item.price(options.count);
			
			set.time = price.time;

			Game.Queue.add(set);

			set = {};

			var rating = 0;

			if (price['metals']) {
				rating += price['metals'];
			}

			if (price['crystals']) {
				rating += price['crystals'] * 3;
			}

			if (price['humans']) {
				rating += price['humans'] * 4;
			}

			if (price['honor']) {
				rating += price['honor'] * 5;
			}

			set['rating'] = (user.rating || 0) + Math.floor(rating / 100);

			Game.Resources.spend(price);

			Meteor.users.update({'_id': Meteor.userId()}, {
				$set: set
			}); 
		} else {
			throw new Meteor.Error('Не достаточно ресурсов');
		}
	},

	'battleHistory.getPage': function(page, count) {
		check(page, Match.Integer);
		check(count, Match.Integer);

		var user = Meteor.user();
		
		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		var result = Game.BattleHistory.Collection.find({
			user_id: user._id
		}, {
			sort: {timestamp: -1},
			skip: (page > 0) ? (page - 1) * count : 0,
			limit: count
		});

		return {
			battles: result.fetch(),
			count: result.count()
		}
	},

	'battleHistory.getById': function(id) {
		check(id, String);

		var user = Meteor.user();
		
		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		return Game.BattleHistory.Collection.findOne({
			_id: id,
			user_id: user._id
		});
	}
})

}