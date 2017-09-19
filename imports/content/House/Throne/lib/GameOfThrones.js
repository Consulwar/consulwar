export default {
  id: 'House/Throne/GameOfThrones',
  title: 'Трон из Игры Престолов',
  description: 'Здесь не Вестерос, однако же проблем не меньше. Нужно управлять целой планетой, судьба всего человечества зависит от Консула, Рептилоиды продолжают атаковать по всем фронтам, и только самые стойкие из Консулов смогут устоять. Железный Трон уникален и изготавливается именно для таких правителей.',
  effects: {
    Military: [
      {
        textBefore: 'Броня флота +',
        textAfter: '%',
        condition: 'Unit/Space/Human',
        priority: 2,
        affect: 'life',
        result() {
          return 2;
        },
      },
    ],
  },
  isUnique: true,
};
