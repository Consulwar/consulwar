export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial12',
  condition: [
    ['Research/Evolution/Drill', 20],
    ['Research/Evolution/Crystallization', 20],
    ['Research/Evolution/Energy', 20],
  ],
  slides: 2,

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
        level: 20,
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
        level: 20,
        target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
        value: 20,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Drill',
      condition: {
        id: 'Research/Evolution/Drill',
        level: 20,
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
        level: 20,
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
        level: 20,
        target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
        value: 20,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Crystallization',
      condition: {
        id: 'Research/Evolution/Crystallization',
        level: 20,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/research/Evolution/Energy',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/research/Evolution/Energy',
      condition: {
        id: 'Research/Evolution/Energy',
        level: 20,
        target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Energy',
      condition: {
        id: 'Research/Evolution/Energy',
        level: 20,
        target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
        value: 20,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Energy',
      condition: {
        id: 'Research/Evolution/Energy',
        level: 20,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/research/Evolution',
      condition: {
        id: 'Research/Evolution/Drill',
        level: 20,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Drill"]',
      direction: 'top',
    },
    {
      url: '/game/research/Evolution',
      condition: {
        id: 'Research/Evolution/Energy',
        level: 20,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Energy"]',
      direction: 'top',
    },
    {
      url: '/game/research/Evolution',
      condition: {
        id: 'Research/Evolution/Crystallization',
        level: 20,
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

  title: 'Исследовать Бурильный Бур 20-го уровня, Кристаллизацию 20-го уровня, Энергетику 20-го уровня',
  text: '<p>Добавим еще одно исследование к тем, что уже есть – Энергетику. И добьем развитие Бурильного Бура и Кристаллизации до 20-уровня. И Энергетику вместе с ними.</p>',
  options: {
    accept: {
      text: 'Я назову эту игру «Докачайся до 20-го уровня, детка».',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Space/Wasp': 10,
  },
};
