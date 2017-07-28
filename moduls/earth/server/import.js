initEarthServerImport = function () {
'use strict';

var startZone = 'South Africa';

var startZones = [
  'Argentina',
  'South Africa',
  'Pakistan',
  'New Zealand',
  'Japan',
  'Swedan'
];

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

var autoLinkList = [
  ['Mozambique', 'Madagascar']
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
      name: name,
      geometry: feature.geometry,
      links: [],
      isEnemy: (startZones.indexOf(name) < 0 ? true : false),
      isCurrent: (startZone == name ? true : false ),
      isVisible: (startZone == name ? true : false )
    });

    console.log('import zone: ' + name);
  }

  // Auto build connections
  Game.Earth.autoLinkZones();
};

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
  };

  var getPolygonCoordinates = function(geometry) {
    var result = [];
    var coords = geometry.coordinates;
    
    var i = 0;
    var j = 0;
    var k = 0;

    if (geometry.type == 'MultiPolygon') {
      for (i = 0; i < coords.length; i++) {
        for (j = 0; j < coords[i].length; j++) {
          for (k = 0; k < coords[i][j].length; k++) {
            result.push(coords[i][j][k]);
          }
        }
      }
    } else {
      for (i = 0; i < coords.length; i++) {
        for (j = 0; j < coords[i].length; j++) {
          result.push(coords[i][j]);
        }
      }
    }
    return result;
  };

  // check borders with same points
  var zones = Game.EarthZones.Collection.find().fetch();
  var i = 0;

  for (i = 0; i < zones.length - 1; i++) {
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

  // auto link from config
  for (i = 0; i < autoLinkList.length; i++) {
    Game.Earth.linkZones( autoLinkList[i][0], autoLinkList[i][1] );
  }
};

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
};

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

  n = secondZone.links.indexOf(firstName);
  if (n >= 0) {
    secondZone.links.splice(n, 1);
    Game.EarthZones.Collection.update({ name: secondName }, secondZone);
  }
};

};