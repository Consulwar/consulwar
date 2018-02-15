import Building from '/imports/modules/Building/client/Building';
import PulseCatcher from '../lib/PulseCatcher';

export default new Building({
  ...PulseCatcher,
  overlay: {
    x: 830,
    y: 598,
    z: 10,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
