export default {
  id: 'Container/Fleet/Green',
  title: 'Зелёный контейнер',
  description: '',
  price: {
    credits: 250,
  },
  drop: [
    {
      chance: 4,
      profit: { 'Resource/Artifact/Green/EmeraldPlasmoid': [4, 8] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Green/Batteries': [4, 8] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Green/RotaryAmplifier': [4, 8] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Green/SecretTechnology': [4, 8] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Green/ReptileTechnology': [4, 8] },
    },
    {
      chance: 5,
      profit: { 'Unit/Human/Defense/IonMine': 700 },
    },
    {
      chance: 5,
      profit: { 'Unit/Human/Ground/Infantry/Horizontalbarman': 300 },
    },
    {
      chance: 20,
      profit: { 'Unit/Human/Space/Mirage': 300 },
    },
    {
      chance: 40,
      profit: { 'Unit/Human/Space/Frigate': 12 },
    },
    {
      chance: 10,
      profit: { 'Unit/Human/Space/Cruiser': 2 },
    },
  ],
};
