export default {
  id: 'Unit/Human/Instant/Rocket',
  title: 'Ракета',
  characteristics: {
    damage: {
      min: 30000,
      max: 30000,
    },
    life: 1,
  },
  targets: [
    'Unit/Reptile/Space/Lacertian',
    'Unit/Reptile/Space/Wyvern',
    'Unit/Reptile/Space/Trionyx',
  ],
};
