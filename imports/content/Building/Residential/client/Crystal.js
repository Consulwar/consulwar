import Building from '/imports/modules/Building/client/Building';
import Crystal from '../lib/Crystal';

export default new Building({
  ...Crystal,
  overlay: {
    x: 339,
    y: 541,
    z: 12,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
