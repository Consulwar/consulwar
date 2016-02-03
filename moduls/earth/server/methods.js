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

		if (lastTurn.actions[ actionName ] == undefined) {
			throw new Meteor.Error('Нет такого действия в этом ходу');
		}

		// get vote power
		var votePower = Game.User.getVotePower();

		if (votePower <= 0) {
			throw new Meteor.Error('Маленький ещё, подрости сначала');
		}

		// save vote
		lastTurn.users.push(user._id);
		lastTurn.actions[ actionName ] += votePower;
		lastTurn.totalVotePower += votePower;

		Game.EarthTurns.Collection.update({
			_id: lastTurn._id
		}, lastTurn);
	},

	'earth.sendReinforcement': function(units) {
		var currentTime = Math.floor(new Date().valueOf() / 1000);
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (!Game.Earth.checkReinforceTime(currentTime)) {
			throw new Meteor.Error('С 17:00 до 19:00 по МСК отправка войск недоступна');
		}

		if (!Game.SpaceEvents.checkCanSendFleet()) {
			throw new Meteor.Error('Слишком много флотов уже отправлено');
		}

		var totalCount = 0;

		for (var name in units) {
			var count = units[name];
			var unit = Game.Unit.items.army.ground[ name ];

			if (!unit || unit.type == 'mutual' || unit.currentLevel() < count) {
				throw new Meteor.Error('Иш ты чего задумал, шакал.');
			}

			totalCount += count;
		}

		if (totalCount == 0) {
			throw new Meteor.Error('Войска для отправки не выбраны');
		}

		// send reinforcements to current point
		Game.SpaceEvents.sendReinforcement({
			startTime: currentTime,
			durationTime: Meteor.settings.earth.reinforcementsDelay,
			units: { army: { ground: units } }
		});

		// add at once for quick debug
		// Game.Earth.addReinforcement( { army: { ground: units } } );

		// remove units
		for (var name in units) {
			Game.Unit.remove({
				group: 'ground',
				engName: name,
				count: units[name]
			});
		}
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
		'earth.nextTurn': Game.Earth.nextTurn,

		'earth.voteActionDev': function(actionName, votePower) {
			var lastTurn = Game.EarthTurns.getLast();
			var votePower = votePower || 1;

			if (!lastTurn || lastTurn.actions[ actionName ] == undefined) {
				return;
			}
			
			lastTurn.actions[ actionName ] += votePower;
			lastTurn.totalVotePower += votePower;

			Game.EarthTurns.Collection.update({
				_id: lastTurn._id
			}, lastTurn);
		}
	});
}

}