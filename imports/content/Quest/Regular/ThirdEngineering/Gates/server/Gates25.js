export default {
  id: 'Quest/Regular/ThirdEngineering/Gates/Gates25',
  condition: [
    ['Building/Military/Gates', 25],
  ],
  title: 'Построить Врата 25-го уровня',
  text: '<p>Произошло что-то очень странное, Командир: только мы установили стабильную связь с симпатичной низкоразвитой планетой, и к порталу начали опасливо приближаться местные аборигены, как внезапно откуда-то выскочил какой-то человек, направил на нас какой-то прибор и наш портал тут же закрылся!</p><p>Только и осталось, что карточка, которую он бросил – «нарушение директивы один» или что-то в этом духе. Что это за Федерация такая вообще?!</p>',
  options: {
    accept: {
      text: 'О, это такие смешные ребята… Но вы туда больше Врата не открывайте.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 350,
    crystals: 350,
  },
};
