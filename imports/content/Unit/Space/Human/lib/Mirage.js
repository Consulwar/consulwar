export default {
  id: 'Unit/Space/Human/Mirage',
  title: 'Мираж',
  description: 'В рамках поиска новых технологий, повышающих уровень защиты от Рептилий, на основе системы «стелс» атмосферных истребителей был разработан новый аппарат. Мираж отражает большинство сигналов, и он практически невидим на радарах противника. Однако же всё это не позволяет кораблю быть полностью неуловимым, а лишь усложняет наведение на цель. Тем не менее этого достаточно, чтобы он выполнял свою задачу. Удачных манёвров мираж выполняет больше, хотя по урону и броне соответствует Осе.',
  basePrice: {
    humans: 50,
    metals: 33,
    crystals: 13.75,
    time: 200,
  },
  characteristics: {
    damage: {
      min: 400,
      max: 500,
    },
    life: 1000,
  },
  targets: [
    'Unit/Space/Reptile/Lacertian',
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Sphero',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 20],
      ['Building/Military/Shipyard', 15],
    ];
  },
};
