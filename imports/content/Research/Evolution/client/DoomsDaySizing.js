import Research from '/imports/modules/Research/client/Research';
import DoomsDaySizing from '../lib/DoomsDaySizing';

export default new Research({
  ...DoomsDaySizing,
  overlay: {
    x: 960,
    y: 671,
    z: 9,
    levels: [1, 20, 40, 60, 80, 100],
  },
});
