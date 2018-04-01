export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial7',
  condition: [
    ['Statistic/cosmos.fleets.sent', 1],
  ],
  slides: 4,
  helpers: [
    {
      url: '/game/cosmos',
      condition: {
        target: '.map-planet-popup .button-attack',
        exists: true,
      },
      target: '.map-planet-popup .button-attack',
      direction: 'left',
    },

    {
      url: '/game/cosmos',
      condition: {
        target: '.attack-menu .items.fleet .unit[data-id*="Wasp"] .count input',
        exists: true,
        value: 1,
      },
      target: '.attack-menu .btn-attack.return',
      direction: 'top',
    },
    {
      url: '/game/cosmos',
      condition: {
        target: '.attack-menu .items.fleet .unit[data-id*="Wasp"]',
        exists: true,
      },
      target: '.attack-menu .items.fleet .unit[data-id*="Wasp"] .count input',
      direction: 'bottom',
    },


    {
      url: '',
      target: 'header .menu li.galaxy:not(.active)',
      direction: 'bottom',
    },
  ],
  title: 'Отправить любой флот в атаку на любого противника в космосе',
  text: '<p>Ваша колония растёт, это радует. Но растущая мощь вашей планеты привлекла внимание рептилий. Ваш могущественный союзник – Совет Галактики отправил вам небольшой флот, чтобы уничтожить разведку неприятеля. Выберите вкладку «Космос», выделите флот противника, кликните на свои корабли (или нажмите кнопку «Выбрать всех») и отдайте приказ на уничтожение.</p>',
  options: {
    accept: {
      text: 'Сейчас я с ними разберусь, никуда не уходи.',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Space/Gammadrone': 10,
  },
};
