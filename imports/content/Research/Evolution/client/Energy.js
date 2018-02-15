import Research from '/imports/modules/Research/client/Research';
import Energy from '../lib/Energy';

export default new Research({
  ...Energy,
  overlay: {
    x: 652,
    y: 63,
    z: 11,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
