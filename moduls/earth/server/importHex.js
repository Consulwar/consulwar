const turf = require('@turf/turf');
const MapboxClient = require('mapbox');

initEarthServerImportHex = function () {
'use strict';

const {hexSize, hexUnits, minAreaMerge, autoLinkList, startPoints} = Game.Earth.GENERATING;

let startZones = [];
let startZone;

Game.Earth.generateZones = function() {
	console.log('Generating zones');

	let mapBox = new MapboxClient(Meteor.settings.public.mapbox.accessToken);

	const geoJson = JSON.parse(Assets.getText('earth-union.json'));

	let bbox = [-170, -90, 10, 90];
	let hexgrid = turf.hexGrid(bbox, hexSize, hexUnits);

	let bbox2 = [10, -90, 190, 90];
	let hexgrid2 = turf.hexGrid(bbox2, hexSize, hexUnits);

	let combined = combineBBoxes(hexgrid.features, hexgrid2.features);

	let hexes = [];

	let combineCount = combined.length;

	for (let feature of combined) {
		feature = turf.transformScale(feature, 1.0001);

		try {
			let intersected = turf.intersect(feature, geoJson);

			const baseArea = turf.area(feature);

			if (intersected.geometry.type === 'Polygon') {
				let area = turf.area(intersected) / baseArea;
				hexes.push({feature: intersected, area});

			} else {
				for (let coordinates of intersected.geometry.coordinates) {
					let polygon = turf.polygon(coordinates);
					let area = turf.area(polygon) / baseArea;
					hexes.push({feature: polygon, area});
				}
			}

		} catch (e) {
		}

		combineCount--;
		console.log('Combine left:', combineCount);
	}

	let forMergeCount = 0;

	for (let i = 0; i < hexes.length; i++) {
		let found = false;

		let hex1 = hexes[i];
		for (let j = i+1; j < hexes.length; j++) {
			let hex2 = hexes[j];
			if (hexesIntersected(hex1, hex2)) {
				found = true;
				break;
			}
		}

		hex1.intersected = found;

		if (found && hex1.area < minAreaMerge) {
			forMergeCount++;
		}

		console.log('Check intersection, left:', hexes.length - i);
	}

	do {
		for (let hex of hexes) {
			if (needForMerge(hex)) {
				forMergeCount = merge(hexes, hex, forMergeCount);

				break;
			}
		}

	} while (!allFull(hexes));

	generateNames(mapBox, hexes, function () {
		for (let point of startPoints) {
			for (let hex of hexes) {
				let feature = hex.feature;
				if (turf.inside(turf.point(point), feature)) {
					startZones.push(feature.properties.name);
				}
			}
		}

		console.log('startZones', startZones);

		startZone = startZones[0];

		for (let hex of hexes) {
			let name = hex.feature.properties.name;

			Game.EarthZones.Collection.insert({
				name: name,
				geometry: hex.feature.geometry,
				links: [],
				isEnemy: (startZones.indexOf(name) < 0),
				isCurrent: (startZone === name ),
				isVisible: (startZone === name )
			});
		}

		for (let i = 0; i < hexes.length; i++) {
			let hex1 = hexes[i];

			for (let j = i+1; j < hexes.length; j++) {
				let hex2 = hexes[j];

				if (hexesIntersected(hex1, hex2)) {
					Game.Earth.linkZones(hex1.feature.properties.name, hex2.feature.properties.name);
				}
			}
		}

		for (let link of autoLinkList) {
			let first, second;

			for (let hex of hexes) {
				let feature = hex.feature;
				if (turf.inside(turf.point(link[0]), feature)) {
					first = feature;
				} else if (turf.inside(turf.point(link[1]), feature)) {
					second = feature;
				}
			}

			Game.Earth.linkZones(first.properties.name, second.properties.name);
		}

		console.log('Generating zones are finished');
	});
};

Game.Earth.linkZones = function(firstName, secondName) {
	if (firstName === secondName) {
		throw new Meteor.Error('Имена не должны совпадать');
	}

	// get first zone
	let firstZone = Game.EarthZones.Collection.findOne({
		name: firstName
	});

	if (!firstZone) {
		throw new Meteor.Error('Зона с именем ' + firstName + ' не найдена в БД');
	}

	// get second zone
	let secondZone = Game.EarthZones.Collection.findOne({
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
};

let combineBBoxes = function(features1, features2) {
	let result = features1;

	for (let feature2 of features2) {
		let found = false;

		for (let feature of features1) {
			if (hexesEqual(feature, feature2)) {
				found = true;
				break;
			}
		}

		if (!found) {
			result.push(feature2);
		}
	}

	return result;
};

let hexesEqual = function(feature1, feature2) {
	let countEqual = 0;

	for (let coord1 of turf.coordAll(feature1)) {
		let found = false;

		for (let coord2 of turf.coordAll(feature2)) {
			if (coordEqual(coord1, coord2)) {
				found = true;
				break;
			}
		}

		if (found) {
			countEqual++;
		}
	}

	return countEqual === 7;
};

let coordEqual = function(coord1, coord2) {
	const EPSILON = 0.0001;

	return Math.abs(coord1[0] - coord2[0]) <= EPSILON && Math.abs(coord1[1] - coord2[1]) <= EPSILON;
};

let needForMerge = function(hex) {
	return (hex.intersected && hex.area < minAreaMerge);
};

let hasJoins = function(hexes, hex1) {
	for (let hex2 of hexes) {
		if (hex2 !== hex1 && hexesIntersected(hex1, hex2)) {
			return true;
		}
	}

	return false;
};

let allFull = function(hexes) {
	for (let hex of hexes) {
		if (needForMerge(hex)) {
			return false;
		}
	}

	return true;
};

let merge = function(hexes, hex, forMergeCount) {
	let intersected = null;

	for (let hex2 of hexes) {
		if (hex2 !== hex) {
			if (hexesIntersected(hex, hex2)) {
				if (!intersected) {
					intersected = hex2;
				} else {
					if (hex2.area < intersected.area) {
						intersected = hex2;
					}
				}
			}
		}
	}

	hexes.splice(hexes.indexOf(hex), 1);
	hexes.splice(hexes.indexOf(intersected), 1);
	let feature = turf.union(hex.feature, intersected.feature);
	let area = hex.area + intersected.area;

	let newHex = {feature, area};
	newHex.intersected = hasJoins(hexes, newHex);
	hexes.push( newHex );

	forMergeCount -= 1;
	if (needForMerge(intersected)) {
		forMergeCount -= 1;
	}
	if (needForMerge(newHex)) {
		forMergeCount += 1;
	}

	console.log('Merging left:', forMergeCount);

	return forMergeCount;
};

let hexesIntersected = function(hex1, hex2) {
	try {
		return turf.union(hex1.feature, hex2.feature).geometry.type === 'Polygon';
	} catch (e) {
		return false;
	}
};

let generateNames = function (mapBox, hexes, callback) {
	let allCount = hexes.length;

	for (let {feature} of hexes) {
		let centroid = turf.centroid(feature);

		createRequest(feature, centroid.geometry.coordinates);
	}

	function createRequest(feature, [longitude, latitude]) {
		mapBox.geocodeReverse({latitude, longitude}, {types: 'place,region,country'}, function (err, res) {
			if (res.features.length !== 0) {
				feature.properties.name = res.features[0].text;
			}

			if (--allCount <= 0) {
				callback();
			}
		});
	}
};

};