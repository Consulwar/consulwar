import Research from '/imports/modules/Research/client/Research';
import AnimalWorld from '../lib/AnimalWorld';

export default new Research({
  ...AnimalWorld,
  overlay: {
    x: 972,
    y: 213,
    z: 10,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
