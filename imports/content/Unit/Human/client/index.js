import GroundUnits from '../Ground/client';
import DefenseUnits from '../Defense/client';
import SpaceUnits from '../Space/client';
import InstantUnits from '../Instant/client';

export default {
  ...GroundUnits,
  ...DefenseUnits,
  ...SpaceUnits,
  ...InstantUnits,
};
