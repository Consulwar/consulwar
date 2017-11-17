export default {
  id: 'Quest/Regular/NatalyVerlen/Ikea/Ikea45',
  condition: [
    ['Research/Evolution/Ikea', 45],
  ],
  title: 'Исследовать Мебель из Икеа 45-го уровня',
  text: '<p>А вы знаете, Консул, несмотря на железную дисциплину и военную точность, у Космопорта всё-таки бывают задержки рейсов. Наш отдел ничего не может поделать с погодными условиями или головотяпством отдельных чиновников, но зато может сконструировать удобные кресла в залах ожидания.</p><p>Главное – не переборщить с удобством, иначе пассажиры будут просто засыпать в середине регистрации. Возможно, инженеры прикрутят к подлокотникам датчики храпа или будильник.</p>',
  options: {
    accept: {
      text: 'Или петарду…',
      mood: 'positive',
    },
  },
  reward: {
    metals: 80,
    crystals: 80,
  },
};