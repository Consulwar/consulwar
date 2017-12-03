export default {
  id: 'Container/Fleet/White',
  title: 'Белый контейнер',
  description: '',
  price: {
    honor: 100,
  },
  drop: [
    {
      chance: 4,
      profit: { 'Resource/Artifact/White/SilverPlasmoid': 1 },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/White/ShipDetails': 1 },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/White/MeteorFragments': 1 },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/White/WeaponParts': 1 },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/White/CrystalFragments': 1 },
    },
    {
      chance: 20,
      profit: { 'Resource/Base/Metal': 100 },
    },
    {
      chance: 20,
      profit: { 'Resource/Base/Crystal': 100 },
    },
    {
      chance: 20,
      profit: { 'Resource/Base/Human': 100 },
    },
    {
      chance: 20,
      profit: { 'Resource/Base/Honor': 100 },
    },
  ],
};
