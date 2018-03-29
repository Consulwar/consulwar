export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial1',
  condition: [
    ['Building/Residential/House', 1],
  ],
  slides: 7,
  helpers: [
    {
      url: '/game/planet/Residential/House',
      target: '.content.building.planet.Residential .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential',
      target: '.cw--Menu.cw--MenuUnique > div > a:nth-child(1)',
      direction: 'top',
    },
    {
      url: '/game/planet',
      target: 'header .menu .second_menu li.Residential-icon',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .menu .main_menu li.planet',
      direction: 'bottom',
    },
  ],
  title: 'Построить Жилой Комплекс 1-го уровня',
  text: '<p>Перейдём к делу. Рептилоиды терроризируют галактику, беженцы ищут планеты для жизни. Люди – это важный ресурс, Консул. Чтобы им было где жить, постройте на планете Жилой Комплекс. </p>',
  options: {
    accept: {
      text: 'Прекрасно, приступим.',
      mood: 'positive',
    },
  },
  reward: {
    humans: 500,
  },
};
