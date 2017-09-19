export default {
  id: 'House/Avatar/JohnSnow',
  isUnique: true,
  title: 'Аватар Джона Сноу',
  description: 'Консул может заказать себе любой робот-аватар. Так почему бы не заказать себе Аватар – точную копию Джона Сноу, брата ночного дозора, сильного, смелого. Подобный аватар вполне может улучшить броню вашего флота. И не спрашивайте как.',
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
};
