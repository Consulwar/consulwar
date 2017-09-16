export default {
  id: 'Unit/Space/Reptile/Godzilla',
  title: 'Годзилла',
  description: 'По своим габаритам Годзилла размером с Тень, однако не обладает такой же боевой мощью и бронёй, что не делает, однако, этот корабль менее значимым. Когда встречаешься с этим монстром лицом к лицу, понимаешь, насколько эта махина огромная. К тому же Годзилла оснащена серьёзной системой щитов, которые защищают её от многих видов атак. При этом вооружение данного корабля может дать фору даже Пожинателю людей, впрочем, только пока тот не усилен. Так или иначе, Годзилла не будет размениваться на мелкие корабли, она будет стрелять прямо по вашему Флагману, Консул.',
  basePrice: {
    humans: 100000,
    metals: 600000,
    crystals: 200000,
    time: 60 * 60 * 24,
  },
  characteristics: {
    damage: {
      min: 64000,
      max: 80000,
    },
    life: 200000,
  },
  targets: [
    'Unit/Space/Human/Flagship',
    'Unit/Space/Human/Reaper',
    'Unit/Space/Human/Dreadnought',
  ],
};