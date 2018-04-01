export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial5',
  condition: [
    ['Research/Evolution/Drill', 10],
    ['Research/Evolution/Crystallization', 10],
  ],
  slides: 3,
  helpers: [
    {
      url: '/game/research/Evolution/Drill',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/research/Evolution/Drill',
      condition: {
        id: 'Research/Evolution/Drill',
        level: 10,
        target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Drill',
      condition: {
        id: 'Research/Evolution/Drill',
        level: 10,
        target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
        value: 10,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Drill',
      condition: {
        id: 'Research/Evolution/Drill',
        level: 10,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/research/Evolution/Crystallization',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/research/Evolution/Crystallization',
      condition: {
        id: 'Research/Evolution/Crystallization',
        level: 10,
        target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Crystallization',
      condition: {
        id: 'Research/Evolution/Crystallization',
        level: 10,
        target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
        value: 10,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Crystallization',
      condition: {
        id: 'Research/Evolution/Crystallization',
        level: 10,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/research/Evolution',
      condition: {
        id: 'Research/Evolution/Drill',
        level: 10,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Drill"]',
      direction: 'top',
    },

    {
      url: '/game/research/Evolution',
      condition: {
        id: 'Research/Evolution/Crystallization',
        level: 10,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Crystallization"]',
      direction: 'top',
    },
    {
      url: '/game/research/Fleet',
      target: 'header .menu .second_menu li.Evolution-icon',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .main_menu li.research',
      direction: 'bottom',
    },
  ],
  title: 'Исследовать Бурильный Бур 10-го уровня, Кристаллизацию 10-го уровня',
  text: '<p>Теперь, когда у вас есть Лаборатория, вы можете начать изучать различные научные направления. Начнем с тех, которые напрямую связаны с добычей ресурсов – это Бурильный Бур и Кристаллизация. Доведём их уровни до 10-го. Помните об ускорении, Консул. И ещё – исследования находятся в отдельной вкладке.</p>',
  options: {
    accept: {
      text: 'Другая вкладка, исследования. Какая лёгкая игра.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 500,
    crystals: 500,
  },
};
