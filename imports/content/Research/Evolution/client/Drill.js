import Research from '/imports/modules/Research/client/Research';
import Drill from '../lib/Drill';

export default new Research({
  ...Drill,
  overlay: {
    x: 639,
    y: 357,
    z: 12,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
