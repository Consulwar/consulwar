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
        result(level) {
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
        ['Building/Military/Laboratory', 25],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 40],
        ['Research/Evolution/Converter', 20],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 54],
        ['Research/Evolution/Converter', 30],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 68],
        ['Research/Evolution/Converter', 40],
        ['Building/Military/Shipyard', 40],
      ];
    }
    return [
      ['Building/Military/Laboratory', 90],
      ['Research/Evolution/Converter', 50],
      ['Building/Military/Shipyard', 50],
    ];
  },
};
