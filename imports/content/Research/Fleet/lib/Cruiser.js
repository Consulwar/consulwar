export default {
  id: 'Research/Fleet/Cruiser',
  title: 'Усиление Крейсера',
  description: 'Улучшая мощность Крейсера, его орудий, его корпуса и других систем, вы уже делаете этот корабль чрезвычайно выгодным, Консул. Но что, если я вам скажу, что его систему залпа можно модифицировать, и в случаях, когда бой будет затяжным, когда уже ни у кого не будет ни энергии, ни сил на продолжение боя, Крейсер сможет разрядить двойную энергию реакторов в своих врагов? Это крайне неожиданный и действительно полезный ход, Консул.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Крейсера +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Cruiser',
        priority: 2,
        affect: 'damage',
        result(level) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Крейсера +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Cruiser',
        priority: 2,
        affect: 'life',
        result(level) {
          return level * 0.4;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [60, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements() {
    return [
      ['Building/Military/Shipyard', 30],
      ['Building/Military/Barracks', 32],
      ['Research/Evolution/Energy', 30],
    ];
  },
};
