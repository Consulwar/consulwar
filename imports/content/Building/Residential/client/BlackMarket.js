import Building from '/imports/modules/Building/client/Building';
import BlackMarket from '../lib/BlackMarket';

export default new Building({
  ...BlackMarket,
  overlay: {
    x: 1187,
    y: 552,
    z: 3,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
