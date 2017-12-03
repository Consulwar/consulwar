export default {
  id: 'Container/Fleet/Orange',
  title: 'Оранжевый контейнер',
  description: '',
  price: {
    credits: 2500,
  },
  drop: [
    {
      chance: 4,
      profit: { 'Resource/Artifact/Orange/TopazPlasmoid': [1, 2] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Orange/AncientArtifact': [1, 2] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Orange/AncientTechnology': [1, 2] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Orange/AncientKnowledge': [1, 2] },
    },
    {
      chance: 4,
      profit: { 'Resource/Artifact/Orange/AncientScheme': [1, 2] },
    },
    {
      chance: 3,
      profit: { 'Resource/Artifact/Red/RubyPlasmoid': 1 },
    },
    {
      chance: 9,
      profit: { 'Unit/Human/Defense/Tyrant': 1 },
    },
    {
      chance: 4,
      profit: { 'Unit/Human/Ground/Enginery/MotherTank': [10, 20] },
    },
    {
      chance: 14,
      profit: { 'Unit/Human/Space/Carrier': 1 },
    },
    {
      chance: 16,
      profit: { 'Unit/Human/Space/Railgun': 1 },
    },
    {
      chance: 33,
      profit: { 'Unit/Human/Space/Dreadnought': 1 },
    },
    {
      chance: 1,
      profit: { 'Unit/Human/Space/Reaper': 1 },
    },
  ],
};
