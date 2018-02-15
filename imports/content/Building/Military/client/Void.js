import Building from '/imports/modules/Building/client/Building';
import Void from '../lib/Void';

export default new Building({
  ...Void,
  overlay: {
    x: 808,
    y: 304,
    z: 2,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
});
