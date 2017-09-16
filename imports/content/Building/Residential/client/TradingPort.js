import TradingPort from '../lib/TradingPort';

export default {
  ...TradingPort,
  overlay: {
    x: 0,
    y: 390,
    z: 6,
    levels: [1, 20, 40, 60, 80, 100],
  },
};
