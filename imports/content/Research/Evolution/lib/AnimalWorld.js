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
        result({ level }) {
          return (level * 0.1) + [0, 10, 15, 20, 30, 40, 52][Math.floor(level / 20)];
        },
      },
    ],
  },
  basePrice: {
    group: 'politic',
    tier: 1,
    humans: 1,
    metals: 2,
    crystals: 2,
    honor: 7,
  },
  plasmoidDuration: 60 * 60 * 24 * 365,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/Ikea', 8],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/Ikea', 18],
        ['Building/Residential/Crystal', 32],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/Ikea', 26],
        ['Building/Residential/Crystal', 50],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/Ikea', 37],
        ['Building/Residential/Crystal', 70],
        ['Building/Residential/Colosseum', 50],
      ];
    }
    return [
      ['Research/Evolution/Ikea', 51],
      ['Building/Residential/Crystal', 90],
      ['Building/Residential/Colosseum', 70],
    ];
  },
};
