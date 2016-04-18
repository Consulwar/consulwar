initCosmosClient = function() {

initCosmosLib();
initCosmosPathView();

Meteor.subscribe('planets');
Meteor.subscribe('spaceEvents');

var isLoading = new ReactiveVar(false);
var zoom = new ReactiveVar(null);
var bounds = new ReactiveVar(null);

var mapView = null;
var pathViews = {};
var observerSpaceEvents = null;
var cosmosObjectsView = null;
var cosmosPopupView = null;

Game.Cosmos.showPage = function() {
	// clear content
	this.render('empty', { to: 'content' });
	// show permanent content div
	$('.permanent').show();
	// render cosmos map once
	if (!mapView) {
		isLoading.set(true);
		this.render('cosmos', { to: 'permanent_content' });
	}
};

// ----------------------------------------------------------------------------
// Cosmos battle history
// ----------------------------------------------------------------------------

Game.Cosmos.showHistory = function() {
	var pageNumber = parseInt( this.params.page, 10 );
	var itemId = this.getParams().hash;
	var countPerPage = 20;

	Meteor.call('battleHistory.getPage', pageNumber, countPerPage, function(err, data) {
		var battle = new ReactiveVar(null);

		for (var i = 0; i < data.length; i++) {
			data[i] = getBattleInfo( data[i] );
			// check if current item
			if (itemId && data[i]._id == itemId) {
				battle.set( data[i] );
			}
		}

		if (itemId && !battle.get()) {
			Meteor.call('battleHistory.getById', itemId, function(err, data) {
				battle.set( getBattleInfo(data) );
			});
		}

		Router.current().render('cosmosHistory', {
			to: 'content',
			data: {
				countPerPage: countPerPage,
				battles: data,
				battle: battle,
				itemId: itemId
			}
		});
	});
};

Template.cosmosHistory.helpers({
	countTotal: function() { return Game.Statistic.getUserValue('battleHistoryCount'); },
	battle: function() { return this.battle.get(); }
});

Template.cosmosHistoryItem.helpers({
	currentPage: function() {
		return Router.current().params.page;
	}
});

Template.cosmosHistory.events({
	'click tr:not(.header)': function(e, t) {
		var page = Router.current().params.page;
		var id = $(e.currentTarget).attr('data-id');
		if (id) {
			Router.go('cosmosHistory', { page: page }, { hash: id });
		}
	}
});

var getArmyInfo = function(units, rest) {
	var result = [];

	for (var side in units) {
		for (var group in units[side]) {
			for (var name in units[side][group]) {

				var countStart = units[side][group][name];
				if (_.isString( countStart )) {
					countStart = game.Battle.count[ countStart ];
				}

				if (countStart <= 0) {
					continue;
				}

				var countAfter = 0;
				if (rest
				 && rest[side]
				 && rest[side][group]
				 && rest[side][group][name]
				) {
					countAfter = rest[side][group][name];
				}

				result.push({
					name: Game.Unit.items[side][group][name].name,
					start: countStart,
					end: countAfter
				});
			}
		}
	}

	return result.length > 0 ? result : null;
};

var getBattleInfo = function(item) {
	item.locationName = null;
	if (_.isString(item.location)) {
		var planet = Game.Planets.getOne(item.location);
		if (planet) {
			item.locationName = planet.name;
		}
	}

	item.reward = _.map(item.reward, function(value, key) {
		return {
			engName: key,
			amount: value
		};
	});

	var lostResources = _.map(item.lostResources, function(value, key) {
		return {
			engName: key,
			amount: value * -1
		};
	});

	item.reward = item.reward.concat(lostResources);

	item.artefacts = _.map(item.artefacts, function(value, key) {
		return {
			engName: key,
			name: Game.Artefacts.items[key].name,
			amount: value
		};
	});

	item.userUnits = getArmyInfo( item.userArmy, item.userArmyRest );
	item.enemyUnits =  getArmyInfo( item.enemyArmy, item.enemyArmyRest );

	return item;
};

// ----------------------------------------------------------------------------
// Fleets side menu
// ----------------------------------------------------------------------------

Game.Cosmos.showFleetsInfo = function() {
	Router.current().render('cosmosFleetsInfo', {
		to: 'cosmosSideInfo'
	});
};

var scrollMapToFleet = function(id) {
	var path = pathViews[id];
	var spaceEvent = Game.SpaceEvents.getOne(id);

	if (path && spaceEvent) {
		var totalFlyDistance = Game.Planets.calcDistance(
			spaceEvent.info.startPosition,
			spaceEvent.info.targetPosition
		);

		var currentDistance = Game.Planets.calcDistanceByTime(
			Session.get('serverTime') - spaceEvent.timeStart,
			totalFlyDistance,
			Game.Planets.calcMaxSpeed( spaceEvent.info.engineLevel ),
			Game.Planets.calcAcceleration( spaceEvent.info.engineLevel )
		);

		var k = currentDistance / totalFlyDistance;
		var position = path.getPointAlongDistanceByCoef(k);

		mapView.setView([position.x, position.y], 8);
	}
};

Template.cosmosFleetsInfo_table.helpers({
	getTimeLeft: function(timeEnd) {
		var timeLeft = timeEnd - Session.get('serverTime');
		return timeLeft > 0 ? timeLeft : 0;
	}
});

Template.cosmosFleetsInfo.helpers({
	userFleets: function () {
		var result = [];

		var i = 0;
		var data = null;

		var fleets = Game.SpaceEvents.getFleets().fetch();
		for (i = 0; i < fleets.length; i++) {
			if (!fleets[i].info.isHumans) {
				continue;
			}
			data = {
				id: fleets[i]._id,
				start: Game.Planets.getOne( fleets[i].info.startPlanetId ),
				finish: Game.Planets.getOne( fleets[i].info.targetId ),
				timeEnd: fleets[i].timeEnd
			};
			if (data.start) {
				data.start.owner = data.start.mission 
					? 'reptiles' 
					: data.start.armyId || data.start.isHome 
						? 'humans' 
						: null;
			}
			
			if (data.finish) {
				data.finish.owner = data.finish.mission 
					? 'reptiles' 
					: data.finish.armyId || data.finish.isHome 
						? 'humans' 
						: null;
			}

			result.push(data);
		}
		
		var reinforcements = Game.SpaceEvents.getReinforcements().fetch();
		for (i = 0; i < reinforcements.length; i++) {
			data = {
				isReinforcement: true,
				id: reinforcements[i]._id,
				start: Game.Planets.getBase(),
				timeEnd: reinforcements[i].timeEnd,
			};
			data.start.owner = 'humans';
			result.push(data);
		}

		return (result.length > 0) ? result : null;
	},

	reptileFleets: function () {
		var result = [];
		var fleets = Game.SpaceEvents.getFleets().fetch();
		for (var i = 0; i < fleets.length; i++) {
			if (fleets[i].info.isHumans) {
				continue;
			}
			var data = {
				id: fleets[i]._id,
				start: Game.Planets.getOne( fleets[i].info.startPlanetId ),
				finish: Game.Planets.getOne( fleets[i].info.targetId ),
				timeEnd: fleets[i].timeEnd
			};
			
			if (data.start) {
				data.start.owner = data.start.mission 
					? 'reptiles' 
					: data.start.armyId || data.start.isHome 
						? 'humans' 
						: null;
			}
			
			if (data.finish) {
				data.finish.owner = data.finish.mission 
					? 'reptiles' 
					: data.finish.armyId || data.finish.isHome 
						? 'humans' 
						: null;
			}

			result.push(data);
		}
		return (result.length > 0) ? result : null;
	}
});

Template.cosmosFleetsInfo_table.events({
	'click table tr[data-id]': function (e, t) {
		var id = $(e.currentTarget).data('id');
		Game.Cosmos.showShipInfo(id);
		scrollMapToFleet(id);
	}
});

// ----------------------------------------------------------------------------
// Planet side menu
// ----------------------------------------------------------------------------

Game.Cosmos.showPlanetInfo= function(id) {
	Router.current().render('cosmosPlanetInfo', {
		to: 'cosmosSideInfo',
		data: {
			id: id
		}
	});
};

Game.Cosmos.getPlanetInfo = function(planet) {
	if (!planet) {
		return null;
	}

	var info = {};

	info.id = planet._id;
	info.name = planet.name;
	info.type = Game.Planets.types[planet.type].name;

	if (planet.isHome || planet.armyId) {
		info.isHumans = true;
		info.isHome = true;
		info.status = (planet.isHome) ? 'Планета консула' : 'Колония';
		if (Game.Planets.getColonies().length <= 1) {
			info.canSend = false;
		} else {
			info.canSend = true;
		}

		if (planet.artefacts) {
			info.timeArtefacts = planet.timeArtefacts;
		}

	} else {
		info.isHumans = false;
		info.canSend = true;
	}

	if (planet.mission) {
		info.mission = {
			level: planet.mission.level,
			name: Game.Battle.items[planet.mission.type].name
		};
	}

	var units = {
		fleet: Game.Planets.getFleetUnits(planet._id),
		defense: Game.Planets.getDefenseUnits(planet._id)
	};

	if (units.fleet || units.defense) {
		var side = (planet.mission) ? 'reptiles' : 'army';
		info.units = [];

		for (var group in units) {
			for (var key in units[group]) {
				if (!_.isString( units[group][key] ) && units[group][key] <= 0) {
					continue;
				}

				info.units.push({
					engName: key,
					name: Game.Unit.items[side][group][key].name,
					count: _.isString( units[group][key] )
						? game.Battle.count[ units[group][key] ]
						: units[group][key]
				});
			}
		}
	}

	return info;
};

Template.cosmosPlanetInfo.helpers({
	planet: function() {
		var id = this.id;
		var planet = Game.Planets.getOne(id);
		return Game.Cosmos.getPlanetInfo(planet);
	},

	getTimeNextDrop: function(timeCollected) {
		var passed = ( Session.get('serverTime') - timeCollected ) % Game.Cosmos.COLLECT_ARTEFACTS_PERIOD;
		return Game.Cosmos.COLLECT_ARTEFACTS_PERIOD - passed;
	}
});

Template.cosmosPlanetInfo.events({
	'click .open': function(e, t) {
		if (!Game.SpaceEvents.checkCanSendFleet()) {
			Notifications.info('Слишком много флотов уже отправлено');
			return;
		}

		var id = $(e.currentTarget).attr("data-id");
		if (id) {
			Game.Cosmos.showAttackMenu(id);
		}
	}
});

// ----------------------------------------------------------------------------
// Planets popup
// ----------------------------------------------------------------------------

Game.Cosmos.getPlanetPopupInfo = function(planet) {
	if (!planet || !planet.artefacts) {
		return null;
	}

	var items = [];
	for (var key in planet.artefacts) {
		items.push({
			id: key,
			name: Game.Artefacts.items[key].engName,
			chance: planet.artefacts[key]
		});
	}

	return {
		name: planet.name,
		type: Game.Planets.types[planet.type].name,
		items: items
	};
};

Game.Cosmos.showPlanetPopup = function(id) {
	if (!mapView || cosmosPopupView) {
		return;
	}

	var planet = Game.Planets.getOne(id);
	var dropInfo = Game.Cosmos.getPlanetPopupInfo(planet);
	if (!dropInfo) {
		return;
	}

	cosmosPopupView = Blaze.renderWithData(
		Template.cosmosPlanetPopup, {
			drop: dropInfo,
			position: function() {
				var k = Math.pow(2, (zoom.get() - 7));
				var iconSize = (planet.size + 3) * 4;
				var position = mapView.latLngToLayerPoint(new L.latLng(planet.x, planet.y));
				position.x += 24 + 10 + Math.round(iconSize * k / 2);
				position.y -= 85;
				return position;
			}
		},
		$('.leaflet-popup-pane')[0]
	);
};

Game.Cosmos.hidePlanetPopup = function() {
	if (cosmosPopupView) {
		Blaze.remove( cosmosPopupView );
		cosmosPopupView = null;
	}
};

// ----------------------------------------------------------------------------
// Ship side menu
// ----------------------------------------------------------------------------

Game.Cosmos.showShipInfo = function(id) {
	Router.current().render('cosmosShipInfo', {
		to: 'cosmosSideInfo',
		data: {
			id: id
		}
	});
};

Game.Cosmos.getShipInfo = function(spaceEvent) {
	if (!spaceEvent || spaceEvent.status == Game.SpaceEvents.status.FINISHED) {
		return null;
	}

	var info = {};

	info.name = null;
	info.id = spaceEvent._id;

	if (spaceEvent.info.isHumans) {
		info.isHumans = true;
		info.canSend = false;
		info.status = 'Флот консула';
	} else {
		info.isHumans = false;
		info.canSend = true;
		info.mission = {
			level: spaceEvent.info.mission.level,
			name: Game.Battle.items[spaceEvent.info.mission.type].name
		};
		info.status = 'Флот рептилий';
	}

	var units = Game.SpaceEvents.getFleetUnits(spaceEvent._id);
	if (units) {
		var side = (spaceEvent.info.isHumans) ? 'army' : 'reptiles';
		info.units = [];

		for (var key in units) {
			if (!_.isString( units[key] ) && units[key] <= 0) {
				continue;
			}

			info.units.push({
				engName: key,
				name: Game.Unit.items[side].fleet[key].name,
				count: _.isString( units[key] ) ? game.Battle.count[ units[key] ] : units[key]
			});
		}
	}

	return info;
};

Game.Cosmos.getReinforcementInfo = function(spaceEvent) {
	if (!spaceEvent || spaceEvent.status == Game.SpaceEvents.status.FINISHED) {
		return null;
	}

	var info = {};

	info.name = null;
	info.id = spaceEvent._id;
	info.isHumans = true;
	info.canSend = false;
	info.status = 'Подкрепление';

	var units = spaceEvent.info.units.army.ground;
	if (units) {
		info.units = [];
		for (var key in units) {
			info.units.push({
				engName: key,
				name: Game.Unit.items.army.ground[key].name,
				count: units[key]
			});
		}
	}

	return info;
};

Template.cosmosShipInfo.onRendered(function() {
	// show fleets info when ship removed
	this.autorun(function() {
		if (!mapView) {
			return;
		}
		var id = Template.currentData().id;
		var spaceEvent = Game.SpaceEvents.getOne( id );
		if (!spaceEvent) {
			Game.Cosmos.showFleetsInfo();
		}
	});
});

Template.cosmosShipInfo.helpers({
	timeLeft: function() {
		var id = this.id;
		var spaceEvent = Game.SpaceEvents.getOne(id);
		return (!spaceEvent) ? 0 : spaceEvent.timeEnd - Session.get('serverTime');
	},

	ship: function() {
		var id = this.id;
		var spaceEvent = Game.SpaceEvents.getOne(id);
		if (spaceEvent) {
			if (spaceEvent.type == Game.SpaceEvents.type.SHIP) {
				return Game.Cosmos.getShipInfo(spaceEvent);
			}
			if (spaceEvent.type == Game.SpaceEvents.type.REINFORCEMENT) {
				return Game.Cosmos.getReinforcementInfo(spaceEvent);
			}
		}
		return null;
	}
});

Template.cosmosShipInfo.events({
	'click .open': function(e, t) {
		if (!Game.SpaceEvents.checkCanSendFleet()) {
			Notifications.info('Слишком много флотов уже отправлено');
			return;
		}

		var id = $(e.currentTarget).attr("data-id");
		if (id) {
			Game.Cosmos.showAttackMenu(id);
		}
	}
});

// ----------------------------------------------------------------------------
// Attack menu
// ----------------------------------------------------------------------------

Game.Cosmos.showAttackMenu = function(id) {
	Router.current().render('cosmosAttackMenu', {
		to: 'cosmosAttackMenu',
		data: {
			id: id,
			activeColonyId: new ReactiveVar(null),
			updated: new ReactiveVar(null),

			colonies: function() {
				var maxCount = Game.Planets.getMaxColoniesCount();
				var result = Game.Planets.getColonies();
				var ids = [];

				var n = result.length;
				while (n-- > 0) {
					// make array of all colonies ids
					ids.push(result[n]._id);
					// remove selected target from result
					if (result[n]._id == id) {
						result.splice(n, 1);
						maxCount--;
					}
				}

				// count sent
				var sentCount = 0;
				var i = 0;

				var fleets = Game.SpaceEvents.getFleets().fetch();
				for (i = 0; i < fleets.length; i++) {
					var fleet = fleets[i];

					if (!fleet.info.isHumans) {
						continue;
					}

					var targetId = fleet.info.isOneway
						? fleet.info.targetId
						: fleet.info.startPlanetId;

					if (ids.indexOf(targetId) == -1) {
						sentCount++;
					}
				}

				for (i = result.length; i < maxCount; i++) {
					result.push({
						isEmpty: true,
						isSent: (sentCount > 0 ? true : false)
					});
					sentCount--;
				}

				return result;
			}
		}
	});
};

Game.Cosmos.hideAttackMenu = function() {
	Router.current().render(null, {
		to: 'cosmosAttackMenu'
	});
};

Template.cosmosAttackMenu.helpers({
	ship: function() {
		var id = this.id;
		var spaceEvent = Game.SpaceEvents.getOne(id);
		return Game.Cosmos.getShipInfo(spaceEvent);
	},

	planet: function() {
		var id = this.id;
		var planet = Game.Planets.getOne(id);
		return Game.Cosmos.getPlanetInfo(planet);
	},

	timeAttack: function() {
		var baseId = this.activeColonyId.get();
		var basePlanet = Game.Planets.getOne(baseId);
		if (!basePlanet) {
			return null;
		}

		var targetId = this.id;
		var engineLevel = Game.Planets.getEngineLevel();

		var targetPlanet = Game.Planets.getOne(targetId);
		if (targetPlanet) {
			return Game.Planets.calcFlyTime(basePlanet, targetPlanet, engineLevel);
		}

		var targetShip = Game.SpaceEvents.getOne(targetId);
		if (targetShip) {
			var result = Game.Planets.calcAttackOptions(
				basePlanet,
				engineLevel,
				targetShip,
				Session.get('serverTime')
			);
			return (result) ? result.time : null;
		}

		return null;
	},

	timeLeft: function() {
		var targetId = this.id;
		var targetShip = Game.SpaceEvents.getOne(targetId);
		if (targetShip) {
			return targetShip.timeEnd - Session.get('serverTime');
		}

		return null;
	},

	activeColonyId: function() {
		return Template.instance().data.activeColonyId.get();
	},

	availableFleet: function() {
		var colonyId = this.activeColonyId.get();
		if (!colonyId) {
			return null;
		}

		var army = Game.Planets.getFleetUnits(colonyId);
		if (!army) {
			return null;
		}

		var units = [];

		for (var key in army) {
			if (army[key] <= 0) {
				continue;
			}
			
			units.push({
				engName: key,
				name: Game.Unit.items.army.fleet[key].name,
				max: army[key],
				count: 0
			});
		}

		return units;
	},

	canHaveMoreColonies: function() {
		var updated = this.updated.get(); // rerun this helper on units update
		var targetId = this.id;

		var baseId = this.activeColonyId.get();
		var basePlanet = Game.Planets.getOne(baseId);
		if (!basePlanet) {
			return false;
		}

		// check is we leaving base
		var isLeavingBase = false;

		if (!basePlanet.isHome) {
			// base planet is not home, so we can leave it
			isLeavingBase = true;
			// test selected units vs available units
			var availableFleet = Game.Planets.getFleetUnits(baseId);
			var elements = $('.fleet li');
			for (var i = 0; i < elements.length; i++) {
				var max = parseInt( $(elements[i]).attr('data-max'), 10 );
				var count = parseInt( $(elements[i]).find('.count').val(), 10 );
				if (max != count) {
					// not all selected, so we don't leaving base
					isLeavingBase = false;
					break;
				}
			}
		}

		return Game.Planets.checkCanHaveMoreColonies(baseId, isLeavingBase, targetId);
	}
});

Template.cosmosAttackMenu.onRendered(function() {
	var colonies = this.data.colonies();
	if (colonies && colonies.length > 0) {
		this.data.activeColonyId.set( colonies[0]._id );
	}
});

Template.cosmosAttackMenu.events({
	'click .btn-close': function(e, t) {
		Game.Cosmos.hideAttackMenu();
	},

	'click .planets li': function(e, t) {
		var id = $(e.currentTarget).attr("data-id");
		if (id) {
			// reset fleet values
			$('.fleet li').each(function(index, element) {
				$(element).find('.count').val( 0 );
			});

			// set new colony id
			t.data.activeColonyId.set( id );
		}
	},

	'click .btn-all': function(e, t) {
		$('.fleet li').each(function(index, element) {
			var max = parseInt( $(element).attr('data-max'), 10 );
			$(element).find('.count').val( max );
		});

		t.data.updated.set(Session.get('serverTime'));
	},

	'change .fleet input': function (e, t) {
		var value = parseInt( e.currentTarget.value, 10 );
		var max = parseInt( $(e.currentTarget.parentElement).attr('data-max'), 10 );

		if (value < 0) {
			e.currentTarget.value = 0;
		} else if (value > max) {
			e.currentTarget.value = max;
		}

		t.data.updated.set(Session.get('serverTime'));
	},

	'click .btn-attack.disabled': function(e, t) {
		Notifications.info('Нельзя захватить планету, так как уже слишком много колоний');
	},

	'click .btn-attack:not(.disabled)': function(e, t) {
		var isOneway = $(e.currentTarget).hasClass('defend');

		var baseId = t.data.activeColonyId.get();
		var basePlanet = Game.Planets.getOne(baseId);

		if (!basePlanet) {
			Notifications.info('Не выбрана базовая планета');
			return;
		}

		var total = 0;
		var units = {};

		$('.fleet li').each(function(index, element) {
			var id = $(element).attr('data-id');
			var max = parseInt( $(element).attr('data-max'), 10 );
			var count = parseInt( $(element).find('.count').val(), 10 );

			if (max > 0 && count > 0) {
				units[ id ] = Math.min(max, count);
				total += units[ id ];
			}

			$(element).find('.count').val(0);
		});

		if (total <= 0) {
			Notifications.info('Выберите корабли для отправки');
			return;
		}

		var targetId = t.data.id;
		var planet = Game.Planets.getOne(targetId);
		var ship = Game.SpaceEvents.getOne(targetId);

		if (!planet && !ship) {
			Notifications.info('Не выбрана цель');
			return;
		}

		if (planet) {
			// Send to planet
			Meteor.call(
				'planet.sendFleet',
				basePlanet._id,
				targetId, 
				units,
				isOneway,
				function(err) {
					if (err) {
						Notifications.error('Не удалось отправить флот', err.error);
					} else {
						Notifications.success('Флот отправлен');
						Game.Cosmos.showFleetsInfo();
						Game.Cosmos.hideAttackMenu();
					}
				}
			);

		} else if (ship) {
			// Attack ship
			var pathView = pathViews[ship._id];
			var engineLevel = Game.Planets.getEngineLevel();

			var attack = Game.Planets.calcAttackOptions(
				basePlanet,
				engineLevel,
				ship,
				Session.get('serverTime')
			);

			if (!attack || !pathView) {
				Notifications.info('Невозможно перехватить вражеский флот');
				return;
			}

			var attackPoint = pathView.getPointAlongDistanceByCoef(attack.k);

			Meteor.call(
				'spaceEvents.attackReptFleet',
				basePlanet._id,
				targetId,
				units,
				attackPoint.x, 
				attackPoint.y,
				function(err) {
					if (err) {
						Notifications.error('Не удалось отправить флот', err.error);
					} else {
						Notifications.success('Флот отправлен');
						Game.Cosmos.showFleetsInfo();
						Game.Cosmos.hideAttackMenu();
					}
				}
			);
		}
	}
});

// ----------------------------------------------------------------------------
// Cosmos map content
// ----------------------------------------------------------------------------

Game.Cosmos.renderCosmosObjects = function() {
	// Add layer for markers
	$(mapView.getContainer()).append('<div class="leaflet-marker-pane"></div>');
 
	cosmosObjectsView = Blaze.renderWithData(
		Template.cosmosObjects, {
			planets: function() {
				var planets = Game.Planets.getAll().fetch();
				return _.map(planets, function(planet) {
					return {
						iconSize: (planet.size + 3) * 4,
						planet: planet
					};
				});
			},

			fleets: function() {
				var fleets = Game.SpaceEvents.getFleets().fetch();
				return _.map(fleets, function(spaceEvent) {
					return {
						spaceEvent: spaceEvent,
						maxSpeed: Game.Planets.calcMaxSpeed( spaceEvent.info.engineLevel ),
						acceleration: Game.Planets.calcAcceleration( spaceEvent.info.engineLevel ),
						totalFlyDistance: Game.Planets.calcDistance(
							spaceEvent.info.startPosition,
							spaceEvent.info.targetPosition
						)
					};
				});
			}
		},
		$('.leaflet-marker-pane')[0]
	);
};

Template.cosmosObjects.helpers({
	zoom: function() {
		return zoom.get();
	},

	getPlanetPosition: function(x, y, iconSize) {
		var k = Math.pow(2, (zoom.get() - 7));
		var coords = mapView.latLngToLayerPoint(new L.latLng(x, y));

		return {
			x: coords.x,
			y: coords.y,
			height: iconSize * k,
			width: iconSize * k,
			marginTop: iconSize * k * -0.5,
			marginLeft: iconSize * k * -0.5,
			nameTop: -30,
			nameLeft: -100 + iconSize * k * 0.5
		};
	},

	getFleetAnimation: function(fleet) {
		var currentZoom = zoom.get();
		var currentTime = Session.get('serverTime');
		
		var path = pathViews[ fleet.spaceEvent._id ];
		if (!path) {
			return {
				x: 0,
				y: 0,
				angle: 0
			};
		}

		var currentDistance = Game.Planets.calcDistanceByTime(
			currentTime - fleet.spaceEvent.timeStart,
			fleet.totalFlyDistance,
			fleet.maxSpeed,
			fleet.acceleration
		);

		var k = currentDistance / fleet.totalFlyDistance;
		var curPoint = path.getPointAlongDistanceByCoef(k);

		var nextPoint = fleet.spaceEvent.info.targetPosition;
		if (k < 0.99) {
			nextPoint = path.getPointAlongDistanceByCoef(k + 0.01);
		}
		var angleRad = Math.atan2(nextPoint.y - curPoint.y, nextPoint.x - curPoint.x);

		var angleDeg = Math.floor( angleRad * 180 / Math.PI );
		if (fleet.spaceEvent.info.isHumans) {
			angleDeg += 180;
		}

		var coords =  mapView.latLngToLayerPoint(new L.latLng(curPoint.x, curPoint.y));

		return {
			x: coords.x,
			y: coords.y,
			angle: angleDeg
		};
	},

	isHidden: function(x, y) {
		if (bounds.get().contains(new L.latLng(x, y))) {
			return false;
		} else {
			return true;
		}
	}
});

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

Template.cosmos.onRendered(function() {
	// Init map
	mapView = L.map('map-battle', {
		crs: L.CRS.Simple,
		zoomAnimation: false,
		zoomControl: false,
		doubleClickZoom: false,
		attributionControl: false,
		fadeAnimation: false,
		inertia: false,
		center: [0, 0],
		zoom: 7,
		minZoom: 2, //3
		maxZoom: 10
	});

	zoom.set( mapView.getZoom() );
	mapView.on('zoomend', function(e) {
		zoom.set( mapView.getZoom() );
	}.bind(this));

	bounds.set( mapView.getBounds() );
	mapView.on('moveend', function(e) {
		bounds.set( mapView.getBounds() );
	}.bind(this));

	// Init planets
	var alignMapToBasePlanet = function() {
		var homePlanet = Game.Planets.getBase();
		if (homePlanet) {
			mapView.setView([homePlanet.x, homePlanet.y], 7);
		}
		isLoading.set(false);
	};

	var planets = Game.Planets.getAll().fetch();
	if (planets.length === 0) {
		Meteor.call('planet.initialize', function(err, data) {
			alignMapToBasePlanet();
		});
	} else {
		alignMapToBasePlanet();
	}

	// Paths
	var createPath = function(id, event) {
		if (!mapView || pathViews[id]) {
			return;
		}

		// draw path
		pathViews[id] = new game.PathView(
			mapView,
			event.info.startPosition,
			event.info.targetPosition,
			0,
			0,
			(event.info.isHumans ? '#56BAF2' : '#DC6257')
		);
	};

	var removePath = function(id) {
		if (mapView && pathViews[id]) {
			pathViews[id].remove();
			pathViews[id] = null;
		}
	};

	observerSpaceEvents = Game.SpaceEvents.getAll().observeChanges({
		added: function(id, event) {
			if (event.type == Game.SpaceEvents.type.SHIP) {
				createPath(id, event);
			}
		},

		removed: function(id) {
			removePath(id);
		}
	});

	// Render cosmos objects
	Game.Cosmos.renderCosmosObjects.call(this);

	// Show default side info
	Game.Cosmos.showFleetsInfo();

	mapView.on('click', function(e) {
		Game.Cosmos.showFleetsInfo();
	});

	// Scroll to fleet
	this.autorun(function() {
		var hash = Router.current().getParams().hash;
		if (hash) {
			Tracker.nonreactive(function() {
				Game.Cosmos.showShipInfo(hash);
				scrollMapToFleet(hash);
			});
		}
	});
});

Template.cosmos.onDestroyed(function() {
	// --------------------------------
	// Never destroy cosmos map!
	/*
	Game.Cosmos.hidePlanetPopup();
	Game.Cosmos.hideAttackMenu();

	if (observerSpaceEvents) {
		observerSpaceEvents.stop();
		observerSpaceEvents = null;
	}

	if (cosmosObjectsView) {
		Blaze.remove( cosmosObjectsView );
		cosmosObjectsView = null;
	}

	pathViews = {};

	if (mapView) {
		mapView.remove();
		mapView = null;
	}
	*/
	// --------------------------------
});

Template.cosmos.helpers({
	isLoading: function() {
		return isLoading.get();
	}
});

Template.cosmos.events({
	'click .map-fleet': function(e, t) {
		var id = $(e.currentTarget).attr('data-id');
		if (id) {
			Game.Cosmos.showShipInfo(id);	
		}
	},

	'click .map-planet-marker': function(e, t) {
		var id = $(e.currentTarget).attr('data-id');
		if (id) {
			Game.Cosmos.showPlanetInfo(id);
		}
	},

	'mouseover .map-planet-marker': function(e, t) {
		var id = $(e.currentTarget).attr('data-id');
		Game.Cosmos.showPlanetPopup.call(t, id);
	},

	'mouseout .map-planet-marker': function(e, t) {
		Game.Cosmos.hidePlanetPopup();
	},

	'click .map-control-home': function(e, t) {
		if (mapView) {
			var homePlanet = Game.Planets.getBase();
			if (homePlanet) {
				mapView.setView([homePlanet.x, homePlanet.y], 7);
			} else {
				mapView.setView([0, 0], 7);
			}
		}
	}
});

// ------------------------------------------------------
// Debug methods
// ------------------------------------------------------

Game.Planets.debugDrawGalactic = function(hands, segments, rotation, narrow, min, max, radius, angle) {
	if (!mapView) {
		return;
	}

	mapView.eachLayer(function (layer) {
		mapView.removeLayer(layer);
	});

	var debugDrawSegment = function(hand, segment) {
		var amount = Game.Planets.calcSegmentPlanetsAmount(hand, segment, hands, segments, min, max);
		var points = Game.Planets.calcSegmentRandomPoints(amount, hand, segment, hands, segments, rotation, narrow, radius, angle);

		var color = '#00ff00';
		if (segment > 0) {
			if (hand % 2 === 0) {
				color = (segment % 2 === 0) ? '#ffff00' : '#ff0000';
			} else {
				color = (segment % 2 === 0) ? '#ffffff' : '#5555ff';
			}
		}

		for (var i = 0; i < points.length; i++) {
			L.circle([points[i].x, points[i].y], 0.1, {
				color: color,
				fillOpacity: 1
			}).addTo(mapView);
		}

		return amount;
	};

	var totalPlanets = debugDrawSegment(0, 0);

	for (var i = 0; i < hands; i++) {
		for (var j = 1; j <= segments; j++) {
			totalPlanets += debugDrawSegment(i, j);
		}
	}

	console.log('Total planets generated: ', totalPlanets);
};

Game.Planets.debugCalcFlyTime = function() {
	for (var i = 0; i <= 100; i++) {

		var maxSpeed = Game.Planets.calcMaxSpeed(i);
		var acceleration = Game.Planets.calcAcceleration(i);

		var strDebug = '';
		strDebug += i + '        ';
		strDebug += maxSpeed.toFixed(2) + '        ';
		strDebug += acceleration.toFixed(2) + '        ';
		strDebug += Game.Planets.calcTotalTimeByDistance(1, maxSpeed, acceleration) + ' - ';
		strDebug += Game.Planets.calcTotalTimeByDistance(2, maxSpeed, acceleration) + ' - ';
		strDebug += Game.Planets.calcTotalTimeByDistance(20, maxSpeed, acceleration) + ' - ';
		strDebug += Game.Planets.calcTotalTimeByDistance(40, maxSpeed, acceleration) + ' - ';
		strDebug += Game.Planets.calcTotalTimeByDistance(80, maxSpeed, acceleration);

		if (i % 10 === 0) {
			console.log('================================================');
		}
		console.log(strDebug);
	}
};

};