export default {
  id: 'Unit/Space/Human/Reaper',
  title: 'Пожинатель',
  description: 'Для получения технологии, по которой строился данный корабль, наши учёные годами изучали через портал космические войны в другой вселенной. К сожалению, пока что мы смогли понять не больше 10% от общего количества систем кораблей класса Пожинатель. Так или иначе, на основе этих знаний мы смогли построить нечто похожее на оригинал, и этого было достаточно, чтобы собрать самый мощный корабль серийного производства среди флотов человеческой расы. Его броня превосходна, а урон сложно переоценить. Сотни таких чудовищ разнесут практически любой флот противника.',
  basePrice: {
    humans: 100000,
    metals: 6000,
    crystals: 2000,
    time: 60 * 60 * 24,
  },
  characteristics: {
    damage: {
      min: 48000,
      max: 60000,
    },
    life: 150000,
  },
  targets: [
    'Unit/Space/Reptile/Godzilla',
    'Unit/Space/Reptile/Octopus',
    'Unit/Space/Reptile/Prism',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 65],
      ['Building/Military/Gates', 80],
      ['Building/Military/Void', 60],
    ];
  },
};
