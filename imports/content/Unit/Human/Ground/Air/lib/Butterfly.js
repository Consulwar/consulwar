export default {
  id: 'Unit/Human/Ground/Air/Butterfly',
  title: 'Бабочка',
  description: 'Порхай как бабочка и жаль как… Ай! Сука бля! Бабочка – это единственный корабль такого размера, который может передвигаться в воздушном пространстве и в почти любой атмосфере. Да, он не очень быстрый, но, чёрт подери, это же грёбаная летающая крепость! Бабочка не просто уничтожает, она уничтожает всех… Вообще всех. Всё – больше нет рептилий, на земле одни трупы, в небе чисто, техника испарилась. Вы что, не верите? Постройте пару десятков бабочек, и вы узнаете, о чём я говорю, Консул.',
  basePrice: {
    humans: 10000,
    metals: 340000,
    crystals: 120000,
    time: 1541666,
  },
  queue: 'Ground/Air',
  characteristics: {
    weapon: {
      damage: { min: 50000, max: 50000 },
      signature: 100,
    },
    health: {
      armor: 1600000,
      signature: 750,
    },
  },
  targets: [
    'Unit/Reptile/Ground/Enginery/Patron',
    'Unit/Reptile/Ground/Enginery/Crusher',
    'Unit/Reptile/Ground/Enginery/Slider',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 70],
      ['Building/Military/OSCD', 65],
      ['Research/Evolution/Engineering', 66],
    ];
  },
};
