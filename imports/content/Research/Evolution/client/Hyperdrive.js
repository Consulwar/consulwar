import Research from '/imports/modules/Research/client/Research';
import Hyperdrive from '../lib/Hyperdrive';

export default new Research({
  ...Hyperdrive,
  overlay: {
    x: 506,
    y: 344,
    z: 3,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
