Meteor.methods({
	sendReinforcement: function(units) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('sendReinforcement: ', new Date(), user.login);

		var armyNames = _.map(Game.Unit.items.army.ground, function(value, key) {
			return key;
		});

		for (var i = 0; i < units.length; i++) {
			if (armyNames.indexOf(units[i]) == -1 || Game.Unit.items.army.ground[units[i]].type == 'global') {
				throw new Meteor.Error('Иш ты чего задумал, шакал.');
			}
		}

		Game.Point.initialize();

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

		Game.Point.addReinforcement(units);

		Game.Resources.add({
			honor: honor
		})

		return honor;
	}
});