export default {
  id: 'Quest/Regular/Tamily/BlackMarket/BlackMarket30',
  condition: [
    ['Building/Residential/BlackMarket', 30],
  ],
  title: 'Построить Черный Рынок 30-го уровня',
  text: '<p>Пираты с окраины космоса хотят продать очень редкий артефакт, правитель. Правда, они сами не помнят, у кого его украли и что тот делает.</p><p>Последнее, что сохранилось в их памяти — яркая красная вспышка… А потом они оказались около нашей планеты. Учёные очень хотят получить этот предмет, хотя выглядит он как простой серебристый цилиндр.</p>',
  options: {
    accept: {
      text: 'Тамили, а принеси мне чёрные очки, пожалуйста…',
      mood: 'positive',
    },
  },
  reward: {
    metals: 400,
    crystals: 400,
  },
};
