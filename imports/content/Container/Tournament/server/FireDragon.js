import FireDragon from '../lib/FireDragon';

export default {
  ...FireDragon,
  drop: [
    {
      chance: 10,
      profit: { 'Resource/Artifact/Red/RubyPlasmoid': 1 },
    },
    {
      chance: 90,
      profit: {
        'Resource/Base/Metal': 20000,
        'Resource/Base/Crystal': 20000,
      },
    },
  ],
};
