export default {
  id: 'Quest/Regular/NatalyVerlen/Nanotechnology/Nanotechnology90',
  condition: [
    ['Research/Evolution/Nanotechnology', 90],
  ],
  title: 'Исследовать Нанотехнологии 90-го уровня',
  text: '<p>Поскольку Станция Обороны представляет из себя неприступную крепость, вооружённую по последнему слову техники, в ней, казалось бы, совершенно нечего улучшать.</p><p>Однако наши учёные нашли несколько лазеек для того, чтобы наиболее эффективно потратить бюджет отдела: создан мощнейший искусственный интеллект на базе уже обученной нейронной сети, который будет управлять всей этой громадиной, развлекать экипаж и периодически отчитываться перед военными.</p>',
  options: {
    accept: {
      text: 'А назовёте вы его, конечно же, Хэлом.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 9130,
    crystals: 3860,
  },
};
