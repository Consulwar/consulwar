import Game from '/moduls/game/lib/main.game';

export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial25',
  condition: [
    function() {
      const colonies = Game.Planets.getColonies();
      return colonies && colonies.length >= 3;
    },
  ],
  slides: 3,
  helpers: [
    {
      url: '/game/cosmos',
      condition: {
        target: '.attack-menu .target .btn-attack.defend',
        exists: true,
      },
      target: '.attack-menu .target .btn-attack.defend',
      direction: 'top',
    },
    {
      url: '/game/cosmos',
      condition: {
        target: '.map-planet-popup .cw--button_type_primary_blue',
        exists: true,
      },
      target: '.map-planet-popup .cw--button_type_primary_blue',
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
  title: 'Захватить и удерживать любые 2 планеты',
  text: '<p>Планеты в космосе можно захватывать для добычи Артефактов, а затем можно их освобождать, чтобы захватывать более богатые небесные тела. На начальном этапе развития вам доступны 2 дополнительные планеты для контроля. Захватите любые 2 планеты, Консул, чтобы добывать больше Артефактов. Это можно сделать даже 1 кораблём…</p>',
  options: {
    accept: {
      text: 'А если на планету нападут? Ну ладно, захвачу.',
      mood: 'positive',
    },
  },
  reward: {
    credits: 150,
  },
};
