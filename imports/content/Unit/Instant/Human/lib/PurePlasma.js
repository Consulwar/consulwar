export default {
  id: 'Unit/Instant/Human/PurePlasma',
  title: 'Чистая плазма',
  characteristics: {
    damage: {
      min: 4000000,
      max: 4000000,
    },
    life: 1,
  },
  targets: [
    'Unit/Space/Reptile/Prism',
    'Unit/Space/Reptile/Octopus',
    'Unit/Space/Reptile/Godzilla',
  ],
};
