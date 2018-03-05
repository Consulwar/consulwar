import Research from '/imports/modules/Research/client/Research';
import Ikea from '../lib/Ikea';

export default new Research({
  ...Ikea,
  overlay: {
    x: 33,
    y: 355,
    z: 4,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
