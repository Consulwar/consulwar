export default {
  id: 'Building/Military/Void',
  title: 'Бездна',
  description: 'Если верно настроить Врата, то можно установить связь с ближайшими мирами. Один из таких миров учёные прозвали Бездной. Дело в том, что все события, происходящие в этом мире, по каким-то причинам крайне негативны, отвратны и жестоки. Этот мир находится вне нашего понимания, и его населяют отнюдь не самые приятные существа. И всё же… На что не пойдёшь ради науки или спасения своей жизни. Люди этой вселенной настолько утомлены изматывающей войной с Рептилиями, что готовы пойти даже на такой рискованный шаг. Поддержите ли вы их, Консул? Откроете ли вы врата… В Бездну…',
  effects: {
    Income: [
      {
        textBefore: 'Приток населения ',
        textAfter: '%',
        priority: 2,
        affect: 'humans',
        result(level = this.getCurrentLevel()) {
          return level === 0 || level === 100 ? 0 : ((level - 1) * 0.1) - 10;
        },
      },
    ],
    Price: [
      {
        textBefore: 'Потерянные требуют на ',
        textAfter: '% меньше людей',
        condition: 'Unit/Human/Ground/Infantry/Lost',
        priority: 2,
        affect: 'humans',
        result(level = this.getCurrentLevel()) {
          return [0, 10, 20, 30, 40, 50][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [10, 'slowExponentialGrow', 0],
      crystals: [10, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [100, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [13, 'slowLinearGrow', 0];
      price.EmeraldPlasmoid = [4, 'slowLinearGrow', 0];
    } else if (level < 40) {
      price.SapphirePlasmoid = [6, 'slowLinearGrow', 20];
    } else if (level < 60) {
      price.AmethystPlasmoid = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.TopazPlasmoid = [3, 'slowLinearGrow', 60];
    } else {
      price.RubyPlasmoid = [8, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Gates', 1],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Gates', 25],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Gates', 50],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Gates', 75],
      ];
    }
    return [
      ['Building/Military/Gates', 100],
    ];
  },
};
