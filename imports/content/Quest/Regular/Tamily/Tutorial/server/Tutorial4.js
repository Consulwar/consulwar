export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial4',
  condition: [
    ['Building/Military/Laboratory', 10],
  ],
  slides: 3,
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
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--button_type_primary_green:not([disabled])',
        exists: true,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Laboratory',
      condition: {
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 10,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/Laboratory',
      target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },
    {
      url: '/game/planet/Military',
      target: '.cw--Menu.cw--MenuUnique > div > a:nth-child(2)',
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
  title: 'Построить Лабораторию 10-го уровня',
  text: '<p>Теперь у вас есть Электростанция и можно переходить к Лаборатории, она нужна для различных важных исследований, о которых я расскажу вам позже. Давайте не мелочиться – постройте Лабораторию сразу 10 уровня. Чтобы не ждать, вы можете бесплатно (до 20 уровня) ускорять строительство любого здания. Для этого достаточно нажать кнопку «Ускорить».</p>',
  options: {
    accept: {
      text: 'Ускорять строительство, после того, как его начал. Запомню.',
      mood: 'positive',
    },
  },
  reward: {
    crystals: 1000,
  },
};
