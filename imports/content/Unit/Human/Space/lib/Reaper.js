export default {
  id: 'Unit/Human/Space/Reaper',
  title: 'Пожинатель',
  description: 'Для получения технологии, по которой строился данный корабль, наши учёные годами изучали через портал космические войны в другой вселенной. К сожалению, пока что мы смогли понять не больше 10% от общего количества систем кораблей класса Пожинатель. Так или иначе, на основе этих знаний мы смогли построить нечто похожее на оригинал, и этого было достаточно, чтобы собрать самый мощный корабль серийного производства среди флотов человеческой расы. Его броня превосходна, а урон сложно переоценить. Сотни таких чудовищ разнесут практически любой флот противника.',
  basePrice: {
    humans: 50000,
    metals: 850000,
    crystals: 300000,
  },
  characteristics: {
    weapon: {
      damage: { min: 540000, max: 660000 },
      signature: 2000,
    },
    health: {
      armor: 2500000,
      signature: 5000,
    },
  },
  targets: [
    'Unit/Reptile/Space/Godzilla',
    'Unit/Reptile/Space/Armadillo',
    'Unit/Reptile/Space/Octopus',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 52],
      ['Building/Military/Complex', 45],
      ['Research/Evolution/Science', 58],
    ];
  },
};
