export default {
  id: 'Unit/Human/Space/Dreadnought',
  title: 'Дредноут',
  description: 'Дредноут – корабль среднего класса. По размеру он немного меньше авианосца, а грозное название получил благодаря особой конструкции: фронтальная броня Дредноута практически непробиваема, его орудия многочисленны и крайне точны, скорость стрельбы поражает. Крупные орудия на бортах способны сносить с одного залпа небольшие корабли врага, а особая система боковых двигателей позволяет Дредноуту крайне быстро разворачиваться носом в нужную сторону. Обойти его сверху или снизу не выйдет, крупный калибр не позволит. Очень мощный корабль людей, единственная его слабость – вражеский удар «в спину».',
  basePrice: {
    humans: 25000,
    metals: 450000,
    crystals: 150000,
  },
  queue: 'Space/Heavy',
  decayTime: 20 * 24 * 60 * 60,
  characteristics: {
    weapon: {
      damage: { min: 180000, max: 220000 },
      signature: 1000,
    },
    health: {
      armor: 1200000,
      signature: 1800,
    },
  },
  targets: [
    'Unit/Reptile/Space/Armadillo',
    'Unit/Reptile/Space/Hydra',
    'Unit/Reptile/Space/Dragon',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 47],
      ['Building/Military/Factory', 45],
      ['Research/Evolution/Engineering', 45],
    ];
  },
};
