export default {
  id: 'Quest/Regular/Tamily/House/House90',
  condition: [
    ['Building/Residential/House', 90],
  ],
  title: 'Построить Жилой Комплекс 90-го уровня',
  text: '<p>Добрый вечер, правитель! Знаете, в Мегаполисе очень красиво по вечерам: всё светится, мигает реклама, работают информационные панели… Вот бы нам сделать что-то подобное в Жилых Комплексах! Ещё можно поставить большой рекламный экран в центре каждого квартала. Содержание рекламы уже согласовано — идут ролики Казармы,Лаборатории, Пси-Центра, Инженерного Комплекса, — словом,нас ожидает прирост населения и, возможно, новых специалистов. Приказывайте, Консул, и Жилой Квартал снова начнет обновляться.</p>',
  options: {
    accept: {
      text: 'Реклама – это хорошо! Главное, чтоб у меня её не было.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 7000,
    crystals: 7000,
  },
};
