import GreenRing from '../lib/GreenRing';

export default {
  ...GreenRing,
  drop: [
    {
      chance: 18,
      profit: { 'Resource/Artifact/White/WeaponParts': [1, 10] },
    },
    {
      chance: 18,
      profit: { 'Resource/Artifact/White/SilverPlasmoid': [1, 10] },
    },
    {
      chance: 18,
      profit: { 'Resource/Artifact/White/ShipDetails': [1, 10] },
    },
    {
      chance: 18,
      profit: { 'Resource/Artifact/White/MeteorFragments': [1, 10] },
    },
    {
      chance: 18,
      profit: { 'Resource/Artifact/White/CrystalFragments': [1, 10] },
    },
    {
      chance: 10,
      profit: {
        'Resource/Base/Metal': 250,
        'Resource/Base/Crystal': 250,
      },
    },
  ],
};
