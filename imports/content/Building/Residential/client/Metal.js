import Building from '/imports/modules/Building/client/Building';
import Metal from '../lib/Metal';

export default new Building({
  ...Metal,
  overlay: {
    x: 1002,
    y: 698,
    z: 11,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
