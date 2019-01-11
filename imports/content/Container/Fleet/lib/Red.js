export default {
  id: 'Container/Fleet/Red',
  title: 'Красный контейнер',
  description: '',
  price: {
    //'Resource/Artifact/Red/RubyPlasmoid': 10,
    'ruby_plasmoid': 10, // HACK refactor old resource names
  },
  drop: [
    {
      chance: 10,
      profit: { 'Resource/Artifact/Red/RubyPlasmoid': [2, 6] },
    },
    {
      chance: 4,
      profit: { 'Unit/Human/Defense/TripleCrystalGun': [1, 2] },
    },
    {
      chance: 1,
      profit: { 'Unit/Human/Defense/OrbitalDefenseStation': 1 },
    },
    {
      chance: 5,
      profit: { 'Unit/Human/Ground/Infantry/Lost': [40, 80] },
    },
    {
      chance: 5,
      profit: { 'Unit/Human/Ground/Enginery/HBHR': [20, 40] },
    },
    {
      chance: 5,
      profit: { 'Unit/Human/Ground/Air/Butterfly': [12, 28] },
    },
    {
      chance: 15,
      profit: { 'Unit/Human/Space/Mirage': 20000 },
    },
    {
      chance: 20,
      profit: { 'Unit/Human/Space/Dreadnought': 10 },
    },
    {
      chance: 25,
      profit: { 'Unit/Human/Space/Railgun': 15 },
    },
    {
      chance: 10,
      profit: { 'Unit/Human/Space/Reaper': [2, 8] },
    },
  ],
};
