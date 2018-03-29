export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial8',
  condition: [
    ['Building/Residential/SpacePort', 10],
  ],
  slides: 1,
  helpers: [

    {
      url: '/game/planet/Residential/SpacePort',
      condition: {
        id: 'Building/Residential/SpacePort',
        level: 10,
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Residential/SpacePort',
      condition: {
        id: 'Building/Residential/SpacePort',
        level: 10,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/SpacePort',
      condition: {
        id: 'Building/Residential/SpacePort',
        level: 10,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 10,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/SpacePort',
      condition: {
        id: 'Building/Residential/SpacePort',
        level: 10,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Residential',
      condition: {
        id: 'Building/Residential/SpacePort',
        level: 10,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="SpacePort"]',
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
  title: 'Построить Космопорт 10-го уровня',
  text: '<p>Ваш флот полетел в атаку, но вам нужно больше кораблей для защиты и нападения. Нам… Вам, Правитель. Вам нужен Космопорт. Постройте космопорт 10-го уровня.</p>',
  options: {
    accept: {
      text: 'Наконец-то мы пришли к чему-то интересному.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 500,
    crystals: 500,
    humans: 500,
    credits: 100,
  },
};
