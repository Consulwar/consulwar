import Cruiser from '/imports/content/Unit/Space/Human/lib/Cruiser';

export default {
  id: 'Research/Fleet/Cruiser',
  title: 'Усиление Крейсера',
  description: 'Улучшая мощность Крейсера, его орудий, его корпуса и других систем, вы уже делаете этот корабль чрезвычайно выгодным, Консул. Но что, если я вам скажу, что его систему залпа можно модифицировать, и в случаях, когда бой будет затяжным, когда уже ни у кого не будет ни энергии, ни сил на продолжение боя, Крейсер сможет разрядить двойную энергию реакторов в своих врагов? Это крайне неожиданный и действительно полезный ход, Консул.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Крейсера +',
        condition: 'Unit/Space/Human/Cruiser',
        priority: 1,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 15;
          } else if (level < 100) {
            return level * 30;
          }
          return level * 60;
        },
      },
      {
        textBefore: 'Броня Крейсера +',
        condition: 'Unit/Space/Human/Cruiser',
        priority: 1,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 35;
          } else if (level < 100) {
            return level * 70;
          }
          return level * 140;
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
  requirements: Cruiser.requirements,
};
