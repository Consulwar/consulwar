import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import Utils from '/imports/modules/Space/lib/utils';

import Space from './space';
import Config from './config';
import Hex from '../../MutualSpace/lib/Hex';

const {
  calcDistance,
  calcDistanceByTime,
  calcMaxSpeed,
  calcAcceleration,
} = Utils;

const yx = L.latLng;

const xy = function(x, y) {
  if (_(x).isArray()) {    // When doing xy([x, y]);
    return yx(x[1], x[0]);
  }
  return yx(y, x);  // When doing xy(x, y);
};

const createTriangle = function(x, y, offset, size, angle = 0) {
  const basePoints = [
    [size, 0],
    [-size, +size],
    [-(size / 2), 0],
    [-size, -size],
  ];

  // rotate by angle
  return basePoints.map(([px, py]) => [
    ((px * Math.cos(angle)) - (py * Math.sin(angle))) + offset[0] + x,
    ((px * Math.sin(angle)) + (py * Math.cos(angle))) + offset[1] + y,
  ]);
};

const getFleetAnimation = function(fleet, mapView, path) {
  const currentTime = Session.get('serverTime');

  if (!path) {
    return {
      x: 0,
      y: 0,
      angle: 0,
    };
  }

  const currentDistance = calcDistanceByTime(
    currentTime - Game.dateToTime(fleet.spaceEvent.created),
    fleet.totalFlyDistance,
    fleet.maxSpeed,
    fleet.acceleration,
  );

  const k = currentDistance / fleet.totalFlyDistance;
  const curPoint = path.getPointAlongDistanceByCoef(k);

  let nextPoint = fleet.spaceEvent.data.targetPosition;
  if (k < 0.99) {
    nextPoint = path.getPointAlongDistanceByCoef(k + 0.01);
  }
  const angleRad = Math.atan2(nextPoint.y - curPoint.y, nextPoint.x - curPoint.x);

  let angleDeg = Math.floor((angleRad * 180) / Math.PI);
  if (fleet.spaceEvent.data.isHumans) {
    angleDeg += 180;
  }

  const coords = mapView.latLngToLayerPoint(new L.latLng(curPoint.x, curPoint.y));

  return {
    lat: curPoint.x,
    lng: curPoint.y,
    x: coords.x,
    y: coords.y,
    angle: angleDeg,
    angleRad,
  };
};

class Ship {
  constructor({
    eventId,
    fleet,
    path,
    isStatic = false,
    planet,
    planetId,
    planetRadius,
    mapView,
    shipsLayer,
    isPopupLocked,
    origin = { x: 0, y: 0 },
    user,
    myAllies,
  }) {
    this.mapView = mapView;
    this.shipsLayer = shipsLayer;
    this.origin = origin;
    this.user = user;
    this.myAllies = myAllies;

    if (isStatic) {
      this.size = 0.2;
      this.position = {
        x: planet.x + (planetRadius * 0.2),
        y: planet.y - (planetRadius * 0.2),
      };
      const offset = [origin.x + -(planetRadius * 0.7), origin.y + (planetRadius * 0.5)];
      const latlngs = createTriangle(
        planet.x,
        planet.y,
        offset,
        this.size,
      );

      if (planet.mission) {
        this.color = Config.colors.enemy;
      } else if (planet.armyUsername === user.username) {
        this.color = Config.colors.user;
      } else if (this.myAllies.indexOf(planet.armyUsername) !== -1) {
        this.color = Config.colors.ally;
      } else {
        this.color = Config.colors.other;
      }

      this.polygon = L.polygon(latlngs, { color: this.color, fillOpacity: 0.8 });

      this.polygon.on('mouseover', function() {
        if (!isPopupLocked.get()) {
          Game.Cosmos.showPlanetPopup(planetId, false, origin);
        }
      });

      this.polygon.on('mouseout', function() {
        if (!isPopupLocked.get()) {
          Game.Cosmos.hidePlanetPopup();
        }
      });

      this.polygon.on('click', function(event) {
        Game.Cosmos.showPlanetInfo(planetId, origin);
        L.DomEvent.stopPropagation(event);
      });

      this.watchPlanet(planetId, planet.mission ? 'mission' : 'armyId');
    } else {
      this.path = path;
      this.fleet = fleet;
      const pos = getFleetAnimation({
        spaceEvent: fleet,
        maxSpeed: calcMaxSpeed(fleet.data.engineLevel),
        acceleration: calcAcceleration(fleet.data.engineLevel),
        totalFlyDistance: calcDistance(
          fleet.data.startPosition,
          fleet.data.targetPosition,
        ),
      }, mapView, path);

      this.size = 0.4;
      const offset = [0, 0];
      const latlngs = createTriangle(pos.lat, pos.lng, offset, this.size, pos.angleRad);

      this.color = this.getColor(fleet.data);

      this.polygon = L.polygon(latlngs, { color: this.color, fillOpacity: 0.8 });

      this.polygon.on('mouseover', function() {
        if (!isPopupLocked.get()) {
          Game.Cosmos.showShipInfo.call({ spaceEvent: fleet }, eventId);
        }
      });

      this.polygon.on('mouseout', function() {
        if (!isPopupLocked.get()) {
          Game.Cosmos.hidePlanetPopup();
        }
      });

      this.polygon.on('click', function(event) {
        Game.Cosmos.showShipInfo.call({ spaceEvent: fleet }, eventId, true);
        L.DomEvent.stopPropagation(event);
      });

      this.watchEvent(eventId);
      this.startAutorun();
    }

    this.addToMap();
  }

