import { tier2 } from '/imports/content/formula';

export default {
  id: 'Research/Evolution/Drill',
  title: 'Бурильный бур',
  description: 'Бурильный бур обрабатывает горные породы лазером, ультразвуком, использует термическую обработку породы, на месте перерабатывает шлак в энергию и попутно устанавливает высокотехнологичные сваи, прокладывая туннель в кратчайшие сроки. И всё это с невероятной для такой махины скоростью. Да… Подобные технологии не на каждом сверхсовременном боевом корабле встретишь… Самое интересное, что учёные до сих пор до конца не понимают, как работает этот бур. Дело в том, что его схему 10 лет назад увидел во сне обычный учитель физики. Правда, теперь его останки покоятся где-то на захваченной Рептилоидами Земле, но его детище живёт и исправно служит человечеству. На данный момент эта технология активно применяется в добыче металла и показывает себя с лучшей стороны. Ещё бы кофе мог заваривать, и цены б ему не было…',
  effects: {
    Income: [
      {
        textBefore: 'Прирост металла на ',
        textAfter: '%',
        priority: 2,
        affect: 'metals',
        result({ level }) {
          return (level * 0.2) + [0, 10, 25, 50, 65, 80, 176][Math.floor(level / 20)];
        },
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Снайпер Ганов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/SniperGun',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Доставка Рельсовых Пушек на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/RailCannon',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Строительство Танков Изи на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Enginery/EasyTank',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Строительство Бабуль на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Air/Grandmother',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'enginery',
    tier: 1,
    humans: 1,
    metals: 0.3,
    crystals: 0.05,
    honor: 14,
  },
  plasmoidDuration: 60 * 60 * 24 * 14,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 3],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 13],
        ['Building/Residential/Metal', 15],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 33],
        ['Building/Residential/Metal', 35],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 43],
        ['Building/Residential/Metal', 55],
        ['Research/Evolution/Energy', 54],
      ];
    }
    return [
      ['Building/Military/Laboratory', 53],
      ['Building/Residential/Metal', 75],
      ['Research/Evolution/Energy', 66],
    ];
  },
};
