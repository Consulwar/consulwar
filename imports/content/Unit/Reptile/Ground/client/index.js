import InfantryUnits from '../Infantry/client';
import EngineryUnits from '../Enginery/client';
import AirUnits from '../Air/client';

export default {
  ...InfantryUnits,
  ...EngineryUnits,
  ...AirUnits,
};
