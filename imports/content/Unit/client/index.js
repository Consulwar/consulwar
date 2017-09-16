import SpaceUnits from '../Space/client';
import DefenseUnits from '../Defense/client';
import GroundUnits from '../Ground/client';
import InstantUnits from '../Instant/client';

export default {
  ...SpaceUnits,
  ...DefenseUnits,
  ...GroundUnits,
  ...InstantUnits,
};
