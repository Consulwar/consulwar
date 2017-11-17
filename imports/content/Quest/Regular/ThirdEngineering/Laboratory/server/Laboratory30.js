export default {
  id: 'Quest/Regular/ThirdEngineering/Laboratory/Laboratory30',
  condition: [
    ['Building/Military/Laboratory', 30],
  ],
  title: 'Построить Лабораторию 30-го уровня',
  text: '<p>Новые генераторы работают, Командир, и не только. Оказалось, что в результате окисления чистого металла получается очень ценная химическая производная, которая широко используется в промышленности, в том числе и в военной.</p><p>Но что это за производная, я вам сказать не могу – военные уже конфисковали всё оборудование и засекретили всю информацию о процессе работы. Теперь учёные ищут другой способ производить долгоиграющие батарейки.</p>',
  options: {
    accept: {
      text: 'Блин, я так и знал.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 6,
    crystals: 6,
  },
};