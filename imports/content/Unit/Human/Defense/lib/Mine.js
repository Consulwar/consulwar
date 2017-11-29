export default {
  id: 'Unit/Human/Defense/Mine',
  title: 'Мины',
  description: 'Мины — прекрасное средство против кораблей среднего размера. Огромные минные поля устанавливаются в местах, приоритетных для варп-прыжка. Крупные корабли без проблем могут выдерживать урон таких мин, зато корабли поменьше будут уничтожены сразу по прибытии.',
  basePrice: {
    metals: 20,
    time: 5 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 5, max: 5 },
      signature: 1,
    },
    health: {
      armor: 1,
      signature: 1000,
    },
  },
  targets: [
    // нет приоритетной цели, рандом
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 1],
      ['Research/Evolution/Energy', 8],
    ];
  },
};
