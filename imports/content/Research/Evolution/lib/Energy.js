import { tier2, tier3 } from '/imports/content/formula';

export default {
  id: 'Research/Evolution/Energy',
  title: 'Энергетика',
  description: 'Пожалуй, ни у кого не возникнет вопросов, почему энергия считается важнейшим из ресурсов в век научно-технического прогресса. И уж тем более во времена жестокой войны с инопланетной расой. Осваиваются всё новые и новые колонии, заводы работают на полную мощность и, хотя открытие жидкого кристалла коренным образом повлияло на энергетику, вопрос всё же остаётся открытым. Дальнейшее изучение свойств кристаллической энергии может существенно снизить затраты средств на армию и уж тем более является совершенно необходимым для большинства производств.',
  effects: {
    Special: [
      {
        textBefore: 'Бонусы палаты консула +',
        textAfter: '%',
        condition: 'Unique/EnchantHouse',
        priority: 2,
        affect: 'result',
        result({ level }) {
          return (level * 0.4) + [0, 10, 20, 30, 40, 60][Math.floor(level / 20)];
        },
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Крейсеров быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Cruiser',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Строительство Рейлганов быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Space/Railgun',
        priority: 6,
        affect: 'time',
        result: tier3,
      },
      {
        textBefore: 'Строительство Мин быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Defense/Mine',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'politic',
    tier: 2,
    humans: 3,
    metals: 4,
    crystals: 8,
    honor: 15,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 9],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 18],
        ['Building/Residential/Metal', 24],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 27],
        ['Building/Residential/Metal', 50],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 44],
        ['Building/Residential/Metal', 72],
        ['Research/Evolution/Converter', 42],
      ];
    }
    return [
      ['Building/Military/Laboratory', 58],
      ['Building/Residential/Metal', 90],
      ['Research/Evolution/Converter', 62],
    ];
  },
};
