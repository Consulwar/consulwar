import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import Config from './config';
import Reptiles from './reptiles';
import mutualSpaceCollection from '../../MutualSpace/lib/collection';

export default function ({ userId = Meteor.userId(), raid = false } = {}) {
  if (!mutualSpaceCollection.findOne({
    username: Meteor.user().username,
  })) {
    return false;
  }

  if (Game.Planets.getLastFunTime() + Config.FUN_PERIOD > Game.getCurrentTime()) {
    return false;
  }

  Game.Planets.setLastFunTime(Game.getCurrentTime());

  const mission = {
    type: 'prepearedfleet',
    level: 508,
  };

  if (raid) {
    mission.type = 'raidfleet';
    mission.level = 509;
    const base = Game.Planets.getBase();
    Reptiles.sendReptileFleetToPlanet({ planetId: base._id, mission });
    return true;
  }

  const colonies = Game.Planets.getColonies();
  for (let i = 0; i < colonies.length; i += 1) {
    const planet = colonies[i];
    const fleets = planet.isHome ? 3 : 1;
    for (let j = 0; j < fleets; j += 1) {
      if (planet.userId === userId) {
        Reptiles.sendReptileFleetToPlanet({ planetId: planet._id, mission });
      }
    }
  }

  return true;
}
