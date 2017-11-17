export default {
  id: 'Quest/Regular/Tamily/Spaceport/Spaceport20',
  condition: [
    ['Building/Residential/Spaceport', 20],
  ],
  title: 'Построить Космопорт 20-го уровня',
  text: '<p>Ваш Космический порт становится популярным, правитель. Не далее как вчера там приземлился неопознанный корабль, и медики вытащили оттуда раненного человека, одетого в заклеенный скотчем скафандр. Когда тот пришёл в себя, то в благодарность засеял, кажется, картофелем всю резервную посадочную площадку.</p><p>Мы, пожалуй, подержим его в лазарете, пока инженеры будут уничтожать потенциальную биологическую угрозу. Они уже собрали установку и по вашему приказу готовы начать.</p>',
  options: {
    accept: {
      text: 'Эх, ну чем вам картошечка-то помешала?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2,
    crystals: 3,
  },
};