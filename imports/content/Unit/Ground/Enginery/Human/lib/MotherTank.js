export default {
  id: 'Unit/Ground/Enginery/Human/MotherTank',
  title: 'Танк Мамка 2.0',
  description: 'Мамка 2.0. Эта продвинутая версия оригинальной Мамки была изобретена специально для войны с Рептилоидами. Конечно, этот танк далеко не такой огромный, как твоя мамка, и всё же его размеры впечатляют. Правда, если в прошлой версии одна только башня была размером с двухэтажный дом, то теперь это размер всего танка. Это помогло увеличить мобильность, а новая лучевая пушка сохранила мощность орудий. Теперь Мамка может даже попытаться маневрировать на поле боя. Но двигается она всё ещё медленно. Зато нагибает… Она просто медленно двигается к цели и нагибает… Двигается… и нагибает.',
  basePrice: {
    humans: 300,
    metals: 4000,
    crystals: 1000,
    time: 180,
  },
  characteristics: {
    damage: {
      min: 1500,
      max: 2000,
    },
    life: 24000,
  },
  targets: [
    'Unit/Ground/Enginery/Reptile/Crusher',
    'Unit/Ground/Enginery/Reptile/Slider',
    'Unit/Ground/Enginery/Reptile/Breaker',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 60],
      ['Research/Evolution/Energy', 60],
      ['Building/Military/Complex', 40],
    ];
  },
};
