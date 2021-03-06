export default {
  id: 'Quest/Regular/Tamily/Crystal/Crystal25',
  condition: [
    ['Building/Residential/Crystal', 25],
  ],
  title: 'Построить Шахту Кристалла 25-го уровня',
  text: '<p>Подошло время для улучшения шахты Кристалла, правитель. Начать стоит с набора дополнительных работников, которые будут обслуживать шахту — лаборантов, учётчиков и ремонтной бригады.</p><p>Улучшение шахты может показаться вам дорогим, но зато оно позволит вам добывать гораздо больше этого ценного ресурса. По вашему приказу, Консул, мы готовы приступать к модернизации одного из самых нужных зданий на этой планете.</p>',
  options: {
    accept: {
      text: 'Лаборантов, учётчиков… Кофемашину им туда ещё купите, бля.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 350,
    crystals: 350,
  },
};
