import Building from '/imports/modules/Building/client/Building';
import Entertainment from '../lib/Entertainment';

export default new Building({
  ...Entertainment,
  overlay: {
    x: 464,
    y: 493,
    z: 9,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
