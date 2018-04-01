export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial18',
  condition: [
    ['Building/Military/Laboratory', 25],
  ],
  slides: 6,
  helpers: [
    {
      url: '/game/planet/Military/Laboratory',
      condition: {
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
        level: 25,
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
        level: 25,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 25,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Laboratory',
      condition: {
        id: 'Building/Military/Laboratory',
        level: 25,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },
    {
      url: '/game/planet/Military',
      condition: {
        id: 'Building/Military/Laboratory',
        level: 25,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Laboratory"]',
      direction: 'top',
    },
    {
      url: '/game/planet',
      target: 'header .menu .second_menu li.Military-icon',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .menu .main_menu li.planet',
      direction: 'bottom',
    },
  ],
  title: 'Построить Лабораторию 25-го уровня',
  text: '<p>Чем выше уровень вашей лаборатории, тем более крутые исследования вам доступны. Предлагаю улучить лабораторию до 25-го уровня. Как вы уже знаете, ускорение бесплатно только до 20-го уровня, но Совет выдал вам немного кредитов на ускорение. Пишите сразу 25-й уровень и ускоряйте, должно сработать…</p>',
  options: {
    accept: {
      text: 'Хорошо, я уже понял вашу странную систему.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2000,
    crystals: 500,
    credits: 100,
  },
};
