initCosmosPlanetView = function() {

game.PlanetView = function(map, planet, template) {

	this.id = null;
	this.name = null;
	this.iconSize = 0;
	this.zoom = 0;
	this.radius = 0;
	this.x = 0;
	this.y = 0;

	this.element = null;
	this.marker = null;
	this.textName = null;
	this.markerAttack = null;
	this.isMarkerAttack = false;

	this.infoPlanet = null;
	this.infoDrop = null;

	this.constructor = function() {
		this.id = planet._id;
		this.name = planet.name;
		this.iconSize = (planet.size + 3) * 4;
		this.radius = this.iconSize * 0.5 / 100;
		this.x = planet.x;
		this.y = planet.y;

		// Planet marker on map
		this.marker = L.marker(
			[this.x, this.y],
			{
				icon: L.divIcon({
					className: 'map-planet-marker ' + planet.type,
					iconSize: [this.iconSize, this.iconSize],
					iconAnchor: [this.iconSize * 0.5, this.iconSize * 0.5]
				})
			}
		).addTo(map);

		// Planet jquery element
		this.element = $(this.marker.getElement());
		this.element[0].view = this;

		// Planet name
		this.element.append('<div class="map-planet-marker-name">' + planet.name + '</div>');
		this.textName = $(this.element.find('.map-planet-marker-name'));
		this.textName.hide();

		// Attack marker
		this.element.append('<div class="map-planet-attack-cursor"></div>');
		this.markerAttack = $(this.element.find('.map-planet-attack-cursor'));
		this.markerAttack.hide();

		// Events
		//this.marker.on('mouseover', this.showPopup.bind(this));
		//this.marker.on('mouseout', this.hidePopup.bind(this));
		//this.marker.on('click', this.showSideBarInfo.bind(this));

		map.on('moveend', this.refreshAnim.bind(this));
		map.on('zoomend', this.refreshSize.bind(this));

		this.refreshSize();

		// GUI data
		this.infoPlanet = null;

		// ----------------------------
		// TODO: Get real info!
		// ----------------------------
		this.infoDrop = {
			segment: planet.segment,
			hand: planet.hand,
			name: planet.name,
			type: Game.Planets.getType(planet.type).name,
			items: [{
				name: Game.Artefacts.getRandom().engName,
				chance: Math.round(Math.random() * 50 + 25)
			}, {
				name: Game.Artefacts.getRandom().engName,
				chance: Math.round(Math.random() * 50 + 25)
			}, {
				name: Game.Artefacts.getRandom().engName,
				chance: Math.round(Math.random() * 50 + 25)
			}]
		};
		// ----------------------------
		// TODO: Get real info!
		// ----------------------------
	}

	this.update = function() {
		var planet = Game.Planets.getOne(this.id);

		this.element.removeClass('map-planet-border-human');
		this.element.removeClass('map-planet-border-reptile');
		this.element.removeClass('map-planet-border-empty');

		if (planet.isHome || planet.armyId) {
			this.element.addClass('map-planet-border-human');
		} else {
			if (planet.mission) {
				this.element.addClass('map-planet-border-reptile');
			} else {
				this.element.addClass('map-planet-border-empty');
			}
		}

		// update planet side info
		var info = {};

		info.id = planet._id;
		info.name = planet.name;
		info.type = Game.Planets.getType(planet.type).name;

		if (planet.isHome || planet.armyId) {
			info.isHumans = true;
			info.isHome = true;
			info.status = (planet.isHome) ? 'Планета консула' : 'Колония';
			if (Game.Planets.getColonies().length <= 1) {
				info.canSend = false;
			} else {
				info.canSend = true;
			}
		} else {
			info.isHumans = false;
			info.canSend = true;
		}
		
		if (planet.mission) {
			info.mission = {
				level: planet.mission.level,
				name: Game.Battle.items[planet.mission.type].name
			}
		}

		var units = Game.Planets.getFleetUnits(planet._id);
		if (units) {
			var side = (planet.mission) ? 'reptiles' : 'army';
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

		// save info
		this.infoPlanet = info;

		// update side menu
		var sideInfo = template.data.planet.get();
		if (sideInfo && sideInfo.id == this.id) {
			template.data.planet.set( this.infoPlanet );
		}
	}

	this.setAttackTime = function(time) {
		if (time <= 0) {
			this.isMarkerAttack = false;
			this.markerAttack.hide();
		} else {
			this.isMarkerAttack = true;
			this.markerAttack.html(time + '&nbsp;sec.');
			if (this.map.getZoom() >= 8) {
				this.markerAttack.show();
			}
		}
	}

	this.showPopup = function() {
		template.data.drop.set( this.infoDrop );

		var k = Math.pow(2, (map.getZoom() - 7));
		var position = map.latLngToContainerPoint(this.marker.getLatLng());
		position.x += 24 + 10 + Math.round(this.iconSize * k / 2);
		position.y -= 85;

		$('.map-planet-popup-container')
			.css('left', position.x + 'px')
			.css('top', position.y + 'px');
	}

	this.hidePopup = function() {
		template.data.drop.set(null);
	}

	this.showSideBarInfo = function() {
		template.data.planet.set( this.infoPlanet );
		template.data.timeFly.set(null);
		template.data.ship.set(null);
	}

	this.refreshAnim = function() {
		var bounds = map.getBounds();
		var zoom = map.getZoom();

		if (bounds.contains(this.marker.getLatLng())) {
			this.element.removeClass('map-planet-marker-hidden');
			if (zoom > 7) {
				this.element.addClass('map-planet-marker-animated');
			} else {
				this.element.removeClass('map-planet-marker-animated');
			}
		} else {
			this.element.addClass('map-planet-marker-hidden');
			this.element.removeClass('map-planet-marker-animated');
		}
	}

	this.refreshSize = function() {
		this.refreshAnim();

		var zoom = map.getZoom();
		var k = Math.pow(2, (zoom - 7));
		// planet size & anchor
		this.element
			.height(this.iconSize * k)
			.width(this.iconSize * k)
			.css('margin-top', this.iconSize * k * -0.5)
			.css('margin-left', this.iconSize * k * -0.5);
		// attack cursor position
		if (zoom < 8 || !this.isMarkerAttack) {
			this.markerAttack.hide();
		} else {
			this.markerAttack.show();
		}
		this.markerAttack
			.css('top', this.iconSize * k + 5)
			.css('left', -50 + this.iconSize * k * 0.5);
		// name position
		if (zoom < 8) {
			this.textName.hide();
		} else {
			this.textName.show();
		}
		this.textName
			.css('top', -30)
			.css('left', -100 + this.iconSize * k * 0.5);
	}

	this.getPosition = function() {
		return {
			x: this.x,
			y: this.y
		}
	}

	this.constructor();
}

}