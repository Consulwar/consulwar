export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial3',
  condition: [
    ['Building/Military/PowerStation', 5],
  ],
  slides: 3,
  helpers: [
    {
      url: '/game/planet/Military/PowerStation',
      condition: {
        target: '.BuildSpeedUp__button',
        exists: true,
      },
      target: '.BuildSpeedUp__button',
      direction: 'bottom',
    },
    {
      url: '/game/planet/Military/PowerStation',
      condition: {
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--button_type_primary_green',
        exists: true,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_green',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/PowerStation',
      condition: {
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 5,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/PowerStation',
      target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },
    {
      url: '/game/planet/Military',
      target: '.cw--Menu.cw--MenuUnique > div > a:nth-child(1)',
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
  title: 'Построить Электростанцию 5-го уровня',
  text: '<p>Прекрасно, пришло время двигаться дальше. Кроме Жилого района, на планете есть ещё и Военный район. Там будут находиться технические здания. Выберите Военный район, затем Электростанцию, впишите сразу 5-й уровень в поле с будущим уровнем здания и нажмите кнопку «Улучшить».</p>',
  options: {
    accept: {
      text: 'Электростанцию 5-го уровня, понял.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 1000,
  },
};
