import Research from '/imports/modules/Research/client/Research';
import Converter from '../lib/Converter';

export default new Research({
  ...Converter,
  overlay: {
    x: 39,
    y: 684,
    z: 6,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
