export default {
  id: 'Quest/Regular/NatalyVerlen/Drill/Drill55',
  condition: [
    ['Research/Evolution/Drill', 55],
  ],
  title: 'Исследовать Бурильный Бур 55-го уровня',
  text: '<p>Теперь, когда наши шахты надёжно защищены от любых напастей, Консул, инженеры могут заняться изучением сейсмической активности планеты. Вы удивитесь, Консул, но каждый день происходит несколько десятков слабых землетрясений.</p><p>Можно сказать, что сейсмические волны пробегают по поверхности планеты почти постоянно. И не только по поверхности – благодаря им мы можем заглянуть в те места, которые раньше были нам совершенно недоступны.</p>',
  options: {
    accept: {
      text: 'Да? И много таких мест?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 800,
    crystals: 800,
  },
};
