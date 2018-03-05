import Building from '/imports/modules/Building/client/Building';
import Storage from '../lib/Storage';

export default new Building({
  ...Storage,
  overlay: {
    x: 636,
    y: 80,
    z: 6,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
});
