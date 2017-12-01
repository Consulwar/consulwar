import InfantryUnits from '../Infantry/server';
import EngineryUnits from '../Enginery/server';
import AirUnits from '../Air/server';

export default {
  ...InfantryUnits,
  ...EngineryUnits,
  ...AirUnits,
};
