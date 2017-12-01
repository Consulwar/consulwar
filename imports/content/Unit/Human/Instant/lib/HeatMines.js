export default {
  id: 'Unit/Human/Instant/HeatMines',
  title: 'Тепло-мины',
  characteristics: {
    damage: {
      min: 5000,
      max: 5000,
    },
    life: 1,
  },
  targets: [
    'Unit/Reptile/Space/Sphero',
    'Unit/Reptile/Space/Blade',
    'Unit/Reptile/Space/Lacertian',
  ],
};
