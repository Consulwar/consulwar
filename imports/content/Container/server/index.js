import fleetContainers from '../Fleet/server';
import tournamentContainers from '../Tournament/server';

export default {
  ...fleetContainers,
  ...tournamentContainers,
};
