export default {
  id: 'Quest/Regular/Tamily/Political/Political75',
  condition: [
    ['Building/Residential/Political', 75],
  ],
  title: 'Построить Политический Центр 75-го уровня',
  text: '<p>Вы не поверите, но схема с общим котлом действительно оказалась мошеннической, правитель. Правда, надо отдать должное нашим «парламентариям» – они пошли на обман исключительно из желания как-то украсить свой сарай. А так как артефакты на планете невозможно продать, они просто втыкали их в стены и потолки.</p><p>Некоторые ещё кололи орехи плазмоидами и использовали квадрокулеры в качестве подставок под планшет. В общем, мы конфисковали всё, что там было, и готовы продолжать строительство.</p>',
  options: {
    accept: {
      text: 'Вот дураки! Орехи удобнее колоть элементами питания… Э-э, я хотел сказать, хорошая работа, Тамили!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 85,
    crystals: 85,
  },
};