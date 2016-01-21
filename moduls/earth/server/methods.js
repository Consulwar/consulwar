initEarthServerMethods = function() {

Meteor.methods({
	'earth.voteAction': function(actionName) {
		// check user
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		// check turn
		var lastTurn = Game.EarthTurns.getLast();

		if (!lastTurn) {
			throw new Meteor.Error('Не создано ни одного хода');
		}

		if (lastTurn.users.indexOf(user._id) >= 0) {
			throw new Meteor.Error('Вы уже голосовали в этом ходу');
		}

		if (!lastTurn.actions[ actionName ]) {
			throw new Meteor.Error('Нет такого действия в этом ходу');
		}

		// get vote power
		// TOOD: Get user vote power!
		var votePower = 1;

		// save vote
		lastTurn.users.push(user._id);
		lastTurn.actions[ actionName ] += votePower;

		Game.EarthTurns.Collection.update({
			_id: lastTurn._id
		}, lastTurn);
	},

	'earth.sendReinforcement': function(units) {
		// TODO: fix this method!
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		var armyNames = _.map(Game.Unit.items.army.ground, function(value, key) {
			return key;
		});

		for (var i = 0; i < units.length; i++) {
			if (armyNames.indexOf(units[i]) == -1 || Game.Unit.items.army.ground[units[i]].type == 'mutual') {
				throw new Meteor.Error('Иш ты чего задумал, шакал.');
			}
		}

		var currentValue = Game.Unit.getValue();

		units = _.map(_.uniq(units), function(name) {
			return {
				engName: name,
				group: 'ground',
				count: currentValue.ground ? currentValue.ground[name] || 0 : 0
			}
		});

		if (units.length == 0) {
			throw new Meteor.Error('Войска для отправки не выбраны');
		}

		// send reinforcements to current point
		// TODO: Add units after delay!
		Game.Earth.addReinforcement( { army: { ground: units } } );

		// calculate and apply honor
		var honor = 0;
		for (var i = 0; i < units.length; i++) {
			var count = units[i].count;
			if (count) {
				if (['hbhr', 'lost'].indexOf(units[i].engName) != -1) {
					honor += Game.Resources.calculateHonorFromReinforcement(game.army.heroes[units[i].engName].price(count))
				} else {
					honor += Game.Resources.calculateHonorFromReinforcement(game.army.ground[units[i].engName].price(count))
				}
			}

			Game.Unit.remove(units[i]);
		}

		Game.Resources.add({
			honor: honor
		})

		return honor;
	}
});

// ----------------------------------------------------------------------------
// Public methods only for development!
// ----------------------------------------------------------------------------

if (process.env.NODE_ENV == 'development') {
	Meteor.methods({
		'earth.importZones': Game.Earth.importZones,
		'earth.linkZones': Game.Earth.linkZones,
		'earth.unlinkZones': Game.Earth.unlinkZones,
		'earth.nextTurn': Game.Earth.checkTurn
	});
}

}