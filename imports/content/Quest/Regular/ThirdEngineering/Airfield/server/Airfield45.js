export default {
  id: 'Quest/Regular/ThirdEngineering/Airfield/Airfield45',
  condition: [
    ['Building/Military/Airfield', 45],
  ],
  title: 'Построить Аэродром 45-го уровня',
  text: '<p>Иногда авиазавод выпускает экспериментальные модели самолётов, Консул, чтобы протестировать свои новейшие наработки. Вот и сейчас они доводят до ума новую систему речевого управления, чтобы пилот не отвлекался лишний раз во время ведения боевых действий.</p><p>Говорят, они добились значительных подвижек в этой области, однако в такого рода технологиях всегда есть, что доработать. Словарный запас, например, потому что некоторые замечания автоматика понимает буквально.</p>',
  options: {
    accept: {
      text: 'Да? И куда она идёт, если не секрет?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 600,
    crystals: 600,
  },
};
