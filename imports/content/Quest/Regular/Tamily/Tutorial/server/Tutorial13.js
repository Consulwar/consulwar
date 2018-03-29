export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial13',
  condition: [
    ['Statistic/cosmos.fleets.sent', 2],
  ],
  slides: 2,
  helpers: [
    {
      url: '/game/cosmos',
      condition: {
        target: '.attack-menu .items.fleet .unit[data-id*="Wasp"] .count input',
        exists: true,
        value: 1,
      },
      target: '.attack-menu .target .btn-attack.return',
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
      url: '/game/cosmos',
      condition: {
        target: '.map-planet-popup .button-attack',
        exists: true,
      },
      target: '.map-planet-popup .button-attack',
      direction: 'left',
    },
    {
      url: '',
      target: 'header .menu li.galaxy:not(.active)',
      direction: 'bottom',
    },
  ],
  title: 'Исследовать любую планету в космосе',
  text: '<p>Пока развивается ваша колония, Консул, не забывайте осуществлять контроль космического пространства возле своей колонии. Эта мудреная фраза означает, что вам надо бы открыть карту соседних планет. Отправьте небольшой флот на разведку на самую дальнюю свободную планету (на карте она отображается как белый кружок).</p>',
  options: {
    accept: {
      text: 'А есть еще планеты? Вечер неожиданно перестал быть томным!',
      mood: 'positive',
    },
  },
  reward: {
    honor: 500,
    credits: 100,
  },
};
