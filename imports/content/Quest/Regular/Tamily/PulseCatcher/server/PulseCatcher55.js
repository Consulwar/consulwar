export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher55',
  condition: [
    ['Building/Residential/PulseCatcher', 55],
  ],
  title: 'Построить Импульсный Уловитель 55-го уровня',
  text: '<p>Иногда, хотя и очень редко, на нашу планету прилетают совершенно уникальные частицы. Я слышала, как белые халаты говорили, что энергия таких частиц в сто миллионов раз больше, чем энергия в наших ускорителях. И пока что учёные не могут понять, откуда именно прилетают такие «подарки».</p><p>Ясно только, что расстояния они преодолевают огромные. В этом и состоит парадокс – как им удаётся при пролёте нескольких галактик сохранить такую большую энергию? Ответ обещает дать новая обсерватория Уловителя.</p>',
  options: {
    accept: {
      text: 'А у них там ничего не треснет? И где моя уникальная импульсная энергия?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 60,
    crystals: 60,
  },
};