import Flagship from '/imports/content/Unit/Space/Human/lib/Flagship';

export default {
  id: 'Research/Fleet/Flagship',
  title: 'Усиление Флагмана',
  description: 'Флагман управляется аватаром Консула. И хоть сам Консул всё ещё в безопасности в своей вселенной, сидит у компа… Простите, системы управления и командует своей империей, всё же Истинный образ Генерала, командующего атакой на личном Флагмане, воодушевляет солдат. Не говоря уже о том, что Флагман – это самое мощное передвижное орудие людей, и на заказ собирают не более одного флагмана для одного Консула. Как нельзя кстати здесь придётся усиление флагмана, дающее ему возможность возвращаться домой даже из самой жаркой задницы космических боёв.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Флагмана +',
        condition: {
          id: 'Unit/Space/Human/Flagship',
        },
        priority: 1,
        affect: 'damage',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 750;
          } else if (level < 100) {
            return level * 1500;
          }
          return level * 3000;
        },
      },
      {
        textBefore: 'Броня Флагмана +',
        condition: {
          id: 'Unit/Space/Human/Flagship',
        },
        priority: 1,
        affect: 'life',
        result(level = this.getCurrentLevel()) {
          if (level < 50) {
            return level * 2500;
          } else if (level < 100) {
            return level * 5000;
          }
          return level * 10000;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [3000, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements: Flagship.requirements,
};
