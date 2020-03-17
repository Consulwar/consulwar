import Game from '/moduls/game/lib/main.game';

export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial22',
  condition: [
    function() {
      const colonies = Game.Planets.getColonies();
      return colonies && colonies.length >= 2;
    },
  ],
  slides: 5,
  helpers: [

    {
      url: '/game/cosmos',
      condition: {
        target: '.attack-menu .items.fleet .unit[data-id*="Wasp"] .count input',
        exists: true,
        value: 1,
      },
      target: '.attack-menu .btn-attack.defend',
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
      direction: 'bottom',
    },

    {
      url: '/game/resources/artefacts/crystal_fragments',
      target: '.cw--Artifact .cw--Artifact__planets',
      direction: 'left',
    },

    {
      url: '/game/research/Evolution/Hyperdrive',
      target: '.cw--BuildResearch .cw--ResourcePrice .cw--ResourcePrice__item[href*="crystal_fragments"]',
      direction: 'top',
    },

    {
      url: '/game/research/Evolution',
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Hyperdrive"]',
      direction: 'top',
    },

    {
      url: '/game/research/Fleet',
      target: 'header .menu .second_menu li.Evolution-icon',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .main_menu li.research',
      direction: 'bottom',
    },
  ],
  title: 'Захватить планету для добычи артефактов',
  text: '<p>Со временем некоторые здания и исследования начнут требовать специальный ресурс – Артефакты, которые можно добыть только на других планетах. Например, такое исследование, как Гипердвигатели, – посмотрите, Консул! – оно требует белые Осколки Кристаллов. Кликните на них, чтобы найти ближайшую планету с этим артефактом. Отправьте туда флот и, когда он будет на орбите, нажмите кнопку «Захватить» – и добыча артефактов немедленно начнется.</p>',
  options: {
    accept: {
      text: 'На планетах можно добывать Артефакты? Буду знать.',
      mood: 'positive',
    },
  },
  reward: {
    'Resource/Artifact/White/SilverPlasmoid': 10,
    'Resource/Artifact/White/ShipDetails': 10,
    'Resource/Artifact/White/MeteorFragments': 10,
    'Resource/Artifact/White/WeaponParts': 10,
    'Resource/Artifact/White/CrystalFragments': 10,
  },
};
