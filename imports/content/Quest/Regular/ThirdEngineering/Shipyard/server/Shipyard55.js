export default {
  id: 'Quest/Regular/ThirdEngineering/Shipyard/Shipyard55',
  condition: [
    ['Building/Military/Shipyard', 55],
  ],
  title: 'Построить Верфь 55-го уровня',
  text: '<p>Командир, Верфь докладывает, что инженеры закончили опыты с дальнобойными пушками в условиях космического пространства. Результаты этих опытов были настолько впечатляющими, что их немедленно засекретили. И одновременно с этим началась разработка нового супердальнобойного оружия, предназначенного для поддержки вашего звёздного флота.</p><p>Это оружие – рейлган – по наводке вашего флота будет стрелять по кораблям противника, находящимся за тридевять световых лет. Главное в этом деле – не промахнуться.</p>',
  options: {
    accept: {
      text: 'Главное в этом деле – стрелять от себя.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 800,
    crystals: 800,
  },
};
