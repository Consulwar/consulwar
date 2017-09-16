import Airfield from '../lib/Airfield';

export default {
  ...Airfield,
  overlay: {
    x: 1218,
    y: 435,
    z: 10,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
};
