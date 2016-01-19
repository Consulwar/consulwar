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

	// -----------------------------------
	// TODO: move to css
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
	// -------------------------------------

	this.id = null;
	this.data = null;
	this.polygon = null;

	this.iconSize = 0;
	this.x = 0;
	this.y = 0;

	this.isEnemy = true;
	this.marker = null;
	this.element = null;
	this.canvas = null;

	this.info = null;

	this.constructor = function() {
		// TODO: Remove dat shit!
		var data = {};

		this.id = zone._id;
		this.data = data;
		this.isEnemy = zone.isEnemy;

		// Create a plygon
		var polygon = L.GeoJSON.geometryToLayer({
			type: 'Feature',
			geometry: zone.geometry
		});
		this.polygon = polygon;

		mapBounds.extend(L.latLng(polygon.getBounds().getSouthWest()));
		mapBounds.extend(L.latLng(polygon.getBounds().getNorthEast()));

		// -------
		// debug
		data.armyEnemy = Math.round( Math.random() * 100 );
		data.armyOur = Math.round( Math.random() * 100 );
		// -------

		// -------
		// debug
		/*
		this.info = {
			id: data.id,
			name: data.properties.name,
			isEnemy: this.isEnemy,
			consuls: Math.round( Math.random() * 500 + 1000 ),
			vote: Math.round( Math.random() * 20 + 20 ),
			armyHumans: [{
				name: 'Имя юнита 1',
				count: 42
			}, {
				name: 'Имя юнита 2',
				count: 42
			}, {
				name: 'Имя юнита 3',
				count: 42
			}, {
				name: 'Имя юнита 4',
				count: 42
			}, {
				name: 'Имя юнита 5',
				count: 42
			}, {
				name: 'Имя юнита 6',
				count: 42
			}, {
				name: 'Имя юнита 7',
				count: 42
			}, {
				name: 'Имя юнита 8',
				count: 42
			}, {
				name: 'Имя юнита 9',
				count: 42
			}, {
				name: 'Имя юнита 10',
				count: 42
			}, {
				name: 'Имя юнита 11',
				count: 42
			}, {
				name: 'Имя юнита 12',
				count: 42
			}],
			armyRepts: [{
				name: 'Имя юнита 1',
				count: 42
			}, {
				name: 'Имя юнита 2',
				count: 42
			}, {
				name: 'Имя юнита 3',
				count: 42
			}, {
				name: 'Имя юнита 4',
				count: 42
			}, {
				name: 'Имя юнита 5',
				count: 42
			}, {
				name: 'Имя юнита 6',
				count: 42
			}, {
				name: 'Имя юнита 7',
				count: 42
			}, {
				name: 'Имя юнита 8',
				count: 42
			}, {
				name: 'Имя юнита 9',
				count: 42
			}, {
				name: 'Имя юнита 10',
				count: 42
			}, {
				name: 'Имя юнита 11',
				count: 42
			}, {
				name: 'Имя юнита 12',
				count: 42
			}]
		};
		*/
		// -------

		// Polygon view
		if (!this.isEnemy) {
			var style = ourStyle;
			var styleHover = ourStyleHover;
			polygon.bringToFront();
		} else {
			var style = enemyStyle;
			var styleHover = enemyStyleHover;
			polygon.bringToBack();
		}

		(function(polygon, style, styleHover) {
			polygon.setStyle(style);

			polygon.on("mouseover", function (e) {
				polygon.setStyle(styleHover);
			})

			polygon.on("mouseout", function (e) {
				polygon.setStyle(style);
			})
		})(polygon, style, styleHover)

		polygon.addTo(mapView);

		// marker
		this.x = polygon.getBounds().getCenter().lat;
		this.y = polygon.getBounds().getCenter().lng;

		this.iconSize = 50;

		this.marker = L.marker(
			[this.x, this.y],
			{
				icon: L.divIcon({
					className: 'earth-marker',
					iconSize: [this.iconSize, this.iconSize],
					iconAnchor: [this.iconSize / 2, this.iconSize / 2]
				})
			}
		).addTo(mapView);

		this.element = $(this.marker.getElement());

		if (this.isEnemy) {
			this.element.addClass('earth-marker-enemy');
			this.element.removeClass('earth-marker-our');
		} else {
			this.element.removeClass('earth-marker-enemy');
			this.element.addClass('earth-marker-our');
		}

		this.element.append('<canvas></canvas>');
		this.canvas = $(this.element.find('canvas'));
		
		// Events

		// this.marker.on('mouseover', this.showPopup.bind(this));
		// this.marker.on('mouseout', this.hidePopup.bind(this));
		this.marker.on('click', this.showPopup.bind(this));

		/* Debug
		this.marker.on('mouseover', this.showConnections.bind(this));
		this.marker.on('mouseout', this.hideConnections.bind(this));
		*/

		mapView.on('move', this.refreshPosition.bind(this));
		mapView.on('zoomend', this.refreshZoom.bind(this));

		this.refreshPosition();
		this.refreshZoom();
	}

	this.refreshPosition = function() {

	}

	this.refreshZoom = function() {
		var zoom = mapView.getZoom();
		var k = Math.pow(2, (zoom - 4));

		if (k > 2) {
			k = 2;
		} else if (k < 1) {
			k = 1;
		}

		this.element
			.height(this.iconSize * k)
			.width(this.iconSize * k)
			.css('margin-top', this.iconSize * k * -0.5)
			.css('margin-left', this.iconSize * k * -0.5);

		// TODO: Refactoring!
		/*
		if (zoom < 5) {
			this.hideProgress();
		} else {
			this.showProgress(data.armyOur, data.armyEnemy, this.iconSize * k);
		}
		*/
	}

	this.showConnections = function() {
		if (!data || !data.borders) {
			return;
		}

		for (var i = 0; i < data.borders.length; i++) {
			var zoneView = zones[ data.borders[i].id ];
			if (zoneView) {
				var lineView = new L.Polyline([], {
					color: '#4a82c4',
					weight: 3,
					smoothFactor: 1
				}).addTo(mapView);
				lineView.addLatLng(L.latLng(this.x, this.y));
				lineView.addLatLng(L.latLng(zoneView.x, zoneView.y));

				var lineText = new L.marker([
					Math.min(this.x, zoneView.x) + Math.abs(this.x - zoneView.x) / 2,
					Math.min(this.y, zoneView.y) + Math.abs(this.y - zoneView.y) / 2
				], {
					icon: L.divIcon({
						className: 'earth-marker-connection-text'
					})
				}).addTo(mapView);
				$(lineText.getElement()).append('<p>' + Math.round( Math.random() * 50 + 10 ) + '%</p>');

				lineView.lineText = lineText;

				if (!this.lines) {
					this.lines = [];
				}
				this.lines.push(lineView);
			}
		}
	}

	this.hideConnections = function() {
		if (this.lines) {
			for (var i = 0; i < this.lines.length; i++) {
				mapView.removeLayer( this.lines[i].lineText );
				mapView.removeLayer( this.lines[i] );
			}
			this.lines = null;
		}
	}

	this.showPopup = function() {
		Session.set('popup_info', this.info);

		var popup = $('.point-popup-container');

		var position = mapView.latLngToContainerPoint(this.marker.getLatLng());
		position.x += 40;
		position.y -= 40;

		popup.css('left', position.x + 'px')
		popup.css('top', position.y + 'px');
	}

	this.hidePopup = function() {
		Session.set('popup_info', null);
	}

	this.hideProgress = function() {
		this.canvas.hide();
		var canvas = this.canvas[0];
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	this.showProgress = function(humans, reptiles, size) {
		this.canvas.show();
		this.canvas
			.css('left', size * -0.5 + 25)
			.css('top', size * -0.5 + 25);

		this.canvas
			.css('left', 0)
			.css('top', 0);

		var canvas = this.canvas[0];
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

	this.constructor(); 
}

var createZone = function(id, zone) {
	if (mapView && zoneViews) {
		zoneViews[ id ] = new ZoneView(mapView, zone);
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
		createZone( zones[i]._id, zones[i] );
	}

	mapView.setMaxBounds(mapBounds);
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