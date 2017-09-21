export default {
  id: 'Unit/Space/Human/Dreadnought',
  title: 'Дредноут',
  description: 'Дредноут – корабль среднего класса. По размеру он немного меньше авианосца, а грозное название получил благодаря особой конструкции: фронтальная броня Дредноута практически непробиваема, его орудия многочисленны и крайне точны, скорость стрельбы поражает. Крупные орудия на бортах способны сносить с одного залпа небольшие корабли врага, а особая система боковых двигателей позволяет Дредноуту крайне быстро разворачиваться носом в нужную сторону. Обойти его сверху или снизу не выйдет, крупный калибр не позволит. Очень мощный корабль людей, единственная его слабость – вражеский удар «в спину».',
  basePrice: {
    humans: 25000,
    metals: 1700,
    crystals: 600,
    time: 60 * 60,
  },
  characteristics: {
    damage: {
      min: 16000,
      max: 20000,
    },
    life: 50000,
  },
  targets: [
    'Unit/Space/Reptile/Octopus',
    'Unit/Space/Reptile/Prism',
    'Unit/Space/Reptile/Armadillo',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 55],
      ['Building/Military/Shipyard', 50],
      ['Research/Evolution/Alloy', 50],
      ['Research/Evolution/Hyperdrive', 45],
    ];
  },
};
