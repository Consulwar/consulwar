import Building from '/imports/modules/Building/client/Building';
import Airfield from '../lib/Airfield';

export default new Building({
  ...Airfield,
  overlay: {
    x: 1218,
    y: 435,
    z: 10,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
});
