import Factory from '../lib/Factory';

export default {
  ...Factory,
  overlay: {
    x: 0,
    y: 570,
    z: 11,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
};
