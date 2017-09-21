export default {
  id: 'Quest/Regular/NatalyVerlen/Alloy/Alloy95',
  condition: [
    ['Research/Evolution/Alloy', 95],
  ],
  title: 'Исследовать Особые Сплавы 95-го уровня',
  text: '<p>Космопорт – одно из самых красивых мест на планете, Консул. И мне особенно приятно, что эта красота была выполнена руками человека, а не получилась случайно в результате природного катаклизма.</p><p>А наша задача – сделать это место не только величественным, но и более удобным. Например, можно увеличить количество терминалов, чтобы разгрузить посадочные площадки. Мы в Лаборатории уже готовы к тому, чтобы приступить к исследованию Особых Сплавов.</p>',
  options: {
    accept: {
      text: 'И площадок сделайте, я жду большую партию контраба… то есть учебников по физике.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 95,
    crystals: 95,
  },
};
