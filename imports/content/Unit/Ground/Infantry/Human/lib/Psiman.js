export default {
  id: 'Unit/Ground/Infantry/Human/Psiman',
  title: 'Псионики',
  description: 'Псионики — до сих пор не до конца изученный феномен. Одни полагают, что мозг Псиоников работает так благодаря воздействию на него Рептилоидов. Другие считают, что это связано с излучением кристаллов, найденных в колониях. Однако, несмотря на причины таких изменений, Псионики остаются важной частью армии и переоценить их невозможно. Правда, не всё так хорошо. Подготовить настоящего Псионика крайне сложно, далеко не все люди с подходящей активностью мозга проходят тренировки. Лишь один из сотни подопытных в итоге получает способность контролировать мозговые импульсы и власть над разумом!',
  basePrice: {
    humans: 100,
    metals: 3000,
    crystals: 13500,
    time: 15,
  },
  characteristics: {
    damage: {
      min: 1,
      max: 300,
    },
    life: 500,
  },
  targets: [],
  requirements() {
    return [
      ['Building/Military/Barracks', 60],
      ['Building/Residential/PulseCatcher', 40],
    ];
  },
};
