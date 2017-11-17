export default {
  id: 'Quest/Regular/Tamily/BlackMarket/BlackMarket95',
  condition: [
    ['Building/Residential/BlackMarket', 95],
  ],
  title: 'Построить Черный Рынок 95-го уровня',
  text: '<p>Прибыла экспедиция с планеты Ракксла, правитель. Они не хотят афишировать своё присутствие в нашей галактике, так что торгуют на Рынке через анонимного бота.</p><p>И товар, который они привезли, довольно экзотичный — по крайней мере, я раньше никогда не видела таких красивых и необычных зверюшек. Торговцы называют их трибблами и утверждают, что это самые милые существа во вселенной.</p>',
  options: {
    accept: {
      text: 'В их вселенной — возможно, а в нашей придётся делать санацию Рынка.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 39,
    crystals: 40,
  },
};