  getColor(fleetData) {
    return Ship.getColor(fleetData, this.user, this.myAllies);
  }

  watchEvent(eventId) {
    if (this.eventWatcher) {
      this.eventWatcher.stop();
    }

    this.eventWatcher = Space.collection.find({ _id: eventId }).observeChanges({
      removed: () => {
        this.removeFromMap();
        this.eventWatcher.stop();
        this.autorun.stop();
      },
    });
  }

  watchPlanet(planetId, fieldName) {
    if (this.eventWatcher) {
      this.eventWatcher.stop();
    }

    this.eventWatcher = Game.Planets.Collection.find({ _id: planetId }).observeChanges({
      changed: (id, fields) => {
        if (fields[fieldName] !== undefined) {
          this.removeFromMap();
          this.eventWatcher.stop();
        }
      },
    });
  }

  startAutorun() {
    if (this.autorun) {
      this.autorun.stop();
    }

    let fromOffset = this.origin;
    if (this.fleet.data.hex) {
      fromOffset = new Hex(this.fleet.data.hex).center();
    }
    let toOffset = this.origin;
    if (this.fleet.data.targetHex) {
      toOffset = new Hex(this.fleet.data.targetHex).center();
    } else if (this.fleet.data.hex) {
      toOffset = fromOffset;
    }

    const maxSpeed = calcMaxSpeed(this.fleet.data.engineLevel);
    const acceleration = calcAcceleration(this.fleet.data.engineLevel);

    const startPosition = {
      x: this.fleet.data.startPosition.x + fromOffset.x,
      y: this.fleet.data.startPosition.y + fromOffset.y,
    };

    const targetPosition = {
      x: this.fleet.data.targetPosition.x + toOffset.x,
      y: this.fleet.data.targetPosition.y + toOffset.y,
    };

    const totalFlyDistance = calcDistance(startPosition, targetPosition);

    this.autorun = Tracker.autorun(() => {
      const pos = getFleetAnimation({
        spaceEvent: this.fleet,
        maxSpeed,
        acceleration,
        totalFlyDistance,
      }, this.mapView, this.path);

      const offset = [0, 0];
      const latlngs = createTriangle(pos.lat, pos.lng, offset, this.size, pos.angleRad);

      this.polygon.setLatLngs(latlngs);
    });
  }

  addToMap() {
    this.polygon.addTo(this.shipsLayer);
  }

  removeFromMap() {
    this.shipsLayer.removeLayer(this.polygon);
  }

  getPolygon() {
    return this.polygon;
  }

  setPosition(latlngs) {
    this.polygon.setLatLngs(latlngs);
  }

  static getColor(fleetData, user, myAllies) {
    if (fleetData.mission) {
      return Config.colors.enemy;
    }

    if (fleetData.username === user.username) {
      return Config.colors.user;
    } else if (myAllies.indexOf(fleetData.username) !== -1) {
      return Config.colors.ally;
    }

    return Config.colors.other;
  }
}

export default Ship;
