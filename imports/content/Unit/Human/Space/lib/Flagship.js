export default {
  id: 'Unit/Human/Space/Flagship',
  title: 'Императорский Флагман',
  description: 'Венец творения современной боевой космонавтики. Данный корабль производится лишь в одном экземпляре и лишь для Консулов. Разработки подобной боевой системы были начаты ещё 10 лет назад для особо рьяных и особо богатых милитаристов — членов галактического совета, однако война с Рептилиями расставила свои приоритеты и прототип был переоборудован специально для борьбы с чешуйчатыми, а после появления Консулов вопросов не осталось. Императорский Флагман — это символ силы его Правителя и это страх для его врагов! Рептилоиды стараются избегать боя с Императорским Флагманом, ибо даже им понятно, что лучше уйти сейчас и выжить, чем погибнуть в страшных муках и потерять половину флота.',
  basePrice: {
    humans: 150000,
    metals: 1000000,
    crystals: 100000,
    time: 24 * 60 * 60 * 3,
  },
  queue: 'Space/Council',
  characteristics: {
    weapon: {
      damage: { min: 900000, max: 1100000 },
      signature: 10000,
    },
    health: {
      armor: 3000000,
      signature: 10000,
    },
  },
  maxCount: 1,
  targets: [
    'Unit/Reptile/Space/Shadow',
    'Unit/Reptile/Space/Godzilla',
    'Unit/Reptile/Space/Armadillo',
  ],
  requirements() {
    return [
      ['Building/Residential/Political', 25],
      ['Building/Residential/Alliance', 25],
      ['Building/Military/Storage', 25],
    ];
  },
};
