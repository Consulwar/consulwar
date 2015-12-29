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

Game.SpaceEvents.sendShip = function(startPosition,
                                     startPlanetId,
                                     targetPosition,
                                     targetType,
                                     targetId,
                                     startTime,
                                     flyTime,
                                     isHumans,
                                     engineLevel,
                                     mission
) {
	Game.SpaceEvents.add({
		type: Game.SpaceEvents.EVENT_SHIP,
		timeStart: startTime,
		timeEnd: startTime + flyTime,
		info: {
			isHumans: isHumans,
			engineLevel: engineLevel,
			startPosition: startPosition,
			startPlanetId: startPlanetId,
			targetPosition: targetPosition,
			targetType: targetType,
			targetId: targetId,
			mission: mission
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

			// TODO: Calculate battle results!
			if (planet.mission) {
				planet.mission = null;
				if (planet.timeRespawn < event.timeEnd) {
					planet.timeRespawn = event.timeEnd + 120;
				}
				Game.Planets.update(planet);
			}
			// ------------------------------

			if (!planet.isDiscovered) {
				Meteor.call('planet.discover', planet._id);
			}

			if (event.info.startPlanetId) {
				var startPosition = event.info.targetPosition;
				var targetPosition = event.info.startPosition;
				var engineLevel = event.info.engineLevel;

				Game.SpaceEvents.sendShip(startPosition,
				                          null,
				                          targetPosition,
				                          Game.SpaceEvents.TARGET_PLANET,
				                          event.info.startPlanetId,
				                          event.timeEnd,
				                          Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
				                          true,
				                          engineLevel,
				                          null);
			}

		} else {

			// TODO: Repts arrived on planet

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

		Game.SpaceEvents.sendShip(startPosition,
		                          null,
		                          targetPosition,
		                          Game.SpaceEvents.TARGET_PLANET,
		                          event.info.startPlanetId,
		                          serverTime,
		                          Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
		                          event.info.isHumans,
		                          engineLevel,
		                          null,
		                          true);
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

	'spaceEvents.attackReptFleet': function(id, targetX, targetY, flyTime) {

		var enemyShip = Game.SpaceEvents.getOne(id);
		if (!enemyShip) {
			return; // no such ship
		}

		var basePlanet = Game.Planets.getBase();
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

		Game.SpaceEvents.sendShip(startPosition,
		                          basePlanet._id,
		                          targetPosition,
		                          Game.SpaceEvents.TARGET_SHIP,
		                          enemyShip._id,
		                          timeCurrent,
		                          timeAttack,
		                          true,
		                          engineLevel,
		                          null);
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

			Game.SpaceEvents.sendShip(startPosition,
			                          startPlanet._id,
			                          targetPosition,
			                          Game.SpaceEvents.TARGET_PLANET,
			                          targetPlanet._id,
			                          timeCurrent,
			                          Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
			                          false,
			                          engineLevel,
			                          null);
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

			// TODO: Calculate reptile ship flyTime and engineLevel!
			var engineLevel = 0;
			var flyTime = Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel);

			Game.SpaceEvents.sendShip(startPosition,
			                          startPlanet._id,
			                          targetPosition,
			                          Game.SpaceEvents.TARGET_PLANET,
			                          targetPlanet._id,
			                          timeCurrent,
			                          flyTime,
			                          false,
			                          engineLevel,
			                          null);
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