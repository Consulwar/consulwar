export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial9',
  condition: [
    ['Statistic/units.build.Unit/Human/Space/Wasp', 2],
  ],
  slides: 2,
  helpers: [
    {
      url: '/game/army/Space/Wasp',
      condition: {
        target: '.cw--BuildUnit .cw--BuildUnit__actionAmountCount',
        value: 2,
        exists: true,
      },
      target: '.cw--BuildUnit .cw--BuildUnit__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/army/Space/Wasp',
      target: '.cw--BuildUnit .cw--BuildUnit__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/army/Space',
      target: '.cw--Menu.cw--MenuUnits .cw--Menu__item[href*="Wasp"]',
      direction: 'top',
    },

    {
      url: '/game/army/Ground',
      target: 'header .menu .second_menu li.Space-icon',
      direction: 'bottom',
    },
    {
      url: '/game/army/Defense',
      target: 'header .menu .second_menu li.Space-icon',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .menu .main_menu li.army',
      direction: 'bottom',
    },
  ],
  title: 'Построить 2 космических корабля «Оса»',
  text: '<p>Прекрасно, прекрасно! Теперь вы можете строить Ос – это боевой космический юнит. Они находятся во вкладке «Войска». Предлагаю построить сразу 2 штуки, жаль только, ускорить в этот раз не получится. Так что не стройте сразу больше 2, чтобы долго не ждать.</p>',
  options: {
    accept: {
      text: 'Все начинают с малого.',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Defense/Mine': 100,
  },
};
