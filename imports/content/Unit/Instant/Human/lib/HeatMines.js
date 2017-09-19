export default {
  id: 'Unit/Instant/Human/HeatMines',
  title: 'Тепло-мины',
  characteristics: {
    damage: {
      min: 5000,
      max: 5000,
    },
    life: 1,
  },
  targets: [
    'Unit/Space/Reptile/Sphero',
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Lacertian',
  ],
};
