export default {
  id: 'Unit/Defense/Human/Mine',
  title: 'Мины',
  description: 'Мины — прекрасное средство против кораблей среднего размера. Огромные минные поля устанавливаются в местах, приоритетных для варп-прыжка. Крупные корабли без проблем могут выдерживать урон таких мин, зато корабли поменьше будут уничтожены сразу по прибытии.',
  basePrice: {
    metals: 5,
    time: 5,
  },
  characteristics: {
    damage: {
      min: 160,
      max: 200,
    },
    life: 5,
  },
  targets: [
    // нет приоритетной цели, рандом
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 1],
    ];
  },
};
