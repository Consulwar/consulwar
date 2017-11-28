export default {
  id: 'Unit/Reptile/Ground/Enginery/Slider',
  title: 'Слайдер',
  description: 'Слайдер — это отличное решение Рептилий для молниеносных атак техникой, по своей силе он в разы превосходит наш аналог — Танк Изи, уже десятки раз дорабатывавшийся и переделывавшийся. Слайдер имеет более мощное вооружение, броня его прочнее, а мобильность выше. Слайдер крайне опасен в бою, Консул, учтите это.',
  basePrice: {
    humans: 15,
    metals: 390,
    crystals: 30,
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
    'Unit/Human/Ground/Enginery/Agmogedcar',
    'Unit/Human/Ground/Enginery/EasyTank',
    'Unit/Human/Ground/Enginery/Fast',
  ],
};
