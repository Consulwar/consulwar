var map = null;
Template.earth.onRendered(function() {
	/*map = L.map('map', {
		zoomAnimation: false,
		fadeAnimation: false,
		inertia: false
	});
	map.setView([47.36865, 8.539183], 2)
	map.spin(true);*/
/*
	var defaultStyle = {
		color: "red",
		weight: 2,
		opacity: 0.6,
		fillOpacity: 0.1,
		fillColor: "#2262CC"
	}

	var ourStyle = {
		color: "green",
		weight: 2,
		opacity: 0.6,
		fillOpacity: 0.1,
		fillColor: "green"
	}

	var highlightStyle = {
		color: '#2262CC', 
		weight: 3,
		opacity: 0.6,
		fillOpacity: 0.65,
		fillColor: '#2262CC'
	};

	var enemyStyle = {
		fillColor: '#bd5348',
		fillOpacity: 0.65
	}

	var ourStyle = {
		fillColor: '#4a82c4',
		fillOpacity: 0.65
	}

	var disabledStyle = {
		fillOpacity: 0,
		weight: 0,
	}
*/
/*
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



	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		//attribution: '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		//maxZoom: 18,
		id: 'zav39.1f2ff4e8',
		accessToken: 'pk.eyJ1IjoiemF2MzkiLCJhIjoiNDQzNTM1OGVkN2FjNDJmM2NlY2NjOGZmOTk4NzNiOTYifQ.urd1R1KSQQ9WTeGAFLOK8A'
	}).addTo(map);


	$.getJSON('/geo.json', function(data) {
		L.geoJson(data.features, {
			onEachFeature: function(feature, layer) {

				if (['Argentina', 'South Africa', 'Pakistan', 'New Zealand', 'Japan', 'Swedan'].indexOf(feature.properties.name) != -1) {
					var style = ourStyle;
					var styleHover = ourStyleHover;

					layer.bringToFront();
				} else {
					var style = enemyStyle;
					var styleHover = enemyStyleHover;

					layer.bringToBack();
				}

				(function(layer, properties, style, styleHover) {
					layer.setStyle(style);

					layer.on("mouseover", function (e) {
						layer.setStyle(styleHover);
					})

					layer.on("mouseout", function (e) {
						layer.setStyle(style);
					})
				})(layer, feature.properties, style, styleHover)
			}
		}).addTo(map);
		map.spin(false);
	})
	*/
})

Template.earth.helpers({
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
				name: Game.Unit.items.reptiles.rground[engName].name,
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
				name: Game.Unit.items.army.ground[engName].name,
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
});

Template.earth.events({
	
});