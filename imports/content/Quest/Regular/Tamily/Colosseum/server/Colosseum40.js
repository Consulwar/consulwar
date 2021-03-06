export default {
  id: 'Quest/Regular/Tamily/Colosseum/Colosseum40',
  condition: [
    ['Building/Residential/Colosseum', 40],
  ],
  title: 'Построить Колизей 40-го уровня',
  text: '<p>Военные решили, что нужно добавить огонька в игры Колизея, правитель. Для этого они сделали специальный турнир, который предполагает поиск и обезвреживание настоящей атомной бомбы.</p><p>Причём, чтобы получить шифр для отмены детонации, рептилоидам нужно сбить и обыскать пять ксинолётов, потому что в каждом из них находится только часть информации. Уже несколько партий пленных были испорчены взрывом, и Лаборатория уже всерьёз начинает интересоваться этой «ареной Дегтярёва».</p>',
  options: {
    accept: {
      text: 'Боже мой, кто придумал этот ужасный турнир? А, ну да. Очевидно, кто-то по фамилии Дегтярёв.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 500,
    crystals: 500,
  },
};
