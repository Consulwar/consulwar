import Research from '/imports/modules/Research/client/Research';
import Nanotechnology from '../lib/Nanotechnology';

export default new Research({
  ...Nanotechnology,
  overlay: {
    x: 1031,
    y: 318,
    z: 8,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
