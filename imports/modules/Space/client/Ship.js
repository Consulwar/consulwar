import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import { L } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import systemUsername from '/moduls/user/lib/systemUsername';
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
  // eslint-disable-next-line meteor/no-session
  const currentTime = Session.get('serverTime');

  if (!path) {
    return {
      x: 0,
      y: 0,
      angle: 0,
    };
  }

  const timeFlying = Game.dateToTime(fleet.spaceEvent.after) - fleet.spaceEvent.data.flyTime;
  const currentDistance = calcDistanceByTime(
    currentTime - timeFlying,
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

  const coords = mapView.latLngToLayerPoint(new L.LatLng(curPoint.x, curPoint.y));

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
        if (planet.mission.type === 'krampus') {
          this.color = Config.colors.artefact;
        } else {
          this.color = Config.colors.enemy;
        }
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
      let fromOffset = origin;
      if (fleet.data.hex) {
        fromOffset = new Hex(fleet.data.hex).center();
      }
      let toOffset = origin;
      if (fleet.data.targetHex) {
        toOffset = new Hex(fleet.data.targetHex).center();
      } else if (fleet.data.hex) {
        toOffset = fromOffset;
      }

      fleet.data.startPosition = {
        x: fleet.data.startPosition.x + fromOffset.x,
        y: fleet.data.startPosition.y + fromOffset.y,
      };

      fleet.data.targetPosition = {
        x: fleet.data.targetPosition.x + toOffset.x,
        y: fleet.data.targetPosition.y + toOffset.y,
      };

      this.fleet = fleet;

      this.path = path;
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
      if (fleet.data.mission && fleet.data.mission.type === 'prisoners') {
        this.size = 8;
      }
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

    const maxSpeed = calcMaxSpeed(this.fleet.data.engineLevel);
    const acceleration = calcAcceleration(this.fleet.data.engineLevel);

    const totalFlyDistance = calcDistance(
      this.fleet.data.startPosition,
      this.fleet.data.targetPosition,
    );

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
      if (fleetData.mission.type === 'prisoners') {
        return Config.colors.artefact;
      }
      return Config.colors.enemy;
    }

    if (fleetData.username === user.username) {
      return Config.colors.user;
    } else if (myAllies.indexOf(fleetData.username) !== -1) {
      return Config.colors.ally;
    } else if (fleetData.username === systemUsername) {
      return Config.colors.council;
    }

    return Config.colors.other;
  }
}

export default Ship;
