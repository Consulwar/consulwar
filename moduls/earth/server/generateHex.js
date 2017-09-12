import { Meteor } from 'meteor/meteor';

const turf = require('@turf/turf');
const MapboxClient = require('mapbox');

initEarthServerImportHex = function () {
  const { hexSize, hexUnits, minAreaMerge, autoLinkList, startPoints } = Game.Earth.GENERATING;

  const mapBox = new MapboxClient(Meteor.settings.public.mapbox.accessToken);

  const coordEqual = function (coord1, coord2) {
    const EPSILON = 0.0001;

    return Math.abs(coord1[0] - coord2[0]) <= EPSILON && Math.abs(coord1[1] - coord2[1]) <= EPSILON;
  };

  const hexesEqual = function (feature1, feature2) {
    let countEqual = 0;

    for (const coord1 of turf.coordAll(feature1)) {
      let found = false;

      for (const coord2 of turf.coordAll(feature2)) {
        if (coordEqual(coord1, coord2)) {
          found = true;
          break;
        }
      }

      if (found) {
        countEqual += 1;
      }
    }

    return countEqual === 7;
  };

  const combineBBoxes = function (initialFeatures, featuresToMerge) {
    featuresToMerge.forEach((second) => {
      if (!initialFeatures.some(first => hexesEqual(first, second))) {
        initialFeatures.push(second);
      }
    });

    return initialFeatures;
  };

  const hexesIntersected = function (hex1, hex2) {
    try {
      return turf.union(hex1.feature, hex2.feature).geometry.type === 'Polygon';
    } catch (e) {
      return false;
    }
  };

  const needForMerge = function (hex) {
    return (hex.intersected && hex.area < minAreaMerge);
  };

  const hasJoins = function (hexes, hex1) {
    for (const hex2 of hexes) {
      if (hex2 !== hex1 && hexesIntersected(hex1, hex2)) {
        return true;
      }
    }

    return false;
  };

  const allFull = function (hexes) {
    for (const hex of hexes) {
      if (needForMerge(hex)) {
        return false;
      }
    }

    return true;
  };

  const merge = function (hexes, hex, forMergeCount) {
    let intersected = null;
    let intersectArea = null;
    let resultMergeCount = forMergeCount;

    for (const hex2 of hexes) {
      if (hex2 !== hex) {
        if (hexesIntersected(hex, hex2)) {
          if (!intersected) {
            intersected = hex2;
            intersectArea = turf.area(turf.intersect(hex.feature, hex2.feature));
          } else {
            const checkIntersectArea = turf.area(turf.intersect(hex.feature, hex2.feature));
            if (checkIntersectArea > intersectArea) {
              intersected = hex2;
              intersectArea = checkIntersectArea;
            }
          }
        }
      }
    }

    hexes.splice(hexes.indexOf(hex), 1);
    hexes.splice(hexes.indexOf(intersected), 1);
    const feature = turf.union(hex.feature, intersected.feature);
    const area = hex.area + intersected.area;

    const newHex = { feature, area };
    newHex.intersected = hasJoins(hexes, newHex);
    hexes.push(newHex);

    resultMergeCount -= 1;
    if (needForMerge(intersected)) {
      resultMergeCount -= 1;
    }
    if (needForMerge(newHex)) {
      resultMergeCount += 1;
    }

    console.log('Merging left:', resultMergeCount);

    return resultMergeCount;
  };

  const generateName = function () {
    const letters = [
      'A', 'B', 'C', 'D', 'E', 'F',
      'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R',
      'S', 'T', 'U', 'V', 'W', 'X',
      'Y', 'Z', '0', '1', '2', '3',
      '4', '5', '6', '7', '8', '9',
    ];

    return `${letters[Game.Random.interval(0, 35)]
    + letters[Game.Random.interval(0, 35)]
    + letters[Game.Random.interval(0, 35)]
      }-${
      letters[Game.Random.interval(0, 35)]
      }${letters[Game.Random.interval(0, 35)]
      }${letters[Game.Random.interval(0, 35)]}`;
  };

  const geocodeReverse = Meteor.wrapAsync(mapBox.geocodeReverse, mapBox);
  const createRequest = function createRequest(
    feature,
    [longitude, latitude],
    allNames,
  ) {
    const res = geocodeReverse(
      { latitude, longitude },
      { types: 'district,region,country' },
    );

    let name;

    if (res.features.length !== 0) {
      name = res.features[0].text;

      if (!name) {
        name = generateName();
      }

      if (name in allNames) {
        allNames[name] += 1;
        name += `-${allNames[name]}`;
      } else {
        allNames[name] = 1;
      }
    } else {
      name = generateName();
    }

    feature.properties.name = name;
  };

  const generateNames = function (hexes) {
    const allNames = {};

    hexes.forEach(({ feature }) => {
      const centroid = turf.centroid(feature);
      createRequest(feature, centroid.geometry.coordinates, allNames);
    });
  };


  const startZones = [];

  Game.Earth.generateZones = function () {
    console.log('Generating zones');

    const geoJson = JSON.parse(Assets.getText('earth-union.json'));

    const bbox = [-170, -90, 10, 90];
    const hexgrid = turf.hexGrid(bbox, hexSize, hexUnits);

    const bbox2 = [10, -90, 190, 90];
    const hexgrid2 = turf.hexGrid(bbox2, hexSize, hexUnits);

    const combined = combineBBoxes(hexgrid.features, hexgrid2.features);

    const hexes = [];

    let combineCount = combined.length;

    for (let feature of combined) {
      feature = turf.transformScale(feature, 1.0001);

      try {
        const intersected = turf.intersect(feature, geoJson);

        if (intersected) {
          const baseArea = turf.area(feature);

          if (intersected.geometry.type === 'Polygon') {
            const area = turf.area(intersected) / baseArea;
            hexes.push({ feature: intersected, area });
          } else {
            for (const coordinates of intersected.geometry.coordinates) {
              const polygon = turf.polygon(coordinates);
              const area = turf.area(polygon) / baseArea;
              hexes.push({ feature: polygon, area });
            }
          }
        }
      } catch (e) {
        // do nothing
      }

      combineCount -= 1;
      console.log('Combine left:', combineCount);
    }

    let forMergeCount = 0;

    for (let i = 0; i < hexes.length; i += 1) {
      const hex1 = hexes[i];

      let found = false;
      for (const hex2 of hexes) {
        if (hex1 !== hex2 && hexesIntersected(hex1, hex2)) {
          found = true;
          break;
        }
      }

      hex1.intersected = found;

      if (found && hex1.area < minAreaMerge) {
        forMergeCount += 1;
      }

      console.log('Check intersection, left:', hexes.length - i);
    }

    do {
      for (const hex of hexes) {
        if (needForMerge(hex)) {
          forMergeCount = merge(hexes, hex, forMergeCount);

          break;
        }
      }
    } while (!allFull(hexes));

    generateNames(hexes);

    for (const point of startPoints) {
      for (const hex of hexes) {
        const feature = hex.feature;
        if (turf.inside(turf.point(point), feature)) {
          startZones.push(feature.properties.name);
        }
      }
    }

    console.log('startZones', startZones);

    for (const hex of hexes) {
      const name = hex.feature.properties.name;

      Game.EarthZones.Collection.insert({
        name,
        geometry: hex.feature.geometry,
        links: [],
        isEnemy: (startZones.indexOf(name) < 0),
        isStarting: (startZones.indexOf(name) !== -1),
        isVisible: (startZones.indexOf(name) !== -1),
      });
    }

    const unmergedHexes = [...hexes];
    while (unmergedHexes.length > 0) {
      const hexForMerge = unmergedHexes.shift();
      unmergedHexes.forEach((targetHex) => {
        if (hexesIntersected(hexForMerge, targetHex)) {
          Game.Earth.linkZones(
            hexForMerge.feature.properties.name,
            targetHex.feature.properties.name,
          );
        }
      });
    }

    for (const link of autoLinkList) {
      let first,
        second;

      for (const hex of hexes) {
        const feature = hex.feature;
        if (turf.inside(turf.point(link[0]), feature)) {
          first = feature;
        } else if (turf.inside(turf.point(link[1]), feature)) {
          second = feature;
        }
      }

      if (first && second) {
        Game.Earth.linkZones(first.properties.name, second.properties.name);
      }
    }

    console.log('Generating zones are finished');
  };

  Game.Earth.linkZones = function (firstName, secondName) {
    if (firstName === secondName) {
      throw new Meteor.Error('Имена не должны совпадать');
    }

    // get first zone
    const firstZone = Game.EarthZones.Collection.findOne({
      name: firstName,
    });

    if (!firstZone) {
      throw new Meteor.Error(`Зона с именем ${firstName} не найдена в БД`);
    }

    // get second zone
    const secondZone = Game.EarthZones.Collection.findOne({
      name: secondName,
    });

    if (!secondZone) {
      throw new Meteor.Error(`Зона с именем ${secondName} не найдена в БД`);
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

  Game.Earth.unlinkZones = function(firstName, secondName) {
    if (firstName === secondName) {
      throw new Meteor.Error('Имена не должны совпадать');
    }

    // get first zone
    let firstZone = Game.EarthZones.Collection.findOne({
      name: firstName,
    });

    if (!firstZone) {
      throw new Meteor.Error('Зона с именем ' + firstName + ' не найдена в БД');
    }

    // get second zone
    let secondZone = Game.EarthZones.Collection.findOne({
      name: secondName,
    });

    if (!secondZone) {
      throw new Meteor.Error('Зона с именем ' + secondName + ' не найдена в БД');
    }

    // unlink each other
    let n = firstZone.links.indexOf(secondName);
    if (n >= 0) {
      firstZone.links.splice(n, 1);
      Game.EarthZones.Collection.update({ name: firstName }, firstZone);
    }

    n = secondZone.links.indexOf(firstName);
    if (n >= 0) {
      secondZone.links.splice(n, 1);
      Game.EarthZones.Collection.update({ name: secondName }, secondZone);
    }
  };
};
