export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial26',
  condition: [
    ['Unit/Human/Defense/LaserTurret', 25],
  ],
  slides: 3,
  helpers: [
    {
      url: '/game/army/Defense/LaserTurret',
      condition: {
        target: '.cw--BuildUnit .cw--BuildUnit__actionAmountCount',
        value: 25,
        exists: true,
      },
      target: '.cw--BuildUnit .cw--BuildUnit__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/army/Defense/LaserTurret',
      target: '.cw--BuildUnit .cw--BuildUnit__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/army/Defense',
      target: '.cw--Menu.cw--MenuUnits .cw--Menu__item[href*="LaserTurret"]',
      direction: 'top',
    },

    {
      url: '/game/army/Ground',
      target: 'header .menu .second_menu li.Defense-icon',
      direction: 'bottom',
    },
    {
      url: '/game/army/Space',
      target: 'header .menu .second_menu li.Defense-icon',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .menu .main_menu li.army:not(.active)',
      direction: 'bottom',
    },
  ],
  title: 'Построить 25 оборонных орудий «Лазерная Турель»',
  text: '<p>Как вы уже догадались, в нашей вселенной в ходу специальная валюта – ГГК (Грязные Галактические Кредиты). Их можно купить за валюту вашей вселенной, она очень ценится в нашем мире. Совет Галактики выдал вам еще 150 ГГК. Купите на них 25 Лазерных турелей для обороны планеты. И не забывайте развивать здания и исследования и воевать с рептилиями!</p>',
  options: {
    accept: {
      text: 'Зелёный ресурс – это донат-валюта. Окей.',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Space/Gammadrone': 10,
    'Unit/Human/Space/Wasp': 25,
    'Unit/Human/Space/Mirage': 10,
    'Unit/Human/Space/Frigate': 1,
  },
};
