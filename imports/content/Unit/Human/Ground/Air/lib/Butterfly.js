export default {
  id: 'Unit/Reptile/Ground/Air/Butterfly',
  title: 'Бабочка',
  description: 'Порхай как бабочка и жаль как… Ай! Сука бля! Бабочка – это единственный корабль такого размера, который может передвигаться в воздушном пространстве и в почти любой атмосфере. Да, он не очень быстрый, но, чёрт подери, это же грёбаная летающая крепость! Бабочка не просто уничтожает, она уничтожает всех… Вообще всех. Всё – больше нет рептилий, на земле одни трупы, в небе чисто, техника испарилась. Вы что, не верите? Постройте пару десятков бабочек, и вы узнаете, о чём я говорю, Консул.',
  basePrice: {
    humans: 10000,
    metals: 15000,
    crystals: 5400,
    time: 3600,
  },
  characteristics: {
    damage: {
      min: 34560,
      max: 43200,
    },
    life: 120000,
  },
  targets: [
    'Unit/Reptile/Ground/Enginery/Crusher',
    'Unit/Reptile/Ground/Air/Amphibian',
    'Unit/Reptile/Ground/Enginery/Patron',
  ],
  requirements() {
    return [
      ['Building/Military/Complex', 80],
      ['Building/Military/Oscd', 60],
      ['Building/Military/DefenseComplex', 60],
      ['Research/Evolution/Engineering', 80],
    ];
  },
};
