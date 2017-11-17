export default {
  id: 'Quest/Regular/Tamily/TradingPort/TradingPort25',
  condition: [
    ['Building/Residential/TradingPort', 25],
  ],
  title: 'Построить Торговый Порт 25-го уровня',
  text: '<p>С планеты Тар прибыл очередной торговый корабль, правитель. На этой ужасной планете всё ещё практикуют поединки на мечах, но зато сами мечи у них замечательные. Толщиной в атом, самозатачивающиеся, красота!</p><p>Мы каждый год закупаем у них полный комплект для нужд сельского хозяйства и самых примитивных ремёсел. В прошлый раз накупили столько, что пришлось расширять склад. Наверное, и в этот раз придётся.</p>',
  options: {
    accept: {
      text: 'Главное, принцесс там не закупайте. Стервы те ещё.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 12,
    crystals: 18,
  },
};