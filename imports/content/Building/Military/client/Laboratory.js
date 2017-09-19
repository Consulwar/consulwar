import Laboratory from '../lib/Laboratory';

export default {
  ...Laboratory,
  overlay: {
    x: 512,
    y: 339,
    z: 8,
    levels: [1, 20, 40, 60, 80, 100],
    own: 'item',
  },
};
