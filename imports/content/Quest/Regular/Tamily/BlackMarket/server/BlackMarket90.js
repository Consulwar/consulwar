export default {
  id: 'Quest/Regular/Tamily/BlackMarket/BlackMarket90',
  condition: [
    ['Building/Residential/BlackMarket', 90],
  ],
  title: 'Построить Черный Рынок 90-го уровня',
  text: '<p>О, прилетел корабль пиратов из системы Рансер, правитель. Видите, к их трапу уже бежит толстяк в кепке? Это Морж Жартин, наш местный писатель. Когда-то он скрупулёзно исследовал дипломатические отношения разных альянсов, но без зевоты читать его писанину было невозможно.</p><p>Тогда он перенёс повествование в фентезийный мир, добавил кровищи и непристойностей, и народ начал как сумасшедший скупать его книги. Вижу, и у вас они есть.</p>',
  options: {
    accept: {
      text: 'Я тайно исследую дипломатию, Тамили, не подумай чего.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 3700,
    crystals: 3800,
  },
};
