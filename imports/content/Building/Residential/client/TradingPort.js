import Building from '/imports/modules/Building/client/Building';
import TradingPort from '../lib/TradingPort';

export default new Building({
  ...TradingPort,
  overlay: {
    x: 0,
    y: 390,
    z: 6,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
