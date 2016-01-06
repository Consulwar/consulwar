initCosmosEventsServer = function() {

Game.SpaceEvents.update = function(event) {
	if (!event._id || !event.user_id) {
		return null;
	}

	var data = _.omit(event, '_id');

	Game.SpaceEvents.Collection.update({
		_id: event._id
	}, {
		$set: data
	}); 
	
	return data;
}

Game.SpaceEvents.add = function(event) {
	event.user_id = Meteor.userId();
	return Game.SpaceEvents.Collection.insert(event);
}

Game.SpaceEvents.updateEvent = function(event) {
	serverTime = Math.floor( new Date().valueOf() / 1000 );

	switch (event.type) {
		case Game.SpaceEvents.EVENT_SHIP:
			Game.SpaceEvents.updateShip(serverTime, event);
			break;
	}

	if (event.timeEnd <= serverTime) {
		Game.SpaceEvents.Collection.remove({ _id: event._id })
	}
}

// ----------------------------------------------------------------------------
// Ship events
// ----------------------------------------------------------------------------

Game.SpaceEvents.sendShip = function(options) {
	// mandatory options
	if (options.startPosition === undefined) {
		throw new Meteor.Error('Не задана точка старта полета');
	}

	if (options.targetPosition === undefined) {
		throw new Meteor.Error('Не задана точка финиша полета');
	}

	if (options.targetType === undefined) {
		throw new Meteor.Error('Не задан тип цели');
	}

	if (options.targetId === undefined) {
		throw new Meteor.Error('Не задан id цели');
	}

	if (options.startTime === undefined) {
		throw new Meteor.Error('Не задано время старта полета');
	}

	if (options.flyTime === undefined) {
		throw new Meteor.Error('Не задана продолжительность полета');
	}

	if (options.engineLevel === undefined) {
		throw new Meteor.Error('Не задан уровень двигателей');
	}

	// not required options
	if (options.startPlanetId === undefined) {
		options.startPlanetId = null;
	}

	if (options.mission === undefined) { 
		options.mission = null;
	}

	if (options.isColony === undefined) {
		options.isColony = false;
	}

	if (options.isHumans === undefined) {
		options.isHumans = false;
	}

	// insert event
	Game.SpaceEvents.add({
		type: Game.SpaceEvents.EVENT_SHIP,
		timeStart: options.startTime,
		timeEnd: options.startTime + options.flyTime,
		info: {
			isHumans: options.isHumans,
			isColony: options.isColony,
			engineLevel: options.engineLevel,
			startPosition: options.startPosition,
			startPlanetId: options.startPlanetId,
			targetPosition: options.targetPosition,
			targetType: options.targetType,
			targetId: options.targetId,
			mission: options.mission
		}
	});
}

Game.SpaceEvents.updateShip = function(serverTime, event) {
	if (event.timeEnd > serverTime) {
		return; // still flying
	}

	// --------------------------------
	// Arrived to planet
	// --------------------------------
	if (event.info.targetType ==  Game.SpaceEvents.TARGET_PLANET) {

		var planetId = event.info.targetId;
		var planet = Game.Planets.getOne(planetId);

		if (!planet) {
			return; // no such planet
		}

		if (event.info.isHumans) {

			var isOneway = (event.info.startPlanetId) ? false : true;

			// TODO: Calculate battle results!
			if (planet.mission) {
				planet.mission = null;
				if (planet.timeRespawn < event.timeEnd) {
					planet.timeRespawn = event.timeEnd + 120;
				}
			}

			if (isOneway) {
				// TODO: Save humans army id!
				planet.armyId = 100500;
			}

			Game.Planets.update(planet);
			// ------------------------------

			if (!planet.isDiscovered) {
				Meteor.call('planet.discover', planet._id);
			}

			if (!isOneway) {
				var startPosition = event.info.targetPosition;
				var targetPosition = event.info.startPosition;
				var engineLevel = event.info.engineLevel;

				var shipOptions = {
					startPosition:  startPosition,
					startPlanetId:  null,
					targetPosition: targetPosition,
					targetType:     Game.SpaceEvents.TARGET_PLANET,
					targetId:       event.info.startPlanetId,
					startTime:      event.timeEnd,
					flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
					isHumans:       true,
					engineLevel:    engineLevel,
					mission:        null,
					isColony:       false
				}

				Game.SpaceEvents.sendShip(shipOptions);
			}

		} else {

			// TODO: Reptiles arrived on planet

		}
	}

	// --------------------------------
	// Meet with target ship
	// --------------------------------
	if (event.info.targetType == Game.SpaceEvents.TARGET_SHIP) {
		
		// TODO: Calculate battle results!

		// destroy target ship
		Game.SpaceEvents.Collection.remove({ _id: event.info.targetId });

		// return to base
		var startPosition = event.info.targetPosition;
		var targetPosition = event.info.startPosition;
		var engineLevel = event.info.engineLevel;

		var shipOptions = {
			startPosition:  startPosition,
			startPlanetId:  null,
			targetPosition: targetPosition,
			targetType:     Game.SpaceEvents.TARGET_PLANET,
			targetId:       event.info.startPlanetId,
			startTime:      event.timeEnd,
			flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
			isHumans:       event.info.isHumans,
			engineLevel:    engineLevel,
			mission:        true,
			isColony:       false
		}

		Game.SpaceEvents.sendShip(shipOptions);
	}
}

// ----------------------------------------------------------------------------
// Public methods
// ----------------------------------------------------------------------------

Meteor.methods({

	'spaceEvents.updateAll': function() {
		var events = Game.SpaceEvents.getAll().fetch();
		if (!events || events.length <= 0) {
			return;
		}

		for (var i = 0; i < events.length; i++) {
			Game.SpaceEvents.updateEvent(events[i]);
		}
	},

	'spaceEvents.update': function(id) {
		var event = Game.SpaceEvents.getOne(id);
		if (event) {
			Game.SpaceEvents.updateEvent(event);
		}
	},

	'spaceEvents.attackReptFleet': function(baseId, targetId, units, targetX, targetY, flyTime) {
		if (!Game.SpaceEvents.checkCanSendFleet()) {
			throw new Meteor.Error('Слишком много флотов уже отправлено');
		}

		var basePlanet = Game.Planets.getOne(baseId);
		if (!basePlanet) {
			return; // no such planet
		}

		var enemyShip = Game.SpaceEvents.getOne(targetId);
		if (!enemyShip) {
			return; // no such ship
		}

		var engineLevel = Game.Planets.getEngineLevel();

		var startPosition = {
			x: basePlanet.x,
			y: basePlanet.y
		}

		var targetPosition = {
			x: targetX,
			y: targetY
		}

		var timeCurrent = Math.floor( new Date().valueOf() / 1000 );
		var timeLeft = enemyShip.timeEnd - timeCurrent;
		
		// TODO: Implement time check on server! Or use turf!

		timeAttack = flyTime;

		if (timeAttack >= timeLeft) {
			return; // not enough time to attack
		}

		// TODO: Units! Check and slice!
		if (!basePlanet.isHome) {
			basePlanet.armyId = null;
			basePlanet.timeRespawn = timeCurrent + 120;
			Game.Planets.update(basePlanet);	
		}

		var shipOptions = {
			startPosition:  startPosition,
			startPlanetId:  basePlanet._id,
			targetPosition: targetPosition,
			targetType:     Game.SpaceEvents.TARGET_SHIP,
			targetId:       enemyShip._id,
			startTime:      timeCurrent,
			flyTime:        timeAttack,
			isHumans:       true,
			engineLevel:    engineLevel,
			mission:        null,
			isColony:       false
		}

		Game.SpaceEvents.sendShip(shipOptions);
	},

	'spaceEvents.attackPlayerFleet': function(id, targetX, targetY) {
		// TODO: implement!
	},

	'spaceEvents.attackPlayerPlanet': function() {

		// choose target planet
		var targetPlanet = Game.Planets.getBase();

		// find available start planets
		var planets = Game.Planets.getAll().fetch();
		var n = planets.length;

		while (n-- > 0) {
			if (!planets[n].mission || planets[n].isHome) {
				planets.splice(n, 1);
			}
		}

		if (planets.length > 0) {

			// choose start planet
			var rand = Math.floor( Math.random() * planets.length );
			var startPlanet = planets[rand];

			// send ship
			var timeCurrent = Math.floor( new Date().valueOf() / 1000 );

			var startPosition = {
				x: startPlanet.x,
				y: startPlanet.y
			}

			var targetPosition = {
				x: targetPlanet.x,
				y: targetPlanet.y
			}

			var engineLevel = Game.Planets.getEngineLevel();

			var mission = {
				type: 'battlefleet',
				level: _.random(1, 10)
			}

			var shipOptions = {
				startPosition:  startPosition,
				startPlanetId:  startPlanet._id,
				targetPosition: targetPosition,
				targetType:     Game.SpaceEvents.TARGET_PLANET,
				targetId:       targetPlanet._id,
				startTime:      timeCurrent,
				flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
				isHumans:       false,
				engineLevel:    engineLevel,
				mission:        mission,
				isColony:       false
			}

			Game.SpaceEvents.sendShip(shipOptions);
		}
	},

	'spaceEvents.spawnTradeFleet': function() {

		var planets = Game.Planets.getAll().fetch();
		var n = planets.length;

		while (n-- > 0) {
			if (!planets[n].mission || planets[n].isHome) {
				planets.splice(n, 1);
			}
		}

		if (planets.length >= 2) {

			// get two random planets
			var randFrom = Math.floor( Math.random() * planets.length );
			var randTo = randFrom;
			while (randTo == randFrom) {
				randTo = Math.floor( Math.random() * planets.length );
			}

			var startPlanet = planets[ randFrom ];
			var targetPlanet = planets[ randTo ];

			// send ship
			var timeCurrent = Math.floor( new Date().valueOf() / 1000 );

			var startPosition = {
				x: startPlanet.x,
				y: startPlanet.y
			}

			var targetPosition = {
				x: targetPlanet.x,
				y: targetPlanet.y
			}

			var mission = {
				type: 'tradefleet',
				level: _.random(1, 10)
			}

			// TODO: Calculate reptile ship flyTime and engineLevel!
			var engineLevel = 0;
			var flyTime = Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel);

			var shipOptions = {
				startPosition:  startPosition,
				startPlanetId:  startPlanet._id,
				targetPosition: targetPosition,
				targetType:     Game.SpaceEvents.TARGET_PLANET,
				targetId:       targetPlanet._id,
				startTime:      timeCurrent,
				flyTime:        flyTime,
				isHumans:       false,
				engineLevel:    engineLevel,
				mission:        mission,
				isColony:       false
			}

			Game.SpaceEvents.sendShip(shipOptions);
		}
	}

})

Meteor.publish('spaceEvents', function () {
	if (this.userId) {
		return Game.SpaceEvents.Collection.find({
			user_id: this.userId
		})
	}
});

}