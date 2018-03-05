import Building from '/imports/modules/Building/client/Building';
import SpacePort from '../lib/SpacePort';

export default new Building({
  ...SpacePort,
  overlay: {
    x: 339,
    y: 364,
    z: 5,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
