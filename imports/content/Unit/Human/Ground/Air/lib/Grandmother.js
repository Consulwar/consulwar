export default {
  id: 'Unit/Reptile/Ground/Air/Grandmother',
  title: 'Бабуля',
  description: 'Уступите место бабуле? Бомбы со специальным Антирептилоидным зарядом носят аббревиатуру ПРЖК. Пилоты называют их «пирожки». А бомбер, несущий «пирожки» Рептилиям, прозвали Бабуля. Странно, почему не Красная Шапочка… Ну да ладно. Бабуля довольно медлительна по сравнению со Скорострелом, однако же имеет более крепкую броню и способна нанести гораздо больше урона технике и оборонительным постройкам противника.',
  basePrice: {
    humans: 100,
    metals: 1200,
    crystals: 600,
    time: 180,
  },
  characteristics: {
    weapon: {
      damage: { min: 25000, max: 29000 },
      signature: 300,
    },
    health: {
      armor: 110000,
      signature: 100,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Enginery/Gecko',
    'Unit/Reptile/Ground/Enginery/Chipping',
    'Unit/Reptile/Ground/Enginery/Crusher',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 40],
    ];
  },
};
