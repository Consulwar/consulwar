export default {
  id: 'Building/Military/OSCD',
  title: 'Фабрика ОСКО',
  description: 'Что вы представляете, Консул, когда слышите словосочетание «орбитальная станция»? Пару капсул с понатыканными на них солнечными батареями? Это мы в своём мире тратим время на то, чтобы окроплять космические корабли святой водой. А в этом мире люди не тратили время на глупости. Данная фабрика производит самые мощные защитные сооружения — Орбитальные Станции Космической Обороны. Поверьте, зрелище впечатляющее.',
  effects: {
    Military: [
      {
        textBefore: 'Броня космических станций +',
        textAfter: '%',
        condition: 'Unit/Defense/Human/OrbitalDefenseStation',
        priority: 2,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          return level * 0.2;
        },
      },
    ],
    Special: [
      {
        textBefore: '+',
        textAfter: '% шансу способности орбитальных станций',
        result(level = this.getCurrentLevel()) {
          return [0, 10, 20, 40, 60, 80][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [1000, 'slowExponentialGrow', 0],
      crystals: [500, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [700, 'slowLinearGrow', 20];
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
        ['Building/Military/PowerStation', 80],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/PowerStation', 85],
        ['Building/Military/Complex', 60],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/PowerStation', 90],
        ['Building/Military/Complex', 70],
        ['Research/Evolution/Energy', 70],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/PowerStation', 95],
        ['Building/Military/Complex', 80],
        ['Research/Evolution/Energy', 80],
        ['Building/Residential/BlackMarket', 60],
      ];
    }
    return [
      ['Building/Military/PowerStation', 100],
      ['Building/Military/Complex', 90],
      ['Research/Evolution/Energy', 90],
      ['Building/Residential/BlackMarket', 70],
    ];
  },
};
