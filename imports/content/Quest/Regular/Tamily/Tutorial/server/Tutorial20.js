export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial20',
  condition: [
    ['Unit/Human/Space/Frigate', 1],
  ],
  slides: 3,
  helpers: [

    {
      url: '/game/planet/Residential/Alliance',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Residential/Alliance',
      condition: {
        id: 'Building/Residential/Alliance',
        level: 1,
        target: '.cw--BuildBuilding .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/Alliance',
      condition: {
        id: 'Building/Residential/Alliance',
        level: 1,
      },
      target: '.cw--BuildBuilding .cw--button_type_primary_orange',
      direction: 'left',
    },


    {
      url: '/game/planet/Military/Shipyard',
      condition: {
        target: '.cw--BuildBuilding .cw--Requirements__item[href*="Alliance"] .cw--Requirements__currentLevel_need',
        exists: true,
      },
      target: '.cw--BuildBuilding .cw--Requirements__item[href*="Alliance"]',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Shipyard',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Military/Shipyard',
      condition: {
        id: 'Building/Military/Shipyard',
        level: 1,
        target: '.cw--BuildBuilding .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Shipyard',
      condition: {
        id: 'Building/Military/Shipyard',
        level: 1,
      },
      target: '.cw--BuildBuilding .cw--button_type_primary_orange',
      direction: 'left',
    },

    {
      url: '/game/army/Space/Frigate',
      condition: {
        target: '.cw--BuildUnit .cw--Requirements__item[href*="Shipyard"] .cw--Requirements__currentLevel_need',
        exists: true,
      },
      target: '.cw--BuildUnit .cw--Requirements__item[href*="Shipyard"]',
      direction: 'left',
    },

    {
      url: '/game/army/Space/Frigate',
      condition: {
        target: '.cw--BuildUnit .cw--BuildUnit__actionAmountCount',
        value: 1,
      },
      target: '.cw--BuildUnit .cw--BuildUnit__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/army/Space/Frigate',
      target: '.cw--BuildUnit .cw--BuildUnit__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/army/Space',
      target: '.cw--Menu.cw--MenuUnits .cw--Menu__item[href*="Frigate"]',
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
      target: 'header .menu .main_menu li.army:not(.active)',
      direction: 'bottom',
    },
  ],
  title: 'Построить один космический корабль «Фрегат»',
  text: '<p>Возле вашей планеты могут пролетать караваны и другие флоты рептилоидов, и можно неплохо заработать на их уничтожении… Ой, то есть разбить врага во имя человечества! Но для этого вам нужен флот. Фрегат! Вот что нужно. А для него нужна Верфь 1-го уровня, а для Верфи – Система Связи 1-го уровня. В общем, вы сами разберётесь. Постройте 1 Фрегат, Консул.</p>',
  options: {
    accept: {
      text: 'Главное – смотреть на необходимые технология, я помню.',
      mood: 'positive',
    },
  },
  reward: {
    honor: 1000,
    credits: 200,
  },
};
