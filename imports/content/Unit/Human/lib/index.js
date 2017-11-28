import GroundUnits from '../Ground/lib';
import DefenseUnits from '../Defense/lib';
import SpaceUnits from '../Space/lib';
import InstantUnits from '../Instant/lib';

export default {
  ...GroundUnits,
  ...DefenseUnits,
  ...SpaceUnits,
  ...InstantUnits,
};
