initUnitServerSquad = function() {

initSquadLib();

Game.Squad.Collection._ensureIndex({
	user_id: 1
});


Game.Squad.setName = function(slot, name) {
	Game.Squad.Collection.upsert({
		user_id: Meteor.userId(),
		slot
	}, {
		$set: {
			name: name
		}
	});
};

Game.Squad.setIcon = function(slot, group, engName) {
	Game.Squad.Collection.upsert({
		user_id: Meteor.userId(),
		slot
	}, {
		$set: {
			icon: group + '/' + engName
		},
		$setOnInsert: {
			name: 'Отряд ' + slot
		}
	});
};

Game.Squad.setUnits = function(slot, units) {
	Game.Squad.Collection.upsert({
		user_id: Meteor.userId(),
		slot
	}, {
		$set: {
			units: units
		},
		$setOnInsert: {
			name: 'Отряд ' + slot
		}
	});
};

Game.Unit.remove = function(slot) {
	Game.Squad.Collection.remove({
		user_id: Meteor.user_id(),
		slot
	});
};


Meteor.methods({
	'squad.setName': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		check(options, Match.ObjectIncluding({
			slot: Match.Where(function(slot) {
				check(slot, Match.Integer);
				if (slot > 0 && slot < Game.Squad.config.slots.total) {
					return true;
				} else {
					throw new Match.Error('Какой-какой слот? Ну неее…');
				}
			}),
			name: String
		}));

		if (options.slot > Game.Squad.config.slots.free && !Game.hasPremium()) {
			throw new Meteor.Error('Данный отряд доступен долько обладателям премиум-аккаунта.');
		}

		if (options.name.length > 10) {
			throw new Meteor.Error('Максимум 10 символов для названия отряда');
		}

		Game.Squad.setName(options.slot, options.name);
	}, 

	'squad.setIcon': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		check(options, Match.ObjectIncluding({
			slot: Match.Where(function(slot) {
				check(slot, Match.Integer);
				if (slot > 0 && slot < Game.Squad.config.slots.total) {
					return true;
				} else {
					throw new Match.Error('Какой-какой слот? Ну неее…');
				}
			}),
			group: String,
			name: String
		}));

		if (options.slot > Game.Squad.config.slots.free && !Game.hasPremium()) {
			throw new Meteor.Error('Данный отряд доступен долько обладателям премиум-аккаунта.');
		}

		if (Game.Icons.canUseIcon(options.group, options.name)) {
			Game.Squad.setIcon(options.slot, options.group, options.name);
		}
	},

	'squad.setUnits': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		check(options, Match.ObjectIncluding({
			slot: Match.Where(function(slot) {
				check(slot, Match.Integer);
				if (slot > 0 && slot < Game.Squad.config.slots.total) {
					return true;
				} else {
					throw new Match.Error('Какой-какой слот? Ну неее…');
				}
			}),
			units: Match.Where(function(units) {
				var possibleUnits = _.keys(Game.Unit.items.army.fleet);
				for (let engName in units) {
					if (possibleUnits.indexOf(engName) == -1) {
						throw new Match.Error('Ну и что вот ты пытался сделать? Вот честно.');
					}
					check(units[engName], Match.Integer);
				}
				return true;
			})
		}));

		if (options.slot > Game.Squad.config.slots.free && !Game.hasPremium()) {
			throw new Meteor.Error('Данный отряд доступен долько обладателям премиум-аккаунта.');
		}

		Game.Squad.setUnits(options.slot, options.units);
	},

	'squad.remove': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		check(options, Match.ObjectIncluding({
			slot: Match.Where(function(slot) {
				check(slot, Match.Integer);
				if (slot > 0 && slot < Game.Squad.config.slots.total) {
					return true;
				} else {
					throw new Match.Error('Какой-какой слот? Ну неее…');
				}
			})
		}));

		if (options.slot > Game.Squad.config.slots.free && !Game.hasPremium()) {
			throw new Meteor.Error('Данный отряд доступен долько обладателям премиум-аккаунта.');
		}


	}
});

Meteor.publish('squad', function () {
	if (this.userId) {
		return Game.Squad.Collection.find({
			user_id: this.userId
		});
	}
});

};