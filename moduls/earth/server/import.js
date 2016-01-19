initEarthServerImport = function () {

var availableZones = [
	'Nigeria',
	'Egypt',
	'South Africa',
	'Algeria',
	'Morocco',
	'Kenya',
	'Angola',
	'Ethiopia',
	'Tunisia',
	'Ghana',
	'Sudan',
	'Libya',
	'Uganda',
	'Cameroon',
	'Democratic Republic of the Congo',
	'Ivory Coast',
	'Botswana',
	'Gabon',
	'Mozambique',
	'Chad',
	'Senegal',
	'Burkina Faso',
	'Zambia',
	'Madagascar',
	'Mauritius',
	'Republic of the Congo',
	'Mali',
	'Namibia',
	//'Equatorial Guinea',
	'Benin',
	//'Rwanda',
	//'Malawi',
	'Niger',
	'Guinea',
	'Zimbabwe',
	'Mauritania',
	'Togo',
	//'Swaziland',
	'Somalia',
	//'Burundi',
	'Eritrea',
	//'Lesotho',
	'The Gambia',
	'Liberia',
	'Central African Republic',
	'Cape Verde',
	//'Djibouti',
	'Seychelles',
	'Guinea-Bissau',
	'Comoros',
	'United Republic of Tanzania',
	'South Sudan'
];

Game.Earth.importZones = function() {
	var geoJson = JSON.parse( Assets.getText("geo.json") );

	for (var i = 0; i < geoJson.features.length; i++) {
		var feature = geoJson.features[i];
		var name = feature.properties.name;

		if (!feature || availableZones.indexOf(name) < 0) {
			continue;
		}

		if (Game.EarthZones.Collection.findOne({ name: name })) {
			console.log('skip zone: ' + name);
			continue;
		}

		Game.EarthZones.Collection.insert({
			name: feature.properties.name,
			geometry: feature.geometry,
			links: []
		});

		console.log('import zone: ' + name);
	}

	// Auto build connections
	Game.Earth.autoLinkZones();
}

Game.Earth.autoLinkZones = function() {

	var checkPolygonsConnected = function(polygon1, polygon2) {
		for (var i = 0; i < polygon1.length; i++) {
			for (var j = 0; j < polygon2.length; j++) {
				if (Math.abs(polygon1[i][0] - polygon2[j][0]) <= 0.01
				 && Math.abs(polygon1[i][1] - polygon2[j][1]) <= 0.01
				) {
					return true;
				}
			}
		}
		return false;
	}

	var getPolygonCoordinates = function(geometry) {
		var result = [];
		var coords = geometry.coordinates;
		if (geometry.type == 'MultiPolygon') {
			for (var i = 0; i < coords.length; i++) {
				for (var j = 0; j < coords[i].length; j++) {
					for (var k = 0; k < coords[i][j].length; k++) {
						result.push(coords[i][j][k]);
					}
				}
			}
		} else {
			for (var i = 0; i < coords.length; i++) {
				for (var j = 0; j < coords[i].length; j++) {
					result.push(coords[i][j]);
				}
			}
		}
		return result;
	}

	var zones = Game.EarthZones.Collection.find().fetch();

	for (var i = 0; i < zones.length - 1; i++) {
		var firstZone = zones[i];
		for (var j = i + 1; j < zones.length; j++) {
			var secondZone = zones[j];
			var isConnnection = false;

			var coords1 = getPolygonCoordinates( firstZone.geometry );
			var coords2 = getPolygonCoordinates( secondZone.geometry );

			if (checkPolygonsConnected(coords1, coords2)) {
				Game.Earth.linkZones(firstZone.name, secondZone.name);
			}
		}
	}
}

Game.Earth.linkZones = function(firstName, secondName) {
	if (firstName == secondName) {
		throw new Meteor.Error('Имена не должны совпадать');
	}

	// get first zone
	var firstZone = Game.EarthZones.Collection.findOne({
		name: firstName
	});

	if (!firstZone) {
		throw new Meteor.Error('Зона с именем ' + firstName + ' не найдена в БД');
	}

	// get second zone
	var secondZone = Game.EarthZones.Collection.findOne({
		name: secondName
	});

	if (!secondZone) {
		throw new Meteor.Error('Зона с именем ' + secondName + ' не найдена в БД');
	}

	// link each other
	if (firstZone.links.indexOf(secondName) < 0) {
		firstZone.links.push(secondName);
		Game.EarthZones.Collection.update({ name: firstName }, firstZone);
	}

	if (secondZone.links.indexOf(firstName) < 0) {
		secondZone.links.push(firstName);
		Game.EarthZones.Collection.update({ name: secondName }, secondZone);
	}
}

Game.Earth.unlinkZones = function(firstName, secondName) {
	if (firstName == secondName) {
		throw new Meteor.Error('Имена не должны совпадать');
	}

	// get first zone
	var firstZone = Game.EarthZones.Collection.findOne({
		name: firstName
	});

	if (!firstZone) {
		throw new Meteor.Error('Зона с именем ' + firstName + ' не найдена в БД');
	}

	// get second zone
	var secondZone = Game.EarthZones.Collection.findOne({
		name: secondName
	});

	if (!secondZone) {
		throw new Meteor.Error('Зона с именем ' + secondName + ' не найдена в БД');
	}

	// unlink each other
	var n = firstZone.links.indexOf(secondName);
	if (n >= 0) {
		firstZone.links.splice(n, 1);
		Game.EarthZones.Collection.update({ name: firstName }, firstZone);
	}

	var n = secondZone.links.indexOf(firstName);
	if (n >= 0) {
		secondZone.links.splice(n, 1);
		Game.EarthZones.Collection.update({ name: secondName }, secondZone);
	}
}

// ----------------------------------------------------------------------------
// Public methods only for development!
// ----------------------------------------------------------------------------

if (process.env.NODE_ENV == 'development') {
	Meteor.methods({
		'earth.importZones': Game.Earth.importZones,
		'earth.linkZones': Game.Earth.linkZones,
		'earth.unlinkZones': Game.Earth.unlinkZones
	});
}

}