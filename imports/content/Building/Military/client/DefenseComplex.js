import Building from '/imports/modules/Building/client/Building';
import DefenseComplex from '../lib/DefenseComplex';

export default new Building({
  ...DefenseComplex,
  overlay: {
    x: 1137,
    y: 253,
    z: 3,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
});
