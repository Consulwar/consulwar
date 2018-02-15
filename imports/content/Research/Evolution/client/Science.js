import Research from '/imports/modules/Research/client/Research';
import Science from '../lib/Science';

export default new Research({
  ...Science,
  overlay: {
    x: 1392,
    y: 105,
    z: 2,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
