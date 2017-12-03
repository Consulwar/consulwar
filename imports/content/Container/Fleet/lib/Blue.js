export default {
  id: 'Container/Fleet/Blue',
  title: 'Синий контейнер',
  description: '',
  price: {
    credits: 500,
  },
  drop: [
    {
      chance: 4,
      profit: { 'Resource/Artifact/Blue/SapphirePlasmoid': [3, 6] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Blue/QuadCooler': [3, 6] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Blue/PlasmaTransistors': [3, 6] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Blue/NanoWires': [3, 6] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Blue/Chip': [3, 6] },
    },
    {
      chance: 10,
      profit: { 'Unit/Human/Defense/LaserTurret': 175 },
    },
    {
      chance: 6,
      profit: { 'Unit/Human/Ground/Air/Xynlet': [2, 6] },
    },
    {
      chance: 25,
      profit: { 'Unit/Human/Space/Frigate': 20 },
    },
    {
      chance: 35,
      profit: { 'Unit/Human/Space/Cruiser': 5 },
    },
    {
      chance: 4,
      profit: { 'Unit/Human/Space/Battleship': 1 },
    },
  ],
};
