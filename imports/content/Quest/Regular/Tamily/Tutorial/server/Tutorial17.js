export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial17',
  condition: [
    ['Building/Military/Laboratory', 15],
    ['Research/Evolution/Science', 15],
  ],
  slides: 2,

  helpers: [
    {
      url: '/game/planet/Military/Laboratory',
      condition: {
        id: 'Building/Military/Laboratory',
        level: 15,
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Military/Laboratory',
      condition: {
        id: 'Building/Military/Laboratory',
        level: 15,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Laboratory',
      condition: {
        id: 'Building/Military/Laboratory',
        level: 15,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 15,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Laboratory',
      condition: {
        id: 'Building/Military/Laboratory',
        level: 15,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },


    {
      url: '/game/research/Evolution/Science',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/research/Evolution/Science',
      condition: {
        id: 'Research/Evolution/Science',
        level: 15,
        target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Science',
      condition: {
        id: 'Research/Evolution/Science',
        level: 15,
        target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
        value: 15,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Science',
      condition: {
        id: 'Research/Evolution/Science',
        level: 15,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Military',
      condition: {
        id: 'Building/Military/Laboratory',
        level: 15,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Laboratory"]',
      direction: 'top',
    },
    {
      url: '/game/research/Evolution',
      condition: {
        id: 'Research/Evolution/Science',
        level: 15,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Science"]',
      direction: 'top',
    },
    {
      url: '/game/planet',
      condition: {
        id: 'Building/Military/Laboratory',
        level: 15,
      },
      target: 'header .menu .second_menu li.Military-icon',
      direction: 'bottom',
    },

    {
      url: '/game/research/Fleet',
      condition: {
        id: 'Research/Evolution/Science',
        level: 15,
      },
      target: 'header .menu .second_menu li.Evolution-icon',
      direction: 'bottom',
    },
    {
      url: '',
      condition: {
        id: 'Building/Military/Laboratory',
        level: 15,
      },
      target: 'header .menu .main_menu li.planet',
      direction: 'bottom',
    },
    {
      url: '',
      condition: {
        id: 'Research/Evolution/Science',
        level: 15,
      },
      target: 'header .menu .main_menu li.research',
      direction: 'bottom',
    },
  ],

  title: 'Построить Лабораторию 15-го уровня, исследовать Научный Отдел 15-го уровня',
  text: '<p>Важно следить за требованиями зданий и исследований, они меняются с уровнем. Например, вам нужна Лаборатория 15-го уровня, чтобы исследовать Научный отдел, а Научный отдел нужен будет для Лаборатории в будущем. Давайте улучшим Лабораторию до 15-го уровня, а затем и Научный отдел в исследованиях до 15-го уровня.</p>',
  options: {
    accept: {
      text: 'Важно смотреть на необходимые технологии, понял.',
      mood: 'positive',
    },
  },
  reward: {
    credits: 100,
  },
};
