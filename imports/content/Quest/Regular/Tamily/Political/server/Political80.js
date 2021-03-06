export default {
  id: 'Quest/Regular/Tamily/Political/Political80',
  condition: [
    ['Building/Residential/Political', 80],
  ],
  title: 'Построить Политический Центр 80-го уровня',
  text: '<p>После истории с плазмоидами в стенах сара… Политического Центра Натали таки сжалилась над нашими законотворцами и разрешила отделу Мебели поработать пару дней «на благо общества». В результате вышли довольно неплохие трибуны, кресла, столы и даже пара систем электронного голосования.</p><p>Впрочем, отдел нанотехнологий тоже в стороне не сидел, а встраивал во всю эту красоту миниатюрные передатчики звука и изображения. Вы же не думали, что мы оставим такой важный объект без прослушки?</p>',
  options: {
    accept: {
      text: 'Просто надо было назначить пару енотов секретаршами и всё, никто бы даже не заметил ничего.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5000,
    crystals: 5000,
  },
};
