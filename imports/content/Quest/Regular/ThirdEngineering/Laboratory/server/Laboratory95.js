export default {
  id: 'Quest/Regular/ThirdEngineering/Laboratory/Laboratory95',
  condition: [
    ['Building/Military/Laboratory', 95],
  ],
  title: 'Построить Лабораторию 95-го уровня',
  text: '<p>Вчера в Лабораторию пришёл какой-то тип и притащил толстенный талмуд под названием «Кристальный Органон». Утверждал, что нужно разводить жидкий кристалл мильон мильонов раз, пока там не останется ни одной молекулы вещества, а только память воды. И, мол, этот раствор лечит все болезни.</p><p>В общем, Натали ему сразу пообещала этот самый органон вырезать по самые гланды, если будет её и дальше отвлекать. Сурова! Это я всё к чему? Чем быстрее развивается наука, тем меньше у нас таких вот типов.</p>',
  options: {
    accept: {
      text: 'Ладно, убедил, дам вам ещё немного на науку.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 8000,
    crystals: 8000,
  },
};
