export default {
  id: 'Unit/Ground/Enginery/Reptile/Slider',
  title: 'Слайдер',
  description: 'Слайдер — это отличное решение Рептилий для молниеносных атак техникой, по своей силе он в разы превосходит наш аналог — Танк Изи, уже десятки раз дорабатывавшийся и переделывавшийся. Слайдер имеет более мощное вооружение, броня его прочнее, а мобильность выше. Слайдер крайне опасен в бою, Консул, учтите это.',
  basePrice: {
    humans: 15,
    metals: 39000,
    crystals: 3000,
    time: 30,
  },
  characteristics: {
    damage: {
      min: 240,
      max: 300,
    },
    life: 1000,
  },
  targets: [
    'Unit/Ground/Enginery/Human/Agmogedcar',
    'Unit/Ground/Enginery/Human/EasyTank',
    'Unit/Ground/Enginery/Human/Fast',
  ],
};
