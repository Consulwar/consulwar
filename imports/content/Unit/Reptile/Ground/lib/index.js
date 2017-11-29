import InfantryUnits from '../Infantry/lib';
import EngineryUnits from '../Enginery/lib';
import AirUnits from '../Air/lib';

export default {
  ...InfantryUnits,
  ...EngineryUnits,
  ...AirUnits,
};
