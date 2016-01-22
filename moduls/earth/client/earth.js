initEarthClient = function() {

initEarthLib();

Meteor.subscribe('zones');
Meteor.subscribe('turns');

Game.Earth.showPage = function() {
	this.render('earth', {
		to: 'content',
		data: {}
	});
}

// ----------------------------------------------------------------------------
// Reserve
// ----------------------------------------------------------------------------

Game.Earth.showReserveMenu = function() {
	Router.current().render('reserve', {
		to: 'earthReserve',
		data: {
			honor: new ReactiveVar(0)
		}
	});
}

Game.Earth.hideReserveMenu = function() {
	Router.current().render(null, {
		to: 'earthReserve'
	});
}

Template.reserve.helpers({
	units: function() {
		return _.map(Game.Unit.items.army.ground, function(val, key) {
			return {
				engName: key,
				count: val.currentLevel()
			}
		})
	},

	honor: function() {
		return Template.instance().data.honor.get();
	}
});

Template.reserve.events({
	'click .items li': function(e, t) {
		if (!$(e.currentTarget).hasClass('disabled')) {
			$(e.currentTarget).toggleClass('active');

			var current = $(e.currentTarget).find('div')[0];
			var name = current.className;
			var count = current.dataset.count;
			var honor = t.data.honor.get();
				
			if (['hbhr', 'lost'].indexOf(name) != -1) {
				honor += Game.Resources.calculateHonorFromReinforcement(game.army.heroes[name].price(count))
				       * ($(e.currentTarget).hasClass('active') ? 1 : -1 );
			} else {
				honor += Game.Resources.calculateHonorFromReinforcement(game.army.ground[name].price(count))
				       * ($(e.currentTarget).hasClass('active') ? 1 : -1 );
			}

			t.data.honor.set(honor);
		}
	},

	'click .select_all': function() {
		$('.items li:not(.disabled,.active)').click();
	},

	'click .send_reinforcement': function() {
		Game.Earth.hideReserveMenu();
		// TODO: Send!
		/*
		var active = $('.reserve .active div');
		var units = [];
		for (var i = 0; i < active.length; i++) {
			var name = active[i].className;
			
			units.push(name);
		}

		$('.reserve .active').removeClass('active');
		Session.set('SendToReserve', 0);

		Meteor.call('sendReinforcement', units, function(err, result) {
			if (err) {
				Notifications.error(err);
			} else {
				Notifications.info('Получено ' + result + ' чести', 'Замечательно!');
				Session.set('honor', 0);
			}
		});
		*/
	}
});

// ----------------------------------------------------------------------------
// Zone info
// ----------------------------------------------------------------------------

Game.Earth.showZoneInfo = function(name) {
	Router.current().render('earthZoneInfo', {
		to: 'earthZoneInfo',
		data: {
			info: function() {
				return {
					id: null,
					name: null,
					armyHumans: null, 
					armyRepts: null
				};
			}
		}
	});
}

Game.Earth.hideZoneInfo = function() {
	Router.current().render(null, {
		to: 'earthZoneInfo'
	});
}

Template.earthZoneInfo.events({
	'click .btn-close': function(e, t) {
		Game.Earth.hideZoneInfo();
	},

	'click .btn-reinforce': function(e, t) {
		Game.Earth.hideZoneInfo();
		Game.Earth.showReserveMenu();
	}
});

// ----------------------------------------------------------------------------
// Zone popup
// ----------------------------------------------------------------------------

Game.Earth.showZonePopup = function(name) {

	// TODO: Fix popup position!

	var zoom = new ReactiveVar(mapView.getZoom());
	mapView.on('zoomend', function(e) {
		zoom.set( mapView.getZoom() );
	});

	var bounds = new ReactiveVar(mapView.getBounds());
	mapView.on('move', function(e) {
		bounds.set( mapView.getBounds() );
	});

	Router.current().render('earthZonePopup', {
		to: 'earthZonePopup',
		data: {
			name: name,
			zoom: zoom,
			bounds: bounds,
			info: function() {
				var zone = Game.EarthZones.getByName(name);
				return {
					id: zone._id,
					name: zone.name,
					isEnemy: zone.isEnemy,
					consuls: 10,
					vote: 20
				};
			}
		}
	});
}

Game.Earth.hideZonePopup = function() {
	Router.current().render(null, {
		to: 'earthZonePopup'
	});
}

Template.earthZonePopup.helpers({
	position: function() {
		var name = Template.instance().data.name;
		var zoom = Template.instance().data.zoom.get();
		var bounds = Template.instance().data.bounds.get();

		var zoneView = zoneViews[ name ];
		var zoneCenter = new L.latLng( zoneView.x, zoneView.y );

		var screenPosition = mapView.latLngToContainerPoint(zoneCenter);

		return {
			x: screenPosition.x + 50,
			y: screenPosition.y - 100
		}
	}
});

Template.earthZonePopup.events({
	'click .btn-info': function(e, t) {
		var name = t.data.name;
		Game.Earth.hideZonePopup();
		Game.Earth.showZoneInfo(name);
	},

	'click .btn-attack': function(e, t) {
		Meteor.call('earth.voteAction', t.data.name);
	},

	'click .btn-reinforce': function(e, t) {
		Game.Earth.hideZonePopup();
		Game.Earth.showReserveMenu();
	}
});

// ----------------------------------------------------------------------------
// ZONE VIEW
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
			fillOpacity: 0.03,
			fillColor: '#374a60'
		}

		var ourStyleHover = {
			color: '#4a82c4',
			weight: 4,
			opacity: 1,
			zIndex: 100
		}

		var enemyStyle = {
			color: '#913b31',
			weight: 2,
			opacity: 0.5,
			fillOpacity: 0,
			fillOpacity: 0.01,
			fillColor: '#913b31'
		}

		var enemyStyleHover = {
			color: '#bd5348',
			weight: 2,
			opacity: 1
		}

		polygon.setStyle( zone.isEnemy ? enemyStyle : ourStyle );

		polygon.on('mouseover', function (e) {
			polygon.setStyle( zone.isEnemy ? enemyStyleHover : ourStyleHover );
		});

		polygon.on('mouseout', function (e) {
			polygon.setStyle( zone.isEnemy ? enemyStyle : ourStyle );
		});

		// TODO: Fix click!
		mapView.on('click', function(e) {
			Game.Earth.hideZonePopup();
		});
		polygon.on('click', function(e) {
			Game.Earth.showZonePopup(zone.name);
		});

		// marker
		marker = L.marker(
			[this.x, this.y],
			{
				icon: L.divIcon({
					className: 'earth-marker',
					iconSize: [iconSize, iconSize],
					iconAnchor: [iconSize / 2, iconSize / 2]
				})
			}
		);

		// debug
		marker.on('click', function(e) { console.log(zone.name); });
	}

	this.update = function() {
		zone = Game.EarthZones.getByName(this.name);

		if (zone.isVisible) {

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
			// ---------------------------------------
			// TODO: Как считать заполненность шкалы?!
			var humans = (zone.userArmy) ? 100 : 0;
			var reptiles = (zone.enemyArmy) ? 100 : 0;
			// ---------------------------------------
			this.showProgress(humans, reptiles, iconSize * k);
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

	// create existing zones
	var zones = Game.EarthZones.getAll().fetch();
	for (var i = 0; i < zones.length; i++) {
		if (mapView && zoneViews) {
			zoneViews[ zones[i].name ] = new ZoneView(mapView, zones[i]);
			zoneViews[ zones[i].name ].update();
		}
	}

	// track db updates
	Game.EarthZones.getAll().observeChanges({
		changed: function(id, fields) {
			var name = Game.EarthZones.Collection.findOne({ _id: id }).name;
			if (mapView && zoneViews && zoneViews[ name ]) {
				zoneViews[ name ].update();
			}
		}
	});

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
	mapView = null;
	mapBounds = null;
	zoneViews = {};
	lineViews = {};
})

Template.earth.helpers({
	
});

Template.earth.events({

});

}