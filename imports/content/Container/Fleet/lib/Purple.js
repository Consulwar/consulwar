export default {
  id: 'Container/Fleet/Purple',
  title: 'Фиолетовый контейнер',
  description: '',
  price: {
    credits: 1000,
  },
  drop: [
    {
      chance: 4,
      profit: { 'Resource/Artifact/Purple/AmethystPlasmoid': [2, 4] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Purple/Garyoldmanium': [2, 4] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Purple/Keanureevesium': [2, 4] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Purple/Nicolascagium': [2, 4] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Purple/Jimcarrium': [2, 4] },
    },
    {
      chance: 10,
      profit: { 'Unit/Human/Defense/RailCannon': [6, 12] },
    },
    {
      chance: 4,
      profit: { 'Unit/Human/Ground/Infantry/Psiman': [8, 16] },
    },
    {
      chance: 15,
      profit: { 'Unit/Human/Space/Carrier': 1 },
    },
    {
      chance: 50,
      profit: { 'Unit/Human/Space/Battleship': 1 },
    },
    {
      chance: 1,
      profit: { 'Unit/Human/Space/Dreadnought': 1 },
    },
  ],
};
