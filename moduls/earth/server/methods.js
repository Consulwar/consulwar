initEarthServerMethods = function() {
'use strict';

Meteor.methods({
	'earth.sendReinforcement': function(units, cardsObject, zoneName) {
		const user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		Game.Log.method('earth.sendReinforcement');

		const currentTime = Game.getCurrentTime();

		if (!Game.SpaceEvents.checkCanSendFleet()) {
			throw new Meteor.Error('Слишком много флотов уже отправлено');
		}

		let army = Game.EarthUnits.get();
		let targetZoneName;

		if (army) {
			targetZoneName = army.zoneName;
		} else {
			check(zoneName, String);

			let zone = Game.EarthZones.getByName(zoneName);
			if (!zone) {
				throw new Meteor.Error('Не существует указанная зона отправки.');
			}
			if (zone.isEnemy) {
				throw new Meteor.Error('Зона не доступна для отправки.');
			}
			targetZoneName = zoneName;
		}

		let cardList = [];
		let protectedHonor = 0;

		if (cardsObject) {
			check(cardsObject, Object);

			if (!Game.Cards.canUse(cardsObject, user)) {
				throw new Meteor.Error('Карточки недоступны для применения');
			}

			cardList = Game.Cards.objectToList(cardsObject);

			if (cardList.length === 0) {
				throw new Meteor.Error('Карточки недоступны для применения');
			}

			let result = Game.Effect.Special.getValue(true, { engName: 'instantReinforcement' }, cardList);

			protectedHonor = result.protectedHonor;

			if (!_.isNumber(protectedHonor) || protectedHonor <= 0) {
				throw new Meteor.Error('Карточки недоступны для применения');
			}
		}

		let totalCount = 0;
		let honor = 0;

		for (let name in units) {
      if (units.hasOwnProperty(name)) {
        units[name] = parseInt( units[name], 10 );

        const count = units[name];
        const unit = Game.Unit.items.army.ground[name];

        if (!unit || unit.type === 'mutual' || unit.currentLevel() < count || count <= 0) {
          throw new Meteor.Error('Ишь ты, чего задумал, шакал.');
        }

        if (protectedHonor) {
          honor += Game.Resources.calculateHonorFromReinforcement( unit.price(count) );
        }

        totalCount += count;
      }
		}

		if (totalCount === 0) {
			throw new Meteor.Error('Войска для отправки не выбраны');
		}

		if (protectedHonor && honor > protectedHonor) {
			throw new Meteor.Error('Карточки нельзя применить');
		}

		// send reinforcements to current point
		Game.SpaceEvents.sendReinforcement({
			startTime: currentTime,
			durationTime: Game.Earth.REINFORCEMENTS_DELAY,
			units: { army: { ground: units } },
			protectAllHonor: protectedHonor > 0,
			targetZoneName
		});

		if (cardList.length !== 0) {
			for (let card of cardList) {
				Game.Cards.activate(card, user);
			}

			Game.Cards.spend(cardsObject);
		}

		// remove units
		const stats = {};
		stats['reinforcements.sent.total'] = 0;

		for (let name in units) {
			if (units.hasOwnProperty(name)) {
				Game.Unit.remove({
					group: 'ground',
					engName: name,
					count: units[name]
				});

				stats['reinforcements.sent.army.ground.' + name] = units[name];
				stats['reinforcements.sent.total'] += units[name];
			}
		}

		// save statistic
		Game.Statistic.incrementUser(user._id, stats);
	},

	'earth.moveArmy': function(targetZone) {
		// check user
		const user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		Game.Log.method('earth.moveArmy');

		check(targetZone, String);

		let army = Game.EarthUnits.get();

		if (!army) {
			throw new Meteor.Error('Армия отсутствует.');
		}

		if (!Game.EarthZones.getByName(targetZone)) {
			throw new Meteor.Error('Не существует указанная зона перемещения.');
		}

		let armyZone = Game.EarthZones.getByName(army.zoneName);

		if (targetZone !== army.zoneName && armyZone.links.indexOf(targetZone) === -1) {
			throw new Meteor.Error('У указанной зоны перемещения нет соединения с текущей.');
		}

		Game.EarthUnits.Collection.update({
			user_id: user._id
		}, {
			$set: {
				targetZone
			}
		});
	},
});

// ----------------------------------------------------------------------------
// Public methods only for development!
// ----------------------------------------------------------------------------

if (process.env.NODE_ENV === 'development') {
	Meteor.methods({
		'earth.importZones': Game.Earth.importZones,
		'earth.linkZones': Game.Earth.linkZones,
		'earth.unlinkZones': Game.Earth.unlinkZones,
		'earth.nextTurn': Game.Earth.nextTurn,
	});
}

};