export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial16',
  condition: [
    ['Building/Military/Barracks', 20],
    ['Building/Military/Factory', 20],
    ['Building/Military/Airfield', 20],
  ],
  slides: 3,
  helpers: [
    {
      url: '/game/planet/Military/Airfield',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Military/Airfield',
      condition: {
        id: 'Building/Military/Airfield',
        level: 20,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Airfield',
      condition: {
        id: 'Building/Military/Airfield',
        level: 20,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 20,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Airfield',
      condition: {
        id: 'Building/Military/Airfield',
        level: 20,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Military/Factory',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Military/Factory',
      condition: {
        id: 'Building/Military/Factory',
        level: 20,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Factory',
      condition: {
        id: 'Building/Military/Factory',
        level: 20,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 20,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Factory',
      condition: {
        id: 'Building/Military/Factory',
        level: 20,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Military/Barracks',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Military/Barracks',
      condition: {
        id: 'Building/Military/Barracks',
        level: 20,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Barracks',
      condition: {
        id: 'Building/Military/Barracks',
        level: 20,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 20,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Barracks',
      condition: {
        id: 'Building/Military/Barracks',
        level: 20,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },


    {
      url: '/game/planet/Military',
      condition: {
        id: 'Building/Military/Barracks',
        level: 20,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Barracks"]',
      direction: 'top',
    },
    {
      url: '/game/planet/Military',
      condition: {
        id: 'Building/Military/Factory',
        level: 20,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Factory"]',
      direction: 'top',
    },
    {
      url: '/game/planet/Military',
      condition: {
        id: 'Building/Military/Airfield',
        level: 20,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Airfield"]',
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
  title: 'Построить Казармы 20-го уровня, Военный завод 20-го уровня, Военный аэродром 20-го уровня',
  text: '<p>Больше всего Чести можно заработать в космических боях, но быстрее всего – отправляя войска на Землю. Хм... Казармы, Военный завод и Военный аэродром – 20-го уровня каждый. Это сильно поможет в подготовке новобранцев и техники.</p>',
  options: {
    accept: {
      text: 'Эй, не командуй! Надеюсь, эти ваши «наземные войска» будут полезны…',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Ground/Enginery/Agmogedcar': 5,
  },
};
