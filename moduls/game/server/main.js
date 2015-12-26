//BrowserPolicy.framing.allowAll();

BrowserPolicy.content.allowOriginForAll('*');
BrowserPolicy.content.allowEval('*')
//heapdump = Meteor.npmRequire('heapdump');



SyncedCron.config({
	log: true,
	collectionName: 'cronHistory',
	utc: false,
	collectionTTL: 604800
});

Meteor.startup(function () {
	initResourcesServer();
	initBuildingServer();
	initResearchServer();
	initUnitServer();

	initMailServer();

	initQuestServer();
});

Meteor.methods({
	isLoginExists: function(login) {
		check(login, String);

		if (Meteor.users.findOne({login: login})) {
			return true;
		} else {
			return false;
		}
	},

	changePlanetName: function(name) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('changePlanetName: ', new Date(), user.login);

		check(name, String);
		name = name.trim();

		check(name, Match.Where(function(name) {
			return name.length > 0 && name.length <= 16;
		}));

		Meteor.users.update({'_id': Meteor.userId()}, {
			$set: {
				planetName: name
			}
		});
	},

	actualizeGameInfo: function() {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('Actualize: ', new Date(), user.login);

		Game.Resources.updateWithIncome();

		Game.Queue.checkAll();

		Meteor.call('updateQuests');

		return true;
	},

	build: function(options) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('build: ', new Date(), user.login);

		check(options, Object);
		check(options.menu, String);
		check(options.side, String);
		check(options.item, String);

		Meteor.call('actualizeGameInfo');

		var user = Meteor.user();
		var item = game[options.menu] && game[options.menu][options.side] && game[options.menu][options.side][options.item];
/*
		console.log('Попытка построить', options.item);
		console.log(options);
		console.log(item);
		console.log(item.canBuild());
		console.log(!Game.Queue.isBusy(options.side));
*/
		if (item && !Game.Queue.isBusy(item.group) && item.canBuild()) {

			var resources = Game.Resources.getValue();

			var set = {
				type: item.type,
				group: item.group,
				engName: item.engName,
				//time: ,
				//level: ,
				//count
			};

			/*var setName = 'game.' + options.menu + '.' + options.side + '.building';
			set[setName] = {
				name: game[options.menu][options.side][options.item].name,
				engName: options.item,
				startTime: Math.floor(new Date().valueOf() / 1000)
			}*/

			if (item.type != 'unit') {
				if (item.currentLevel() + 1 > item.maxLevel) {
					throw new Meteor.Error("Здание уже максимального уровня");
				}

				// По факту надо переименовать currentLevel, т.к. он возвращает значение поля
				// а оно необязательно уровень :-)
				//set[setName].level = item.currentLevel() + 1;
				set.level = item.currentLevel() + 1;
				var price = item.price();
				//set[setName].finishTime = Math.floor((new Date().valueOf() / 1000) + price.time);
			} else {
				check(options.count, Number);
				options.count = parseInt(options.count);
				if (options.count < 1 || _.isNaN(options.count)) {
					throw new Meteor.Error('Не умничай');
					options.count = 1;
				}

				if (!item.canBuild(options.count)) {
					throw new Meteor.Error('Не достаточно ресурсов');
				}

				//set[setName].count = item.currentLevel() + options.count;
				set.count = options.count;
				var price = item.price(options.count);
				//set[setName].finishTime = Math.floor((new Date().valueOf() / 1000) + price.time);
			}
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

			/*for (var res in price) {
				if (res != 'time') {
					set['game.resources.' + res + '.amount'] = resources[res].amount - price[res];
				}
			}*/
			Game.Resources.spend(price);

			//console.log(set);

			Meteor.users.update({'_id': Meteor.userId()}, {
				$set: set
			}); 
		} else {
			throw new Meteor.Error('Строительство невозможно');
		}
	},

	getCurrentTime: function() {
		return new Date().valueOf();
	}
});

Meteor.publish('game', function () {
	if (this.userId) {
		return Meteor.users.find({_id: this.userId}, {
			fields: {
				game: 1,
				login: 1,
				planetName: 1,
				role: 1,
				blocked: 1,
				rating: 1
			}
		});
	}
});
/*
Meteor.publish('resources', function () {
	if (this.userId) {
		return Meteor.users.find({_id: this.userId}, {
			fields: {
				'game.resources': 1
			}
		});
	} else {
		this.ready();
	}
});*/