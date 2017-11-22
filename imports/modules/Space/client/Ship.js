import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import Utils from '/imports/modules/Space/lib/utils';

import Space from './space';

const {
  calcDistanceByTime,
  calcFlyTime,
  calcTotalTimeByDistance,
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

const createTriangle_ = function(x, y, offset, size) {
  return [
    [(x + offset[0]) - size, y + offset[1]],
    [x + offset[0], y + offset[1] + (size / 2)],
    [(x + offset[0]) - size, y + offset[1] + size],
  ];
};

const createTriangle = function(x, y, offset, size) {
  return [
    [(x + offset[0]) + size, (y + offset[1])],
    [(x + offset[0]) - size, (y + offset[1]) + size],
    [(x + offset[0]) - (size / 2), (y + offset[1])],
    [(x + offset[0]) - size, (y + offset[1]) - size],
  ];
};

const dateToTime = function (date) {
  return Math.floor(new Date(date).getTime() / 1000);
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
    currentTime - dateToTime(fleet.spaceEvent.created),
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
  };
};

class Ship {
  constructor({
    eventId,
    fleet,
    path,
    isStatic = false,
    planet,
    planetRadius,
    mapView,
    shipsLayer,
  }) {
    this.mapView = mapView;
    this.shipsLayer = shipsLayer;

    if (isStatic) {
      this.size = 0.2;
      this.position = {
        x: planet.x + (planetRadius * 0.2),
        y: planet.y - (planetRadius * 0.2),
      };
      const offset = [-(planetRadius * 0.7), (planetRadius * 0.5)];
      const latlngs = createTriangle(planet.x, planet.y, offset, this.size);

      this.color = (planet.mission ? 'red' : 'green');

      this.polygon = L.polygon(latlngs, { color: this.color, fillOpacity: 1 });

      this.watchPlanet(planet._id, planet.mission ? 'mission' : 'armyId');
    } else {
      this.path = path;
      this.fleet = fleet;
      const pos = getFleetAnimation({
        spaceEvent: fleet,
        maxSpeed: calcMaxSpeed(fleet.data.engineLevel),
        acceleration: calcAcceleration(fleet.data.engineLevel),
        totalFlyDistance: Game.Planets.calcDistance(
          fleet.data.startPosition,
          fleet.data.targetPosition,
        ),
      }, mapView, path);

      this.size = 0.4;
      const offset = [0, 0];
      const latlngs = createTriangle(pos.lat, pos.lng, offset, this.size);

      this.color = (fleet.data.mission ? 'red' : 'green');

      this.polygon = L.polygon(latlngs, { color: this.color, fillOpacity: 1 });

      this.watchEvent(eventId);
      this.startAutorun();
    }

    this.addToMap();
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

    this.autorun = Tracker.autorun(() => {
      const pos = getFleetAnimation({
        spaceEvent: this.fleet,
        maxSpeed: calcMaxSpeed(this.fleet.data.engineLevel),
        acceleration: calcAcceleration(this.fleet.data.engineLevel),
        totalFlyDistance: Game.Planets.calcDistance(
          this.fleet.data.startPosition,
          this.fleet.data.targetPosition,
        ),
      }, this.mapView, this.path);

      const offset = [0, 0];
      const latlngs = createTriangle(pos.lat, pos.lng, offset, this.size);

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
}

export default Ship;
