import Shipyard from '../lib/Shipyard';

export default {
  ...Shipyard,
  overlay: {
    x: 85,
    y: 165,
    z: 5,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
};
