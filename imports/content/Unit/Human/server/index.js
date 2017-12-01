import GroundUnits from '../Ground/server';
import DefenseUnits from '../Defense/server';
import SpaceUnits from '../Space/server';
import InstantUnits from '../Instant/server';

export default {
  ...GroundUnits,
  ...DefenseUnits,
  ...SpaceUnits,
  ...InstantUnits,
};
