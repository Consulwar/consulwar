import Building from '/imports/modules/Building/client/Building';
import Statue from '../lib/Statue';

export default new Building({
  ...Statue,
  overlay: {
    x: 1163,
    y: 324,
    z: 7,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
