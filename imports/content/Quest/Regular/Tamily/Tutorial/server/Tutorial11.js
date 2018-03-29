export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial11',
  condition: [
    ['Building/Residential/House', 20],
    ['Building/Residential/Metal', 20],
    ['Building/Residential/Crystal', 20],
  ],
  slides: 2,
  helpers: [

    {
      url: '/game/planet/Residential/House',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Residential/House',
      condition: {
        id: 'Building/Residential/House',
        level: 20,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/House',
      condition: {
        id: 'Building/Residential/House',
        level: 20,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 20,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/House',
      condition: {
        id: 'Building/Residential/House',
        level: 20,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Residential/Metal',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Residential/Metal',
      condition: {
        id: 'Building/Residential/Metal',
        level: 20,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/Metal',
      condition: {
        id: 'Building/Residential/Metal',
        level: 20,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 20,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/Metal',
      condition: {
        id: 'Building/Residential/Metal',
        level: 20,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Residential/Crystal',
      condition: {
        target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
        exists: true,
      },
      target: '.cw--BuildSpeedUp__actions .cw--BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Residential/Crystal',
      condition: {
        id: 'Building/Residential/Crystal',
        level: 20,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/Crystal',
      condition: {
        id: 'Building/Residential/Crystal',
        level: 20,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 20,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/Crystal',
      condition: {
        id: 'Building/Residential/Crystal',
        level: 20,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Residential',
      condition: {
        id: 'Building/Residential/Crystal',
        level: 20,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Crystal"]',
      direction: 'top',
    },
    {
      url: '/game/planet/Residential',
      condition: {
        id: 'Building/Residential/Metal',
        level: 20,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Metal"]',
      direction: 'top',
    },
    {
      url: '/game/planet/Residential',
      condition: {
        id: 'Building/Residential/House',
        level: 20,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="House"]',
      direction: 'top',
    },

    {
      url: '/game/planet/Military',
      target: 'header .menu .second_menu li.Residential-icon',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .main_menu li.planet',
      direction: 'bottom',
    },
  ],
  title: 'Построить Жилой Комплекс 20-го уровня, Шахту Металла 20-го уровня, Шахту Кристалла 20-го уровня',
  text: '<p>Каждые 20 уровней требования тех зданий и исследований, что вы уже построили, меняются на более дорогие. Поэтому придётся развивать всю колонию равномерно, а также доставать в космосе новые ресурсы. Кстати о ресурсах. Надо бы улучшить Жилой комплекс, Шахту металла и Шахту кристалла до 20-го уровня.</p>',
  options: {
    accept: {
      text: 'Что, и даже не скажешь про бесплатное ускорение?',
      mood: 'positive',
    },
  },
  reward: {
    'Resource/Artifact/Green/RotaryAmplifier': 10,
    'Resource/Artifact/Green/SecretTechnology': 10,
  },
};
