export default {
  id: 'Research/Evolution/AnimalWorld',
  title: 'В мире животных',
  description: 'Сейчас я вам поясню, как работает политика. Есть корпорации, есть миллионеры, есть власть имущие или даже почти Императоры, как вы, Консул. И обычно все эти люди, имеющие реальную весомую власть, остаются в тени. Но кто-то же должен донести их мысль народу, и вот тут на помощь приходит «массовка», умно кивающие мужики в пиджаках. Они повсюду — они на радио, они по телевизору, они в газетах и в интернете. Люди думают, что это они принимают законы, именно им все высказывают своё недовольство. Они — лицо политики, наглые, жадные и хитрые твари в пиджаках, шестёрки власти. Их задача проста: сидеть и подпёздывать, с умным лицом кивать и делать вид, что они понимают, о чём идёт речь. Они почти как собаки, разве что не такие умные. Консул! Возьмите себе вон того… рыженького с бородкой…',
  effects: {
    Price: [
      {
        textBefore: 'Сообщения в общий чат дешевле на ',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/message',
        affect: 'crystals',
        result(level) {
          return level * 0.1;
        },
      },
      {
        textBefore: 'Дополнительный бонус ',
        textAfter: '%',
        priority: 2,
        condition: 'Unique/message',
        affect: 'crystals',
        result(level) {
          return [0, 10, 15, 20, 30, 40][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [1, 'slowExponentialGrow', 0],
      crystals: [1, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [20, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [5, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.nanoWires = [6, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.nicolascagium = [5, 'slowLinearGrow', 60];
    } else {
      price.AncientScheme = [3, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 40],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 50],
        ['Research/Evolution/Ikea', 25],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 60],
        ['Research/Evolution/Ikea', 45],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 70],
        ['Research/Evolution/Ikea', 65],
      ];
    }
    return [
      ['Building/Military/Laboratory', 80],
      ['Research/Evolution/Ikea', 75],
    ];
  },
};
