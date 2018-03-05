import Building from '/imports/modules/Building/client/Building';
import Colosseum from '../lib/Colosseum';

export default new Building({
  ...Colosseum,
  overlay: {
    x: 34,
    y: 558,
    z: 8,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
