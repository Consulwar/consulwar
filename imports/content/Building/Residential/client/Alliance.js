import Building from '/imports/modules/Building/client/Building';
import Alliance from '../lib/Alliance';

export default new Building({
  ...Alliance,
  overlay: {
    x: 219,
    y: 68,
    z: 4,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
