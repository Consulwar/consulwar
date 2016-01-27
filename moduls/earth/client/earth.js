initEarthClient = function() {

initEarthLib();

Meteor.subscribe('zones');
Meteor.subscribe('turns');

Game.Earth.showMap = function() {
	this.render('earth', {
		to: 'content',
		data: {}
	});
}

// ----------------------------------------------------------------------------
// Reserve
// ----------------------------------------------------------------------------

Game.Earth.showReserve = function() {
	Router.current().render('reserve', {
		to: 'content',
		data: {
			honor: new ReactiveVar(0)
		}
	});
}

Template.reserve.helpers({
	units: function() {
		return _.map(Game.Unit.items.army.ground, function(val, key) {
			return {
				engName: key,
				max: val.currentLevel(),
				count: 0
			}
		});
	},

	honor: function() {
		return Template.instance().data.honor.get();
	}
});

Template.reserve.events({
	'click .btn-all': function(e, t) {
		$('.units li').each(function(index, element) {
			var max = Number( $(element).attr('data-max') );
			$(element).find('.count').val( max );
			$(element).find('.count').change();
		});
	},

	'change .units input': function (e, t) {
		var value = parseInt( e.currentTarget.value );
		var max = parseInt( $(e.currentTarget.parentElement).attr('data-max') );

		if (value < 0) {
			e.currentTarget.value = 0;
		} else if (value > max) {
			e.currentTarget.value = max;
		}

		// recalculate honor
		var honor = 0;

		$('.units li').each(function(index, element) {
			var id = $(element).attr('data-id');
			var max = parseInt( $(element).attr('data-max') );
			var count = parseInt( $(element).find('.count').val() );

			if (max < count) {
				count = max;
			}

			if (count > 0) {
				honor += Game.Resources.calculateHonorFromReinforcement(
					Game.Unit.items.army.ground[id].price(count)
				);
			}
		});

		t.data.honor.set(honor);
	},

	'click .btn-send': function(e, t) {
		var total = 0;
		var units = {};

		$('.units li').each(function(index, element) {
			var id = $(element).attr('data-id');
			var max = parseInt( $(element).attr('data-max') );
			var count = parseInt( $(element).find('.count').val() );

			if (max > 0 && count > 0) {
				units[ id ] = Math.min(max, count);
				total += units[ id ];
			}

			$(element).find('.count').val(0);
			$(element).find('.count').change();
		});

		if (total <= 0) {
			Notifications.info('Выберите войска для отправки');
			return;
		}

		Meteor.call('earth.sendReinforcement', units);
		Notifications.success('Войска отправлены на землю');
	}
});

// ----------------------------------------------------------------------------
// Zone info
// ----------------------------------------------------------------------------

Game.Earth.showZone = function() {
	var name = this.params.name;

	Router.current().render('earthZoneInfo', {
		to: 'content',
		data: {
			name: name
		}
	});
}

Template.earthZoneInfo.helpers({
	info: function() {
		var zone = Game.EarthZones.getByName(Template.instance().data.name);

		var currentUserPower = Game.EarthZones.calcUnitsPower( zone.userArmy );
		var currentEnemyPower = Game.EarthZones.calcUnitsPower( zone.enemyArmy );

		var userArmy = (zone.userArmy) ? [] : null;
		for (var side in zone.userArmy) {
			for (var group in zone.userArmy[side]) {
				for (var name in zone.userArmy[side][group]) {
					userArmy.push({
						name: Game.Unit.items[side][group][name].name,
						count: zone.userArmy[side][group][name]
					})
				}
			}
		}

		var enemyArmy = (zone.enemyArmy) ? [] : null;
		for (var side in zone.enemyArmy) {
			for (var group in zone.enemyArmy[side]) {
				for (var name in zone.enemyArmy[side][group]) {
					enemyArmy.push({
						name: Game.Unit.items[side][group][name].name,
						count: zone.enemyArmy[side][group][name]
					})
				}
			}
		}

		var userCount = 0;
		var totalUserPower = 0;
		var enemyCount = 0;
		var totalEnemyPower = 0;

		var zones = Game.EarthZones.getAll().fetch();
		for (var i = 0; i < zones.length; i++) {
			if (zones[i].isEnemy) {
				enemyCount++;
			} else {
				userCount++;
			}

			totalUserPower += Game.EarthZones.calcUnitsPower( zones[i].userArmy );
			totalEnemyPower += Game.EarthZones.calcUnitsPower( zones[i].enemyArmy );
		}

		var totalCount = userCount + enemyCount;
		var capturedPercent = Math.round( (userCount / totalCount) * 100 );

		var userPower = (totalUserPower > 0)
			? Math.round( (currentUserPower / totalUserPower) * 100 )
			: 0;

		var enemyPower = (totalEnemyPower > 0)
			? Math.round( (currentEnemyPower / totalEnemyPower) * 100 )
			: 0;

		return {
			name: zone.name,
			isCurrent: zone.isCurrent,
			capturedPercent: capturedPercent,
			userCount: userCount,
			userPower: userPower,
			userArmy: userArmy,
			enemyCount: enemyCount,
			enemyPower: enemyPower,
			enemyArmy: enemyArmy
		};
	}
});

// ----------------------------------------------------------------------------
// Zone popup
// ----------------------------------------------------------------------------

Game.Earth.showZonePopup = function(name, latlng) {
	if (!mapView || !zoneViews[name]) {
		return;
	}

	$('.leaflet-popup-pane').html('');

	var zoom = new ReactiveVar( mapView.getZoom() );
	mapView.on('zoomend', function(e) {
		zoom.set( mapView.getZoom() );
	});

	Blaze.renderWithData(
		Template.earthZonePopup, {
			name: name,
			position: function() {
				zoom.get();
				return mapView.latLngToLayerPoint(latlng);
			}
		},
		$('.leaflet-popup-pane')[0]
	);
}

Game.Earth.hideZonePopup = function() {
	if (!mapView) {
		return;
	}

	$('.leaflet-popup-pane').html('');
}

Template.earthZonePopup.helpers({
	zone: function() {
		return Game.EarthZones.getByName(Template.instance().data.name);
	},

	turn: function() {
		var turn = Game.EarthTurns.getLast();
		if (!turn) {
			return null;
		}

		var zone = Game.EarthZones.getByName(Template.instance().data.name);
		if (!zone) {
			return null;
		}
		if (!zone.isCurrent) {
			if (turn.type != 'move' || turn.actions[zone.name] == undefined) {
				return null;
			}
		}

		if (turn) {
			turn.count = turn.users.length;
		}

		if (turn
		 && turn.users.indexOf(Meteor.userId()) < 0
		 && Game.User.getVotePower() > 0
		) {
			turn.canVote = true;
		} else {
			turn.canVote = false;
		}

		return turn;
	},

	votePower: function() {
		return Game.User.getVotePower();
	},

	votePercent: function(name, turn) {
		if (!name || !turn || turn.totalVotePower <= 0) {
			return 0;
		}

		var totalValue = turn.totalVotePower;
		var actionValue = turn.actions[ name ];
		return Math.round( actionValue / totalValue * 100 );
	}
});

Template.earthZonePopup.events({
	'click .btn-attack': function(e, t) {
		var action = $(e.currentTarget).attr('data-action');
		Meteor.call('earth.voteAction', action);
	}
});

// ----------------------------------------------------------------------------
// Zone view
// ----------------------------------------------------------------------------

var ZoneView = function(mapView, zoneData) {
	this.id = null;
	this.name = null;
	this.x = 0;
	this.y = 0;

	var zone = zoneData;
	var iconSize = 50;
	var lines = null;
	var polygon = null;
	var marker = null;
	var element = null;
	var canvasElement = null;

	var reptilePower = 0;
	var humanPower = 0;

	this.constructor = function() {
		this.id = zone._id;
		this.name = zone.name;

		// polygon
		polygon = L.GeoJSON.geometryToLayer({
			type: 'Feature',
			geometry: zone.geometry
		});

		var polygonCenter = polygon.getBounds().getCenter();
		this.x = polygonCenter.lat;
		this.y = polygonCenter.lng;

		var ourStyle = {
			color: '#374a60',
			weight: 3,
			opacity: 1,
			zIndex: 100,
			fillOpacity: 0.05,
			fillColor: '#374a60'
		}

		var ourStyleHover = {
			color: '#4a82c4',
			weight: 4,
			opacity: 1,
			fillOpacity: 0.2,
			zIndex: 100
		}

		var enemyStyle = {
			color: '#913b31',
			weight: 2,
			opacity: 0.1,
			fillOpacity: 0,
			fillOpacity: 0.05,
			fillColor: '#913b31'
		}

		var enemyStyleHover = {
			color: '#bd5348',
			weight: 2,
			fillOpacity: 0.2,
			opacity: 1
		}

		polygon.setStyle( zone.isEnemy ? enemyStyle : ourStyle );

		polygon.on('mouseover', function (e) {
			polygon.setStyle( zone.isEnemy ? enemyStyleHover : ourStyleHover );
		});

		polygon.on('mouseout', function (e) {
			polygon.setStyle( zone.isEnemy ? enemyStyle : ourStyle );
		});

		// marker
		marker = L.marker(
			[this.x, this.y],
			{
				clickable: false,
				icon: L.divIcon({
					className: 'earth-marker',
					iconSize: [iconSize, iconSize],
					iconAnchor: [iconSize / 2, iconSize / 2]
				})
			}
		);

		// events
		polygon.on('click', this.showPopup.bind(this));

		// debug
		// marker.on('click', function(e) { console.log(zone.name); });
	}

	this.update = function() {
		zone = Game.EarthZones.getByName(this.name);

		if (zone.isVisible) {

			// calculate army power
			var totalHumanPower = Game.EarthZones.calcTotalPower(false);
			if (totalHumanPower > 0) {
				var currentHumanPower = Game.EarthZones.calcUnitsPower(zone.userArmy);
				humanPower = Math.round( (currentHumanPower / totalHumanPower) * 100 );
			} else {
				humanPower = 0;
			}

			var totalReptilePower = Game.EarthZones.calcTotalPower(true);
			if (totalReptilePower > 0) {
				var currentReptilePower = Game.EarthZones.calcUnitsPower(zone.enemyArmy);
				reptilePower = Math.round( (currentReptilePower / totalReptilePower ) * 100);
			} else {
				reptilePower = 0;
			}

			// extend map bounds
			if (mapBounds) {
				mapBounds.extend(L.latLng(polygon.getBounds().getSouthWest()));
				mapBounds.extend(L.latLng(polygon.getBounds().getNorthEast()));
			} else {
				mapBounds = polygon.getBounds();
			}

			if (mapBounds) {
				mapView.setMaxBounds(mapBounds);
				mapView.fitBounds(mapBounds);
			}

			// show on map
			polygon.addTo(mapView);
			marker.addTo(mapView);

			element = $(marker._icon);
			element.html('<canvas></canvas>');
			canvasElement = $(element.find('canvas'));

			if (zone.isEnemy) {
				polygon.bringToBack();
				element.addClass('earth-marker-enemy');
				element.removeClass('earth-marker-our');
			} else {
				polygon.bringToFront();
				element.removeClass('earth-marker-enemy');
				element.addClass('earth-marker-our');
			}

			mapView.on('zoomend', this.refreshZoom.bind(this));
			this.refreshZoom();

		} else {

			// remove from map
			if (mapView.hasLayer(polygon)) {
				mapView.removeLayer(polygon);
			}
			if (mapView.hasLayer(marker)) {
				mapView.removeLayer(marker);
			}

		}
	}

	this.showPopup = function(e) {
		if (e && e.latlng) {
			Game.Earth.showZonePopup(zone.name, e.latlng);
		}
	}

	this.hidePopup = function() {
		Game.Earth.hideZonePopup();
	}

	this.refreshZoom = function() {
		if (!zone || !zone.isVisible) {
			return;
		}

		var zoom = mapView.getZoom();
		var k = Math.pow(2, (zoom - 4));

		if (k > 2) {
			k = 2;
		} else if (k < 1) {
			k = 1;
		}

		element
			.height(iconSize * k)
			.width(iconSize * k)
			.css('margin-top', iconSize * k * -0.5)
			.css('margin-left', iconSize * k * -0.5);

		if (zoom < 5) {
			this.hideProgress();
		} else {
			this.showProgress(humanPower, reptilePower, iconSize * k);
		}
	}

	this.showProgress = function(humans, reptiles, size) {
		canvasElement.show();
		canvasElement
			.css('left', size * -0.5 + 25)
			.css('top', size * -0.5 + 25);

		canvasElement
			.css('left', 0)
			.css('top', 0);

		var canvas = canvasElement[0];
		canvas.width = size;
		canvas.height = size;

		var context = canvas.getContext('2d');
		if (!context) {
			return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);

		var x = canvas.width / 2;
		var y = canvas.height / 2;
		var radius = canvas.width / 3;
		var lineWidth = canvas.width / 15;
		var offset = canvas.width / 100;

		// enemy full
		context.beginPath();
		context.arc(x + offset, y, radius, Math.PI * 0.5, Math.PI * -0.5, true);
		context.lineWidth = lineWidth;
		context.strokeStyle = '#913b31';
		context.stroke();
		// enemy current
		context.beginPath();
		context.arc(x + offset, y, radius, Math.PI * 0.5, Math.PI * (0.5 - reptiles / 100), true);
		context.lineWidth = lineWidth;
		context.strokeStyle = '#D05F4A';
		context.stroke();
		// our full
		context.beginPath();
		context.arc(x - offset, y, radius, Math.PI * 0.5, Math.PI * 1.5, false);
		context.lineWidth = lineWidth;
		context.strokeStyle = '#374a60';
		context.stroke();
		// our current
		context.beginPath();
		context.arc(x - offset, y, radius, Math.PI * 0.5, Math.PI * (0.5 + humans / 100), false);
		context.lineWidth = lineWidth;
		context.strokeStyle = '#4a82c4';
		context.stroke();
	}

	this.hideProgress = function() {
		canvasElement.hide();
		var canvas = canvasElement[0];

		var context = canvas.getContext('2d');
		if (!context) {
			return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	this.constructor();
}

// ----------------------------------------------------------------------------
// Line view
// ----------------------------------------------------------------------------

var LineView = function(start, finish) {

	var line = null;
	var text = null;
	var textElement = null;

	this.constructor = function() {
		// create line
		line = new L.Polyline([], {
			clickable: false,
			color: '#4a82c4',
			weight: 3,
			smoothFactor: 1
		}).addTo(mapView);
		line.addLatLng(L.latLng(start.x, start.y));
		line.addLatLng(L.latLng(finish.x, finish.y));

		// create line text
		text = new L.marker([
			Math.min(start.x, finish.x) + Math.abs(start.x - finish.x) / 2,
			Math.min(start.y, finish.y) + Math.abs(start.y - finish.y) / 2
		], {
			clickable: false,
			icon: L.divIcon({
				className: 'earth-marker-connection-text'
			})
		}).addTo(mapView);

		textElement = $(text._icon);
	}

	this.update = function(value) {
		if (textElement) {
			textElement.html('<p>' + value + '</p>');
		}
	}

	this.remove = function() {
		if (line) {
			if (mapView && mapView.hasLayer(line)) {
				mapView.removeLayer(line);
			}
			line = null;
		}

		if (text) {
			if (mapView && mapView.hasLayer(text)) {
				mapView.removeLayer(text);
			}
			text = null;
			textElement = null;
		}
	}

	this.constructor();
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

var mapView = null;
var mapBounds = null;
var zoneViews = {};
var lineViews = {};
var observerZones = null;

Template.earth.onRendered(function() {

	if (!mapView) {

		// first time manualy create div inside template
		$('#map-content').html('<div id="map-earth"></div>');

		mapView = L.map('map-earth', {
			zoomAnimation: false,
			zoomControl: false,
			doubleClickZoom: false,
			attributionControl: false,
			fadeAnimation: false,
			inertia: false,
			zoom: 4,
			minZoom: 4,
			maxZoom: 6
		});
		mapView.setView([47.36865, 8.539183], 4);
		mapView.spin(false);

		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			id: 'zav39.1f2ff4e8',
			accessToken: 'pk.eyJ1IjoiemF2MzkiLCJhIjoiNDQzNTM1OGVkN2FjNDJmM2NlY2NjOGZmOTk4NzNiOTYifQ.urd1R1KSQQ9WTeGAFLOK8A'
		}).addTo(mapView);
		
		mapView.on('click', function(e) {
			Game.Earth.hideZonePopup();
		});

		// create existing zones
		var zones = Game.EarthZones.getAll().fetch();
		for (var i = 0; i < zones.length; i++) {
			if (mapView && zoneViews) {
				zoneViews[ zones[i].name ] = new ZoneView(mapView, zones[i]);
				zoneViews[ zones[i].name ].update();
			}
		}

		// track db updates
		observerZones = Game.EarthZones.getAll().observeChanges({
			changed: function(id, fields) {
				var name = Game.EarthZones.Collection.findOne({ _id: id }).name;
				if (mapView && zoneViews && zoneViews[ name ]) {
					zoneViews[ name ].update();
				}
			}
		});

	} else {
		
		// put existing map content into template
		$('#map-content').html( mapView._container );

	}

	// show turn lines and track db updates
	this.autorun(function() {
		for (var key in lineViews) {
			lineViews[ key ].remove();
		}

		var turn = Game.EarthTurns.getLast();
		if (!turn || turn.type != 'move') {
			return;
		}

		var currentZone = Game.EarthZones.getCurrent();
		if (!currentZone) {
			return;
		}

		for (var name in turn.actions) {
			if (name == currentZone.name) {
				continue;
			}

			var start = zoneViews[ currentZone.name ];
			var finish = zoneViews[ name ];

			if (!start || !finish) {
				continue;
			}

			var value = (turn.totalVotePower > 0)
				? (turn.actions[name] / turn.totalVotePower) * 100
				: 0;

			lineViews[ name ] = new LineView(start, finish);
			lineViews[ name ].update( Math.round(value) + '%' );
		}
	});
})

Template.earth.onDestroyed(function() {
	Game.Earth.hideZonePopup();

	if (observerZones) {
		observerZones.stop();
		observerZones = null;
	}
	
	/* Code for map remove
	zoneViews = {};
	lineViews = {};
	
	if (mapView) {
		mapView.remove();
		mapView = null;
		mapBounds = null;
	}
	*/
});

}