import Building from '/imports/modules/Building/client/Building';
import Barracks from '../lib/Barracks';

export default new Building({
  ...Barracks,
  overlay: {
    x: 501,
    y: 650,
    z: 12,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
});
