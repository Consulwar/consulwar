initCosmosShipView = function() {

IS_DRAW_CURVED = true;

game.ShipView = function(map, spaceEvent, template) {

	var STATE_REMOVED = 0;
	var STATE_WAIT = 1;
	var STATE_FLY = 2;
	var STATE_ARRIVED = 3;

	var _state = 0;
	var _updateInterval = 1;

	var _pathView = null;
	var _element = null;
	var _marker = null;
	var _markerTime = null;

	this.id = null;
	this.info = null;
	this.maxSpeed = 0;
	this.acceleration = 0;
	this.totalFlyDistance = 0;

	this.constructor = function() {
		this.id = spaceEvent._id;

		this.maxSpeed = Game.Planets.calcMaxSpeed( spaceEvent.info.engineLevel );
		this.acceleration = Game.Planets.calcAcceleration( spaceEvent.info.engineLevel );

		var a = spaceEvent.info.startPosition;
		var b = spaceEvent.info.targetPosition;
		this.totalFlyDistance = Math.sqrt( Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) );

		_state = STATE_WAIT;
		this.updateData();
		this.update();
	}

	this.updateData = function () {
		var spaceEvent = Game.SpaceEvents.getOne(this.id);

		if (!spaceEvent || spaceEvent.status == Game.SpaceEvents.status.FINISHED) {

			this.info = null;

		} else {

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
	 			}
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
					})
				}
			}

			this.info = info;
		}

		// update side menu
		var sideInfo = template.data.ship.get();
		if (sideInfo && sideInfo.id == this.id) {
			template.data.ship.set( this.info );
		}

		// update target popup
		var targetId = template.data.target.get();
		if (targetId && targetId == this.id) {
			if (this.info == null) {
				// hide window if ship removed
				template.data.target.set(null);
			}
		}
	}

	this.update = function() {

		var serverTime = Session.get('serverTime');

		switch (_state) {

			case STATE_WAIT:
				if (serverTime >= spaceEvent.timeStart) {
					if (serverTime < spaceEvent.timeEnd) {
						_state = STATE_FLY;
						this.showShipAnimation();
						this.updateShipAnimation();
					} else {
						_state = STATE_ARRIVED;
						Meteor.call('spaceEvents.update', spaceEvent._id);
					}
				}
				break;

			case STATE_FLY:
				if (serverTime < spaceEvent.timeEnd) {
					this.updateShipAnimation();
				} else {
					_state = STATE_ARRIVED;
					this.hideShipAnimation();
					Meteor.call('spaceEvents.update', spaceEvent._id);
				}
				break;
		}

		if (_state == STATE_WAIT || _state == STATE_FLY) {
			setTimeout(this.update.bind(this), _updateInterval * 1000);
		}
	}

	this.remove = function() {
		_state == STATE_REMOVED;
		this.hideShipAnimation();
	}

	this.showShipAnimation = function() {
		// calc offsets
		var startOffset = 0;
		if (spaceEvent.info.startPlanetId) {
			var planet = Game.Planets.getOne(spaceEvent.info.startPlanetId);
			if (planet) {
				startOffset = (planet.size + 3) * 0.02;
			}
		}

		var endOffset = 0;
		if (spaceEvent.info.targetType == Game.SpaceEvents.target.PLANET) {
			var planet = Game.Planets.getOne(spaceEvent.info.targetId);
			if (planet) {
				endOffset = (planet.size + 3) * 0.02;
			}
		}

		// draw path
		_pathView = new game.PathView(
			map,
			spaceEvent.info.startPosition,
			spaceEvent.info.targetPosition,
			startOffset,
			endOffset,
			(spaceEvent.info.isHumans ? '#56BAF2' : '#DC6257'),
			template
		);

		// add marker
		_marker = L.marker(
			[0, 0],
			{
				icon: L.divIcon({
					className: 'map-fleet'
				})
			}
		).addTo(map);

		_element = $(_marker.getElement());
		_element[0].view = this;

		if (spaceEvent.info.isHumans) {
			_element.append('<div class="map-fleet-humans"></div>');
		} else {
			_element.append('<div class="map-fleet-rept"></div>');
		}

		_element.append('<div class="map-fleet-time"></div>');
		_markerTime = $(_element.find('.map-fleet-time'));

		// click event
		// _marker.on('click', this.showSideInfo.bind(this));
	}

	this.getPosition = function () {
		var latLng = (_marker) ? _marker.getLatLng() : null;
		return {
			x: (latLng ? latLng.lat : 0),
			y: (latLng ? latLng.lng : 0)
		}	
	}

	this.showSideInfo = function() {
		template.data.planet.set(null);
		template.data.ship.set( this.info );
		template.data.timeFly.set( this.getTimeLeft() );
	}

	this.updateShipAnimation = function() {
		
		if (!_pathView) {
			return;
		}

		var timeLeft = spaceEvent.timeEnd - Session.get('serverTime');
		var timeTotal = spaceEvent.timeEnd - spaceEvent.timeStart;
		var timeCurrent = Session.get('serverTime') - spaceEvent.timeStart;

		var currentDistance = Game.Planets.calcDistanceByTime(
			timeCurrent,
			this.totalFlyDistance,
			this.maxSpeed,
			this.acceleration
		);

		var k = currentDistance / this.totalFlyDistance;
		var curPoint = _pathView.getPointAlongDistanceByCoef(k);
		
		_marker.setLatLng(L.latLng(
			curPoint.x,
			curPoint.y
		));

		var nextPoint = spaceEvent.info.targetPosition;
		if (k < 0.99) {
			nextPoint = _pathView.getPointAlongDistanceByCoef(k + 0.01);
		}
		var angle = Math.atan2(nextPoint.y - curPoint.y, nextPoint.x - curPoint.x);
		this.setRotation(angle);

		// update gui time

		/* _markerTime.html(Math.round(timeLeft) + '&nbsp;sec.')
		           .css('left', 30 * Math.cos(angle))
		           .css('top', 30 * Math.sin(angle)); */

		var sideInfo = template.data.ship.get();
		if (sideInfo && sideInfo.id == this.id) {
			template.data.timeFly.set( timeLeft );
		}
	}

	this.hideShipAnimation = function() {
		if (_marker) {
			map.removeLayer(_marker);
			_marker = null;
		}
		if (_pathView) {
			_pathView.remove();
			_pathView = null;
		}
	}

	this.setRotation = function(value) {
		if (spaceEvent.info.isHumans) {
			var deg = Math.floor( value * 180 / Math.PI ) + 180;
			_element.find('.map-fleet-humans').css('transform', 'rotate(' + deg + 'deg)');
		} else {
			var deg = Math.floor( value * 180 / Math.PI );
			_element.find('.map-fleet-rept').css('transform', 'rotate(' + deg + 'deg)');
		}
	}

	this.getTimeLeft = function() {
		return spaceEvent.timeEnd - Session.get('serverTime');
	}

	this.getAttackPointAndTime = function(attackerPlanet, attackerEngineLevel) {

		var timeCurrent = Session.get('serverTime');

		var result = Game.Planets.calcAttackOptions(
			attackerPlanet,
			attackerEngineLevel,
			spaceEvent,
			timeCurrent
		);

		if (!result) {
			return false;
		}

		return {
			point: _pathView.getPointAlongDistanceByCoef(result.k),
			time: result.time
		}
	}

	this.constructor();
}

}