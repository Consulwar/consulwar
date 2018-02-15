import Research from '/imports/modules/Research/client/Research';
import Crystallization from '../lib/Crystallization';

export default new Research({
  ...Crystallization,
  overlay: {
    x: 1349,
    y: 326,
    z: 5,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
