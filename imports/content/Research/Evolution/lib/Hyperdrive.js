export default {
  id: 'Research/Evolution/Hyperdrive',
  title: 'Гипердвигатели',
  description: '«Эй, Рулевой! Заряжай-ка движок!» — «А зачем, Адмирал?» — «Гиперпрыжок! Гиперпрыжок! Мы совершаем… гиперпрыжок!» Мне кажется, что именно такие песни должны петь на космических кораблях перед отправкой в гиперпространство. Вы только представьте себе, Консул, двигатель не разгоняет корабль путём стандартной тяги. Двигатель открывает портал, червоточину… Это, по сути, является искривлением пространства вселенной. Это воздействие на материю на квантовом уровне! Всегда интересовало: вот если мы можем совершать такие манипуляции с материей, почему мы ещё не научились создавать вещи из воздуха?',
  effects: {
    Special: [
      {
        condition: 'Unique/spaceEngine',
        textBefore: '',
        textAfter: ' уровень движителей',
        result(level = this.getCurrentLevel()) {
          return level;
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [0.3, 'slowExponentialGrow', 0],
      crystals: [2, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [30, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [12, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.CrystalFragments = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.AmethystPlasmoid = [4, 'slowLinearGrow', 60];
    } else {
      price.AncientKnowledge = [4, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 45],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 55],
        ['Research/Evolution/crystallization', 20],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 65],
        ['Research/Evolution/crystallization', 40],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 75],
        ['Research/Evolution/crystallization', 60],
      ];
    }
    return [
      ['Building/Military/Laboratory', 85],
      ['Research/Evolution/crystallization', 80],
    ];
  },
};
