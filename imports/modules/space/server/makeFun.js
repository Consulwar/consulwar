import Game from '/moduls/game/lib/main.game';
import Config from './config';
import Reptiles from './reptiles';

export default function () {
  if (Game.Planets.getLastFunTime() + Config.FUN_PERIOD > Game.getCurrentTime()) {
    return false;
  }

  Game.Planets.setLastFunTime(Game.getCurrentTime());

  const mission = {
    type: 'prepearedfleet',
    level: 508,
  };

  const colonies = Game.Planets.getColonies();
  for (let i = 0; i < colonies.length; i += 1) {
    const planet = colonies[i];
    const fleets = planet.isHome ? 3 : 1;
    for (let j = 0; j < fleets; j += 1) {
      Reptiles.sendReptileFleetToPlanet(planet._id, mission);
    }
  }

  return true;
}
