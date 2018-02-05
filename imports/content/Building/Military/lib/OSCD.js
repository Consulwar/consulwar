import { tier1, tier2 } from '/imports/content/formula';

export default {
  id: 'Building/Military/OSCD',
  title: 'Фабрика ОСКО',
  description: 'Что вы представляете, Консул, когда слышите словосочетание «орбитальная станция»? Пару капсул с понатыканными на них солнечными батареями? Это мы в своём мире тратим время на то, чтобы окроплять космические корабли святой водой. А в этом мире люди не тратили время на глупости. Данная фабрика производит самые мощные защитные сооружения — Орбитальные Станции Космической Обороны. Поверьте, зрелище впечатляющее.',
  effects: {
    Military: [
      {
        textBefore: 'Броня обороны +',
        textAfter: '%',
        condition: 'Unit/Human/Defense',
        priority: 2,
        affect: 'life',
        result(level) {
          return level * 0.2;
        },
      },
    ],
    Price: [
      {
        textBefore: 'Строительство Орбитальных Станций Обороны на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Defense/OrbitalDefenseStation',
        priority: 2,
        affect: 'time',
        result: tier1,
      },
      {
        textBefore: 'Строительство Бабочек на ',
        textAfter: '% быстрее',
        condition: 'Unit/Human/Ground/Air/Butterfly',
        priority: 4,
        affect: 'time',
        result: tier2,
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [10, 'slowExponentialGrow', 0],
      crystals: [5, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [7, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [10, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.jimcarrium = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.AncientKnowledge = [4, 'slowLinearGrow', 60];
    } else {
      price.RubyPlasmoid = [8, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Complex', 35],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Complex', 45],
        ['Building/Military/Shipyard', 18],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Complex', 58],
        ['Building/Military/Shipyard', 27],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Complex', 75],
        ['Building/Military/Shipyard', 36],
        ['Research/Evolution/DoomsDaySizing', 60],
      ];
    }
    return [
      ['Building/Military/Complex', 85],
      ['Building/Military/Shipyard', 45],
      ['Research/Evolution/DoomsDaySizing', 80],
    ];
  },
};
