import Dreadnought from '/imports/content/Unit/Space/Human/lib/Dreadnought';

export default {
  id: 'Research/Fleet/Dreadnought',
  title: 'Усиление Дредноута',
  description: 'Дредноуты людей – это довольно специфические корабли. И хотя они обладают надёжными бронёй и вооружением, их всё же нельзя назвать крепостями-убийцами. После усиления они, конечно, смогут сдержать намного больше урона, но всё же учёные и инженеры в их конструкции делают упор на вооружение. Орудиям Дредноута нужно время, чтобы разогреться, но как только это произойдёт, первые цели на пути Дредноута будут получать колоссальный урон.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Дредноута +',
        condition: 'Unit/Space/Human/Dreadnought',
        priority: 1,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 100;
          } else if (level < 100) {
            return level * 200;
          }
          return level * 400;
        },
      },
      {
        textBefore: 'Броня Дредноута +',
        condition: 'Unit/Space/Human/Dreadnought',
        priority: 1,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 200;
          } else if (level < 100) {
            return level * 400;
          }
          return level * 800;
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
  requirements: Dreadnought.requirements,
};
