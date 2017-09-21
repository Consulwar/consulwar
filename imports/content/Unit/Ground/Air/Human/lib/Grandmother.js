export default {
  id: 'Unit/Ground/Air/Reptile/Grandmother',
  title: 'Бабуля',
  description: 'Уступите место бабуле? Бомбы со специальным Антирептилоидным зарядом носят аббревиатуру ПРЖК. Пилоты называют их «пирожки». А бомбер, несущий «пирожки» Рептилиям, прозвали Бабуля. Странно, почему не Красная Шапочка… Ну да ладно. Бабуля довольно медлительна по сравнению со Скорострелом, однако же имеет более крепкую броню и способна нанести гораздо больше урона технике и оборонительным постройкам противника.',
  basePrice: {
    humans: 100,
    metals: 1200,
    crystals: 600,
    time: 180,
  },
  characteristics: {
    damage: {
      min: 3456,
      max: 4320,
    },
    life: 2400,
  },
  targets: [
    'Unit/Ground/Enginery/Reptile/Gecko',
    'Unit/Ground/Enginery/Reptile/Chipping',
    'Unit/Ground/Enginery/Reptile/Crusher',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 40],
    ];
  },
};
