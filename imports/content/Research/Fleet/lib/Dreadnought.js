export default {
  id: 'Research/Fleet/Dreadnought',
  title: 'Усиление Дредноута',
  description: 'Дредноуты людей – это довольно специфические корабли. И хотя они обладают надёжными бронёй и вооружением, их всё же нельзя назвать крепостями-убийцами. После усиления они, конечно, смогут сдержать намного больше урона, но всё же учёные и инженеры в их конструкции делают упор на вооружение. Орудиям Дредноута нужно время, чтобы разогреться, но как только это произойдёт, первые цели на пути Дредноута будут получать колоссальный урон.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Дредноута +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Dreadnought',
        priority: 2,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Дредноута +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Dreadnought',
        priority: 2,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          return level * 0.4;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [150, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements() {
    return [
      ['Building/Military/Shipyard', 47],
      ['Building/Military/Factory', 45],
      ['Research/Evolution/Engineering', 45],
    ];
  },
};
