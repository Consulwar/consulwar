import Building from '/imports/modules/Building/client/Building';
import House from '../lib/House';

export default new Building({
  ...House,
  overlay: {
    x: 729,
    y: 227,
    z: 1,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
