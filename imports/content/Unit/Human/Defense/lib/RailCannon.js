export default {
  id: 'Unit/Human/Defense/RailCannon',
  title: 'Рельсовая Пушка',
  description: 'Рельсовая Пушка просто необходима для любителей ваншот тактики. Корабли Рептилоидов средней мощности разлетаются в щепки от одного выстрела такого орудия, как Рельсовая Пушка. Эти орудия действительно могут перевернуть ход битвы несколькими залпами, Консул.',
  basePrice: {
    credits: 250,
  },
  queue: 'Defense/Donate',
  decayTime: 24 * 60 * 60,
  characteristics: {
    weapon: {
      damage: { min: 18000, max: 22000 },
      signature: 400,
    },
    health: {
      armor: 25000,
      signature: 800,
    },
  },
  targets: [
    'Unit/Reptile/Space/Hydra',
    'Unit/Reptile/Space/Dragon',
    'Unit/Reptile/Space/Wyvern',
  ],
  requirements() {
    return [
      ['Building/Residential/Political', 30],
      ['Research/Evolution/Drill', 28],
    ];
  },
};
