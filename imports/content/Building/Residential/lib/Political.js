import { tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Residential/Political',
  title: 'Политический центр',
  description: 'Ох, политика, политика… Казалось бы, кому нужны политики, когда есть единый правитель, император, его величество Консул! Однако же в мире столько вопросов, требующих внимания, а у великого правителя так мало времени. Не лучше ли, чтобы этим занимались маленькие никчёмные людишки в костюмах? Сидели там себе в кабинетах и спорили о том, в каком районе города установить новый светофор, пока вы, Консул, будете решать, в каком районе Земли высаживать войска для битвы с Рептилоидами. Тем не менее при всей своей никчёмности политики – довольно хитрые задницы, и могут приносить реальную пользу вашему делу путём добычи небольшого количества Грязных Галактических Кредитов. А вот это уже кое-что. Согласитесь, Консул.',
  effects: {
    Special: [
      {
        textBefore: '+',
        textAfter: ' к силе голоса',
        condition: 'Unique/VotePower',
        affect: 'power',
        priority: 1,
        result({ level }) {
          return Math.floor(level / 10);
        },
      },
    ],
    Price: [
      {
        textBefore: 'Доставка Ионных Мин на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/IonMine',
        priority: 2,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Доставка Лазерных Турелей на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/LaserTurret',
        priority: 2,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Доставка Рельсовых Пушек на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/RailCannon',
        priority: 2,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Доставка Жидкоплазменных Тиранов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/Tyrant',
        priority: 2,
        affect: 'time',
        result: tier2,
      },
      {
        textBefore: 'Доставка Трилинейных Кристалл-Ганов на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/TripleCrystalGun',
        priority: 2,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice: {
    group: 'politic',
    tier: 2,
    humans: 8,
    metals: 7,
    crystals: 4,
    honor: 17,
  },
  plasmoidDuration: 60 * 60 * 24 * 28 * 2,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/AnimalWorld', 9],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/AnimalWorld', 27],
        ['Building/Residential/Entertainment', 30],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/AnimalWorld', 42],
        ['Building/Residential/Entertainment', 48],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/AnimalWorld', 70],
        ['Building/Residential/Entertainment', 72],
        ['Research/Evolution/Ikea', 80],
      ];
    }
    return [
      ['Research/Evolution/AnimalWorld', 90],
      ['Building/Residential/Entertainment', 90],
      ['Research/Evolution/Ikea', 95],
    ];
  },
};
