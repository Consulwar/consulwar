export default {
  id: 'Unit/Instant/Human/Rocket',
  title: 'Ракета',
  characteristics: {
    damage: {
      min: 30000,
      max: 30000,
    },
    life: 1,
  },
  targets: [
    'Unit/Space/Reptile/Lacertian',
    'Unit/Space/Reptile/Wyvern',
    'Unit/Space/Reptile/Trionyx',
  ],
};
