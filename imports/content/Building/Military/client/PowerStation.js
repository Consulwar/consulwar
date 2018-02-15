import Building from '/imports/modules/Building/client/Building';
import PowerStation from '../lib/PowerStation';

export default new Building({
  ...PowerStation,
  overlay: {
    x: 78,
    y: 291,
    z: 9,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
});
