export default {
  id: 'Unit/Human/Instant/PurePlasma',
  title: 'Чистая плазма',
  characteristics: {
    damage: {
      min: 4000000,
      max: 4000000,
    },
    life: 1,
  },
  targets: [
    'Unit/Reptile/Space/Prism',
    'Unit/Reptile/Space/Octopus',
    'Unit/Reptile/Space/Godzilla',
  ],
};
