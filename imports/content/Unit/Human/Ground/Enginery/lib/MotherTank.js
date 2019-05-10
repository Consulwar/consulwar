export default {
  id: 'Unit/Human/Ground/Enginery/MotherTank',
  title: 'Танк Мамка 2.0',
  description: 'Мамка 2.0. Эта продвинутая версия оригинальной Мамки была изобретена специально для войны с Рептилоидами. Конечно, этот танк далеко не такой огромный, как твоя мамка, и всё же его размеры впечатляют. Правда, если в прошлой версии одна только башня была размером с двухэтажный дом, то теперь это размер всего танка. Это помогло увеличить мобильность, а новая лучевая пушка сохранила мощность орудий. Теперь Мамка может даже попытаться маневрировать на поле боя. Но двигается она всё ещё медленно. Зато нагибает… Она просто медленно двигается к цели и нагибает… Двигается… и нагибает.',
  basePrice: {
    humans: 1500,
    metals: 52000,
    crystals: 13500,
    time: 205208,
  },
  queue: 'Ground/Enginery',
  characteristics: {
    weapon: {
      damage: { min: 12500, max: 17500 },
      signature: 60,
    },
    health: {
      armor: 60000,
      signature: 120,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Enginery/Gecko',
    'Unit/Reptile/Ground/Enginery/Crusher',
    'Unit/Reptile/Ground/Enginery/Slider',
  ],
  requirements() {
    return [
      ['Building/Military/Factory', 60],
      ['Research/Evolution/Alloy', 50],
      ['Research/Evolution/Ikea', 50],
    ];
  },
};
