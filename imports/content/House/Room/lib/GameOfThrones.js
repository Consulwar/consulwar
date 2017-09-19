export default {
  id: 'House/Room/GameOfThrones',
  isUnique: true,
  title: 'Тронный Зал Игры Престолов',
  description: 'Как Великий Консул, вы можете спокойно потребовать заменить ваш стандартный Тронный Зал на любой другой. Может быть… хм-м… Да! Тронный Зал из Игры Престолов? Это сильный и смелый шаг. С таким тронным залом ваше правление станет крепче, как и броня вашего флота.',
  effects: {
    Military: [
      {
        textBefore: 'Броня флота +',
        textAfter: '%',
        condition: 'Unit/Space/Human',
        priority: 2,
        affect: 'life',
        result() {
          return 3;
        },
      },
    ],
  },
};
