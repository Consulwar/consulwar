import Building from '/imports/modules/Building/client/Building';
import Complex from '../lib/Complex';

export default new Building({
  ...Complex,
  overlay: {
    x: 941,
    y: 254,
    z: 7,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
});
