import ResidentialBuildings from '../Residential/server';
import MilitaryBuildings from '../Military/server';

export default {
  ...ResidentialBuildings,
  ...MilitaryBuildings,
};
