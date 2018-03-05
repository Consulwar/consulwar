import Building from '/imports/modules/Building/client/Building';
import Gates from '../lib/Gates';

export default new Building({
  ...Gates,
  overlay: {
    x: 667,
    y: 231,
    z: 1,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
});
