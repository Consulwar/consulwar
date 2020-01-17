import { every10x2, tier3 } from '/imports/content/formula';

export default {
  id: 'Research/Evolution/Science',
  title: 'Научный отдел',
  description: 'Любая достаточно развитая технология неотличима от магии. И для подобной магии вовсе не обязательно воздерживаться до тридцати лет, достаточно просто быть довольно умным, начитанным и пытливым сукиным сыном в белом халате. Более того, во времена нынешнего научного прогресса стало возможным создавать учёных из просто умных ребят путём изменения их кода ДНК, что впоследствии добавляет им ещё несколько пунктов IQ. Ну, или они умирают в страшных мучениях… Но что же поделать, это наука, детка. Хочешь быть гением — рискни! Редкое изобретение работает с первого раза, особенно это касается генетики. Но не стоит расстраиваться. Через тернии к звёздам, Консул.',
  effects: {
    Price: [
      {
        textBefore: 'Исследования на ',
        textAfter: '% быстрее',
        condition: 'Research',
        priority: 2,
        affect: 'time',
        result: every10x2,
      },
      {
        textBefore: 'Строительство Пожинателей быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Reaper',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Подготовка Псиоников быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground/Infantry/Psiman',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
    ],
  },
  basePrice: {
    group: 'special',
    tier: 1,
    humans: 0.8,
    metals: 1,
    crystals: 3,
    honor: 6,
  },
  plasmoidDuration: 60 * 60 * 24 * 7,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 15],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 35],
        ['Research/Evolution/Energy', 32],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 55],
        ['Research/Evolution/Energy', 52],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 75],
        ['Research/Evolution/Energy', 72],
        ['Research/Evolution/Crystallization', 70],
      ];
    }
    return [
      ['Building/Military/Laboratory', 95],
      ['Research/Evolution/Energy', 90],
      ['Research/Evolution/Crystallization', 90],
    ];
  },
};
