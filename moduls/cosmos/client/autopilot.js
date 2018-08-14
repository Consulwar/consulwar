import { _ } from 'lodash';
import Space from '/imports/modules/Space/lib/space';
import FlightEvents from '/imports/modules/Space/lib/flightEvents';

const types = {
  'Пт': 'patrolfleet',
  'РО': 'defencefleet',
  'БФ': 'battlefleet',
};

const hasUnits = function(available, required) {
  return (
    _.toPairs(required)
      .filter(([id, count]) => count > 0)
      .every(
        ([id, count]) => available[id] >= count
      )
  );
};

const getNotBusyMissions = function(type, level) {
  return (
    Game.Planets.Collection
    .find({
      username: Meteor.user().username,
      "mission.type": type,
      "mission.level": level,
    })
    .fetch()
    .filter(planet => !Space.collection.findOne({ 'data.targetId': planet._id }))
  );
}

const autopilot = function(planetId) {
  const planet = Game.Planets.Collection.findOne({
    _id: planetId,
    armyUsername: Meteor.user().username,
  });

  if (!planet) {
    return false;
  }
  
  const availableUnits = Game.Planets.getFleetUnits(planetId);

  const squads = (
    Game.Squad.getAll().fetch()
    .filter((squad) => {
      if (squad.name.length !== 4) {
        return false;
      }

      const [type, level] = squad.name.split(' ');
      if (type && types[type] && Game.Battle.items[types[type]].level[level]) {
        return true;
      }
      return false;
    })
  );

  return squads.some((squad) => {
    let [type, level] = squad.name.split(' ');
    level = parseInt(level, 10);

    if (
      hasUnits(availableUnits, squad.units)
      && Space.checkSendFleet({
        planet,
        units: squad.units,
      })
    ) {
      const availableMissions = getNotBusyMissions(types[type], level);
      if (availableMissions.length > 0) {
        const mission = availableMissions[0];

        Meteor.call(
          'space.sendFleet',
          planet._id,
          FlightEvents.TARGET.PLANET,
          mission._id,
          _.pickBy(squad.units, count => count > 0),
          false,
          function(err) {
            if (err) {
              Notifications.error('Не удалось отправить флот', err.error);
            } else {
              Notifications.success('Флот отправлен');
            }
          }
        );

        return true;
      }
    }
    return false;
  });
}

const autopilotPlanets = [];
Meteor.setInterval(() => {
  if (autopilotPlanets.length === 0) {
    return false;
  }

  autopilotPlanets.some(planetId => autopilot(planetId));
}, 2000);

const add = function(planetId) {
  if (autopilotPlanets.indexOf(planetId) === -1) {
    autopilotPlanets.push(planetId);
  }
}

const remove = function(planetId) {
  if (autopilotPlanets.indexOf(planetId) !== -1) {
    autopilotPlanets.splice(autopilotPlanets.indexOf(planetId), 1);
  }
}

const removeAll = function() {
  autopilotPlanets.splice(0, autopilotPlanets.length);
}

const has = function(planetId) {
  return autopilotPlanets.indexOf(planetId) !== -1;
}

export default {
  has,
  add,
  remove,
  removeAll,
};
