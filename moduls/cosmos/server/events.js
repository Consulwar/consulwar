var initCosmosEventsServer = function() {

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

Game.SpaceEvents.sendShip = function(startPosition, startPlanetId, targetPosition, targetType, targetId, startTime, flyTime, isHumans, mission) {
	var eventShip = {
		type: Game.SpaceEvents.EVENT_SHIP,
		timeStart: startTime,
		timeEnd: startTime + flyTime,
		info: {
			isHumans: isHumans,
			startPosition: startPosition,
			startPlanetId: startPlanetId,
			targetPosition: targetPosition,
			targetType: targetType,
			targetId: targetId,
			mission: mission
		}
	}

	Game.SpaceEvents.add(eventShip);
}

Game.SpaceEvents.updateShip = function(serverTime, event) {
	if (event.timeEnd > serverTime) {
		return; // still flying
	}

	// Arrived to planet
	if (event.info.targetType ==  Game.SpaceEvents.TARGET_PLANET) {

		var planetId = event.info.targetId;
		var planet = Game.Planets.getOne(planetId);

		if (!planet) {
			return; // no such planet
		}

		if (event.info.isHumans) {

			if (planet.mission) {
				// TODO: Calculate battle results!
				planet.mission = null;
				if (planet.timeRespawn < event.timeEnd) {
					planet.timeRespawn = event.timeEnd;
				}
				Game.Planets.update(planet);
			}

			if (event.info.startPlanetId) {
				var startPosition = event.info.targetPosition;
				var targetPosition = event.info.startPosition;

				Game.SpaceEvents.sendShip(startPosition,
				                          null,
				                          targetPosition,
				                          Game.SpaceEvents.TARGET_PLANET,
				                          event.info.startPlanetId,
				                          event.timeEnd,
				                          Game.Planets.calcFlyTime(startPosition, targetPosition),
				                          true,
				                          null);
			}

		} else {

			// TODO: Repts arrived on planet

		}
	}

	// Meet with target ship
	if (event.info.targetType == Game.SpaceEvents.TARGET_SHIP) {
		
		// TODO: Calculate battle results!

		// destroy target ship
		Game.SpaceEvents.Collection.remove({ _id: event.info.targetId });

		// return to base
		var startPosition = event.info.targetPosition;
		var targetPosition = event.info.startPosition;

		Game.SpaceEvents.sendShip(startPosition,
		                          null,
		                          targetPosition,
		                          Game.SpaceEvents.TARGET_PLANET,
		                          event.info.startPlanetId,
		                          serverTime,
		                          Game.Planets.calcFlyTime(startPosition, targetPosition),
		                          event.info.isHumans,
		                          null);
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

	'spaceEvents.attackReptFleet': function(id, targetX, targetY) {

		var enemyShip = Game.SpaceEvents.getOne(id);
		if (!enemyShip) {
			return; // no such ship
		}

		var basePlanet = Game.Planets.getBase();
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
		var timeAttack = Game.Planets.calcAttackFlyTime(startPosition,
		                                                enemyShip.info.startPosition,
		                                                enemyShip.info.targetPosition,
		                                                enemyShip.timeStart,
		                                                enemyShip.timeEnd,
		                                                timeCurrent);

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
		                          null);
	},

	'spaceEvents.attackPlayerFleet': function() {
		
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

			Game.SpaceEvents.sendShip(startPosition,
			                          startPlanet._id,
			                          targetPosition,
			                          Game.SpaceEvents.TARGET_PLANET,
			                          targetPlanet._id,
			                          timeCurrent,
			                          Game.Planets.calcFlyTime(startPosition, targetPosition),
			                          false,
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

			Game.SpaceEvents.sendShip(startPosition,
			                          startPlanet._id,
			                          targetPosition,
			                          Game.SpaceEvents.TARGET_PLANET,
			                          targetPlanet._id,
			                          timeCurrent,
			                          // TODO: move to constant maybe!
			                          120, // trade fleet 2 minutes
			                          false,
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