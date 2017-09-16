export default {
  id: 'Unit/Defense/Human/RailCannon',
  title: 'Рельсовая Пушка',
  description: 'Рельсовая Пушка просто необходима для любителей ваншот тактики. Корабли Рептилоидов средней мощности разлетаются в щепки от одного выстрела такого орудия, как Рельсовая Пушка. Эти орудия действительно могут перевернуть ход битвы несколькими залпами, Консул.',
  basePrice: {
    credits: 300,
    time: 60 * 5,
  },
  characteristics: {
    damage: {
      min: 9600,
      max: 12000,
    },
    life: 50000,
  },
  targets: [
    'Unit/Space/Reptile/Hydra',
    'Unit/Space/Reptile/Dragon',
    'Unit/Space/Reptile/Wyvern',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 50],
      ['Research/Evolution/Engineering', 45],
    ];
  },
};
