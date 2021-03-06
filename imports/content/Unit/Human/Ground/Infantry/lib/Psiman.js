export default {
  id: 'Unit/Human/Ground/Infantry/Psiman',
  title: 'Псионики',
  description: 'Псионики — до сих пор не до конца изученный феномен. Одни полагают, что мозг Псиоников работает так благодаря воздействию на него Рептилоидов. Другие считают, что это связано с излучением кристаллов, найденных в колониях. Однако, несмотря на причины таких изменений, Псионики остаются важной частью армии и переоценить их невозможно. Правда, не всё так хорошо. Подготовить настоящего Псионика крайне сложно, далеко не все люди с подходящей активностью мозга проходят тренировки. Лишь один из сотни подопытных в итоге получает способность контролировать мозговые импульсы и власть над разумом!',
  basePrice: {
    humans: 100,
    metals: 4500,
    crystals: 15000,
    time: 20792,
  },
  queue: 'Ground/Infantry',
  characteristics: {
    weapon: {
      damage: { min: 1000, max: 3000 },
      signature: 5,
    },
    health: {
      armor: 4000,
      signature: 2,
    },
  },
  targets: [],
  requirements() {
    return [
      ['Building/Military/Barracks', 60],
      ['Research/Evolution/Crystallization', 60],
      ['Research/Evolution/Science', 59],
    ];
  },
};
