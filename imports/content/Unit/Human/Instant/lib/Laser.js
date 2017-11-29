export default {
  id: 'Unit/Human/Instant/Laser',
  title: 'Лазер',
  characteristics: {
    damage: {
      min: 250000,
      max: 250000,
    },
    life: 1,
  },
  targets: [
    'Unit/Reptile/Space/Wyvern',
    'Unit/Reptile/Space/Dragon',
    'Unit/Reptile/Space/Hydra',
  ],
};
