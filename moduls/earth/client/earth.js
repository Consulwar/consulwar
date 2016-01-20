initEarthClient = function() {

initEarthLib();

Meteor.subscribe('zones');

Game.Earth.showPage = function() {
	this.render('earth', {
		to: 'content',
		data: {}
	});
}

// ----------------------------------------------------------------------------
// ZONE VIEW
// ----------------------------------------------------------------------------

var ZoneView = function(mapView, zone) {
	this.id = null;
	this.name = null;
	this.x = 0;
	this.y = 0;

	var iconSize = 50;
	var lines = null;
	var polygon = null;
	var marker = null;
	var element = null;
	var canvasElement = null;

	this.constructor = function() {
		this.id = zone._id;
		this.name = zone.name;

		// Polygon view
		polygon = L.GeoJSON.geometryToLayer({
			type: 'Feature',
			geometry: zone.geometry
		}).addTo(mapView);

		mapBounds.extend(L.latLng(polygon.getBounds().getSouthWest()));
		mapBounds.extend(L.latLng(polygon.getBounds().getNorthEast()));

		if (zone.isEnemy) {
			polygon.bringToBack();
		} else {
			polygon.bringToFront();
		}

		var ourStyle = {
			color: "#374a60",
			weight: 3,
			opacity: 1,
			zIndex: 100,
			fillOpacity: 0.03,
			fillColor: '#374a60'
		}

		var ourStyleHover = {
			color: "#4a82c4",
			weight: 4,
			opacity: 1,
			zIndex: 100
		}

		var enemyStyle = {
			color: "#913b31",
			weight: 2,
			opacity: 0.5,
			fillOpacity: 0,
			fillOpacity: 0.01,
			fillColor: '#913b31'
		}

		var enemyStyleHover = {
			color: "#bd5348",
			weight: 2,
			opacity: 1
		}

		polygon.setStyle( zone.isEnemy ? enemyStyle : ourStyle );

		polygon.on("mouseover", function (e) {
			polygon.setStyle( zone.isEnemy ? enemyStyleHover : ourStyleHover );
		});

		polygon.on("mouseout", function (e) {
			polygon.setStyle( zone.isEnemy ? enemyStyle : ourStyle );
		});

		// marker
		var polygonCenter = polygon.getBounds().getCenter();
		this.x = polygonCenter.lat;
		this.y = polygonCenter.lng;

		marker = L.marker(
			[this.x, this.y],
			{
				icon: L.divIcon({
					className: 'earth-marker',
					iconSize: [iconSize, iconSize],
					iconAnchor: [iconSize / 2, iconSize / 2]
				})
			}
		).addTo(mapView);

		element = $(marker._icon);

		if (zone.isEnemy) {
			element.addClass('earth-marker-enemy');
			element.removeClass('earth-marker-our');
		} else {
			element.removeClass('earth-marker-enemy');
			element.addClass('earth-marker-our');
		}

		element.append('<canvas></canvas>');
		canvasElement = $(element.find('canvas'));
		
		// events
		mapView.on('zoomend', this.refreshZoom.bind(this));
		this.refreshZoom();

		// debug
		marker.on('click', function(e) { console.log(zone.name); });
		marker.on('mouseover', this.showConnections.bind(this));
		marker.on('mouseout', this.hideConnections.bind(this));
	}

	this.refreshZoom = function() {
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
			// TODO: Get real info!
			this.showProgress(50, 75, iconSize * k);
		}
	}

	this.showConnections = function() {
		if (!zone || !zone.links) {
			return;
		}

		for (var i = 0; i < zone.links.length; i++) {
			var zoneView = zoneViews[ zone.links[i] ];
			if (zoneView) {
				// create line
				var lineView = new L.Polyline([], {
					color: '#4a82c4',
					weight: 3,
					smoothFactor: 1
				}).addTo(mapView);
				lineView.addLatLng(L.latLng(this.x, this.y));
				lineView.addLatLng(L.latLng(zoneView.x, zoneView.y));

				// create line text
				var lineText = new L.marker([
					Math.min(this.x, zoneView.x) + Math.abs(this.x - zoneView.x) / 2,
					Math.min(this.y, zoneView.y) + Math.abs(this.y - zoneView.y) / 2
				], {
					icon: L.divIcon({
						className: 'earth-marker-connection-text'
					})
				}).addTo(mapView);

				$(lineText._icon).append('<p>' + Math.round( Math.random() * 50 + 10 ) + '%</p>');

				lineView.lineText = lineText;

				// store line inside array
				if (!lines) {
					lines = [];
				}
				lines.push(lineView);
			}
		}
	}

	this.hideConnections = function() {
		if (lines) {
			for (var i = 0; i < lines.length; i++) {
				mapView.removeLayer( lines[i].lineText );
				mapView.removeLayer( lines[i] );
			}
			lines = null;
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
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	this.constructor();
}

var createZone = function(name, zone) {
	if (mapView && zoneViews) {
		zoneViews[ name ] = new ZoneView(mapView, zone);
	}
}

// ----------------------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------------------

var mapView = null;
var mapBounds = null;
var zoneViews = {};

Template.earth.onRendered(function() {

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

	// Map Events
	/* TODO: Refactoring!!!!!!!!!!!
	mapView.on('move', function(e) {
		Session.set('popup_info', null);
	});

	mapView.on('zoomend', function(e) {
		Session.set('popup_info', null);
	});

	mapView.on('click', function(e) {
		Session.set('popup_info', null);
	});

	Session.set('popup_info', null);
	*/

	// TODO: Calc max bounds!
	mapBounds = L.latLngBounds(L.latLng(0, 0), L.latLng(0, 0));

	var zones = Game.EarthZones.getAll().fetch();
	for (var i = 0; i < zones.length; i++) {
		createZone( zones[i].name, zones[i] );
	}

	mapView.setMaxBounds(mapBounds);
	mapView.fitBounds(mapBounds);
})

Template.earth.onDestroyed(function() {
	mapView = null;
	mapBounds = null;
	zoneViews = {};
})

Template.earth.helpers({
	// TODO: Refactoring!
	/*
	popup_info: function() {
		return Session.get('popup_info');
	},

	zone_info: function() {
		return Session.get('zone_info');
	},

	items: function() {
		return _.map(Game.Point.items, function(value) { return value });
	},

	active_item: function() { return Session.get('active_item'); },
	point_info: function() { return Session.get('point_info'); },

	reptiles: function() {
		if (!Session.get('point_info')) {
			return [];
		}

		var reptiles = Session.get('point_info').reptiles;

		return _.map(reptiles, function(value, engName) {
			return {
				engName: engName,
				name: Game.Units.items.reptiles.rground[engName].name,
				count: value
			}
		})
	},

	army: function() {
		if (!Session.get('point_info')) {
			return [];
		}
		
		var army = Session.get('point_info').army;

		return _.map(army, function(value, engName) {
			return {
				engName: engName,
				name: Game.Units.items.army.ground[engName].name,
				count: value
			}
		})
	},

	currentEffects: function() {
		var item = Session.get('active_item');

		var effects = [];

		for (var groupName in item.type.effects) {
			var group = item.type.effects[groupName];

			for (var type in group) {
				effects.push({
					name: groupName,
					affect: type,
					value: group[type]
				});
			}
		}

		return effects;
	}
	*/
});

Template.earth.events({
	// TODO: Refactoring!
	/*
	'click .btn-info': function(e) {
		var zoneId = $(e.currentTarget).attr("data-id");
		zone = zones[ zoneId ];
		zone.hidePopup();
		Session.set('zone_info', zone.info);
	},

	'click .btn-close': function(e) {
		Session.set('zone_info', null);
	},
	*/
});

}