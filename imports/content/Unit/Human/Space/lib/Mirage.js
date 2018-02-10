export default {
  id: 'Unit/Human/Space/Mirage',
  title: 'Мираж',
  description: 'В рамках поиска новых технологий, повышающих уровень защиты от Рептилий, на основе системы «стелс» атмосферных истребителей был разработан новый аппарат. Мираж отражает большинство сигналов, и он практически невидим на радарах противника. Однако же всё это не позволяет кораблю быть полностью неуловимым, а лишь усложняет наведение на цель. Тем не менее этого достаточно, чтобы он выполнял свою задачу. Удачных манёвров мираж выполняет больше, хотя по урону и броне соответствует Осе.',
  basePrice: {
    humans: 5,
    metals: 180,
    crystals: 60,
  },
  decayTime: 60 * 60,
  characteristics: {
    weapon: {
      damage: { min: 18, max: 22 },
      signature: 8,
    },
    health: {
      armor: 80,
      signature: 50,
    },
  },
  targets: [
    'Unit/Reptile/Space/Sphero',
    'Unit/Reptile/Space/Octopus',
    'Unit/Reptile/Space/Wyvern',
  ],
  requirements() {
    return [
      ['Building/Residential/SpacePort', 45],
      ['Building/Military/Airfield', 45],
      ['Research/Evolution/Nanotechnology', 20],
    ];
  },
};
