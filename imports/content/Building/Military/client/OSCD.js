import Building from '/imports/modules/Building/client/Building';
import OSCD from '../lib/OSCD';

export default new Building({
  ...OSCD,
  overlay: {
    x: 1359,
    y: 0,
    z: 4,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
});
