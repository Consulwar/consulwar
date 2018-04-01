export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial14',
  condition: [
    ['Building/Military/PowerStation', 21], // награда дается почти сразу, чтобы игрок пощупал наземку, пока строится станция
  ],
  slides: 3,
  helpers: [
    {
      url: '/game/planet/Military/PowerStation',
      condition: {
        id: 'Building/Military/PowerStation',
        level: 25,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--button_type_primary_green',
        exists: true,
      },
      target: null,
      direction: 'left',
    },
    {
      url: '/game/planet/Military/PowerStation',
      condition: {
        id: 'Building/Military/PowerStation',
        level: 25,
        target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 25,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Military/PowerStation',
      condition: {
        id: 'Building/Military/PowerStation',
        level: 25,
      },
      target: '.content.building.planet.Military .cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Military',
      condition: {
        id: 'Building/Military/PowerStation',
        level: 25,
      },
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
  title: 'Построить Электростанцию 25-го уровня',
  text: '<p>Вы заметили, Консул, что ваши здания и исследования после 20-го уровня начинают требовать для развития новый ресурс – Честь? Его можно получить, либо воюя в космосе против рептилоидов, либо отправляя специальные войска на Землю. Но сначала давайте построим Электростанцию 25-го уровня. Помните, что ускорение больше не работает бесплатно.</p>',
  options: {
    accept: {
      text: 'Новый ресурс – это интересно. А вот донат – это отстой. Запомни это, девочка, и создателям своим передай!',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Ground/Infantry/Father': 25,
  },
};
