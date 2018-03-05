import Building from '/imports/modules/Building/client/Building';
import Political from '../lib/Political';

export default new Building({
  ...Political,
  overlay: {
    x: 1463,
    y: 56,
    z: 2,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
