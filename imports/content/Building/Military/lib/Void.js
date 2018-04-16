import { tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Military/Void',
  title: 'Бездна',
  description: 'Если верно настроить Врата, то можно установить связь с ближайшими мирами. Один из таких миров учёные прозвали Бездной. Дело в том, что все события, происходящие в этом мире, по каким-то причинам крайне негативны, отвратны и жестоки. Этот мир находится вне нашего понимания, и его населяют отнюдь не самые приятные существа. И всё же… На что не пойдёшь ради науки или спасения своей жизни. Люди этой вселенной настолько утомлены изматывающей войной с Рептилиями, что готовы пойти даже на такой рискованный шаг. Поддержите ли вы их, Консул? Откроете ли вы врата… В Бездну…',
  effects: {
    Price: [
      {
        textBefore: 'Потерянные дешевле на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground/Infantry/Lost',
        priority: 2,
        affect: ['metals', 'crystals'],
        result({ level }) {
          return level * 0.2;
        },
      },
      {
        textBefore: 'Вызов Потерянных быстрее на ',
        textAfter: '%',
        condition: 'Unit/Human/Ground/Infantry/Lost',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'enginery',
    tier: 4,
    humans: 10,
    metals: 1110,
    crystals: 100,
    honor: 130,
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Gates', 1],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Gates', 21],
        ['Building/Residential/Statue', 28],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Gates', 41],
        ['Building/Residential/Statue', 35],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Gates', 61],
        ['Building/Residential/Statue', 45],
        ['Research/Evolution/Converter', 52],
      ];
    }
    return [
      ['Building/Military/Gates', 81],
      ['Building/Residential/Statue', 60],
      ['Research/Evolution/Converter', 70],
    ];
  },
};
