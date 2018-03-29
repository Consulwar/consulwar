export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial6',
  condition: [
    ['Building/Residential/House', 10],
    ['Building/Residential/Metal', 10],
    ['Building/Residential/Crystal', 10],
  ],
  slides: 5,
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
        level: 10,
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
        level: 10,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 10,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/House',
      condition: {
        id: 'Building/Residential/House',
        level: 10,
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
        level: 10,
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
        level: 10,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 10,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/Metal',
      condition: {
        id: 'Building/Residential/Metal',
        level: 10,
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
        level: 10,
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
        level: 10,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 10,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/Crystal',
      condition: {
        id: 'Building/Residential/Crystal',
        level: 10,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Residential',
      condition: {
        id: 'Building/Residential/Crystal',
        level: 10,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Crystal"]',
      direction: 'top',
    },
    {
      url: '/game/planet/Residential',
      condition: {
        id: 'Building/Residential/Metal',
        level: 10,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Metal"]',
      direction: 'top',
    },
    {
      url: '/game/planet/Residential',
      condition: {
        id: 'Building/Residential/House',
        level: 10,
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
  title: 'Построить Жилой Комплекс 10-го уровня, Шахту Металла 10-го уровня, Шахту Кристалла 10-го уровня',
  text: '<p>Отличная работа, правитель! Теперь вам доступны ещё два основных ресурса, это Металл и Кристалл. Они используются при строительстве и исследованиях, а еще… но не будем забегать вперед. И надо бы улучшить Жилой комплекс, Консул, вам нужно больше людей. Улучшите жилой комплекс до 10 уровня, постройте Шахту металла и Шахту Кристалла 10 уровня каждую.</p>',
  options: {
    accept: {
      text: 'Ресурсы – это хорошо. Лучше только бесплатная ускорялка.',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Space/Wasp': 25,
  },
};
