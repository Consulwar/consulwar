import Research from '/imports/modules/Research/client/Research';
import Alloy from '../lib/Alloy';

export default new Research({
  ...Alloy,
  overlay: {
    x: 135,
    y: 134,
    z: 1,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
