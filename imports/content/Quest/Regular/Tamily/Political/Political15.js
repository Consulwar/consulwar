export default {
  id: 'Quest/Regular/Tamily/Political/Political15',
  condition: [
    ['Building/Residential/Political', 15],
  ],
  title: 'Построить Политический Центр 15-го уровня',
  text: '<p>Интересные перестановки происходят в Политическом Центре, правитель. Недавно ваши чиновники разделились на две неравные группы – одна из них «заседает» на подходах к столовой, а вторую постоянно выгоняют к туалетам.</p><p>Подозреваю, что хорошие места достаются тем, кто оказывает разные мелкие услуги Механику, но доказать это пока не удалось. Да, и ещё забавное – так как столовая находится на пригорке, везунчики окрестили себя Верхней Палатой, в то время как все остальные…</p>',
  options: {
    accept: {
      text: '…прокладывают себе путь наверх из глубин канализации?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 25,
    crystals: 25,
  },
};
