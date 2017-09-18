export default {
  id: 'Unit/Instant/Human/Laser',
  title: 'Лазер',
  characteristics: {
    damage: {
      min: 250000,
      max: 250000,
    },
    life: 1,
  },
  targets: [
    'Unit/Space/Reptile/Wyvern',
    'Unit/Space/Reptile/Dragon',
    'Unit/Space/Reptile/Hydra',
  ],
};
