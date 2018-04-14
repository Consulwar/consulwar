export default {
  id: 'Unit/Reptile/Space/Godzilla',
  title: 'Годзилла',
  description: 'По своим габаритам Годзилла размером с Тень, однако не обладает такой же боевой мощью и бронёй, что не делает, однако, этот корабль менее значимым. Когда встречаешься с этим монстром лицом к лицу, понимаешь, насколько эта махина огромная. К тому же Годзилла оснащена серьёзной системой щитов, которые защищают её от многих видов атак. При этом вооружение данного корабля может дать фору даже Пожинателю людей, впрочем, только пока тот не усилен. Так или иначе, Годзилла не будет размениваться на мелкие корабли, она будет стрелять прямо по вашему Флагману, Консул.',
  basePrice: {
    metals: 1300000,
    crystals: 400000,
  },
  characteristics: {
    weapon: {
      damage: { min: 1125000, max: 1375000 },
      signature: 3000,
    },
    health: {
      armor: 3000000,
      signature: 5000,
    },
  },
  targets: [
    'Unit/Human/Space/Flagship',
    'Unit/Human/Space/Reaper',
    'Unit/Human/Space/Dreadnought',
  ],
  opponents: [
    'Unit/Human/Space/Gammadrone',
    'Unit/Human/Space/Mirage',
    'Unit/Human/Space/Railgun',
  ],
};
