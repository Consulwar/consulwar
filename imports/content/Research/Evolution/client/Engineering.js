import Research from '/imports/modules/Research/client/Research';
import Engineering from '../lib/Engineering';

export default new Research({
  ...Engineering,
  overlay: {
    x: 527,
    y: 214,
    z: 7,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
