export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial10',
  condition: [
    ['Building/Military/PowerStation', 20],
  ],
  slides: 4,
  helpers: [
    {
      url: '/game/planet/Military/PowerStation',
      condition: {
        id: 'Building/Military/PowerStation',
        level: 20,
        target: '.BuildSpeedUp__button',
        exists: true,
      },
      target: '.BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Military/PowerStation',
      condition: {
        id: 'Building/Military/PowerStation',
        level: 20,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/PowerStation',
      condition: {
        id: 'Building/Military/PowerStation',
        level: 20,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 20,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/PowerStation',
      condition: {
        id: 'Building/Military/PowerStation',
        level: 20,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Military',
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="PowerStation"]',
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
  title: 'Построить Электростанцию 20-го уровня',
  text: '<p>Вы отлично справляетесь, правитель! Не будем сбавлять темп: нужно улучшить Электростанцию до 20-го уровня. Помните, что до 20-го уровня можно ускорять строительство бесплатно. Пользуйтесь этим.</p>',
  options: {
    accept: {
      text: 'Хорошо, буду помнить. Какая ты все-таки доставучая…',
      mood: 'positive',
    },
  },
  reward: {
    'Resource/Artifact/White/MeteorFragments': 10,
    'Resource/Artifact/White/CrystalFragments': 10,
  },
};
