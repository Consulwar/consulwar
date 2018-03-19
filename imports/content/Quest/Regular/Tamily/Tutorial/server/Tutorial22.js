import Game from '/moduls/game/lib/main.game';

export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial22',
  condition: [
    function() {
      const colonies = Game.Planets.getColonies();
      return colonies && colonies.length >= 2;
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
    'Resource/Artifact/White/ShipDetails': 10,
    'Resource/Artifact/White/MeteorFragments': 10,
    'Resource/Artifact/White/WeaponParts': 10,
    'Resource/Artifact/White/CrystalFragments': 10,
  },
};
