export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial19',
  condition: [
    ['Unit/Human/Defense/Turret', 25],
  ],
  slides: 4,
  helpers: [
    {
      url: '/game/army/Defense/Turret',
      condition: {
        target: '.cw--BuildUnit .cw--BuildUnit__actionAmountCount',
        value: 25,
        exists: true,
      },
      target: '.cw--BuildUnit .cw--BuildUnit__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/army/Defense/Turret',
      target: '.cw--BuildUnit .cw--BuildUnit__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/army/Defense',
      target: '.cw--Menu.cw--MenuUnits .cw--Menu__item[href*="Turret"]',
      direction: 'top',
    },

    {
      url: '/game/army/Ground',
      target: 'header .menu .second_menu li.Defense-icon',
      direction: 'bottom',
    },
    {
      url: '/game/army/Space',
      target: 'header .menu .second_menu li.Defense-icon',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .menu .main_menu li.army:not(.active)',
      direction: 'bottom',
    },
  ],
  title: 'Построить 25 оборонных орудий «Турель»',
  text: '<p>Вы, наверное, уже обратили внимание, что помимо космических и наземных юнитов есть ещё планетарная оборона. Это мощные турели и мины, которые помогут вам обороняться от тех отрядов, что летят прямо на вашу планету. Да, будут и такие. Сейчас вам доступны только Турели, и я думаю, что стоит построить хотя бы 25 штук.</p>',
  options: {
    accept: {
      text: '25 штук турелей. Как-то маловато, но ладно…',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Space/Mirage': 10,
    metals: 3500,
    crystals: 1000,
    credits: 300,
  },
};
