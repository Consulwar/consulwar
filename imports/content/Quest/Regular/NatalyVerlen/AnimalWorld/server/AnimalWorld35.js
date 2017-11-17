export default {
  id: 'Quest/Regular/NatalyVerlen/AnimalWorld/AnimalWorld35',
  condition: [
    ['Research/Evolution/AnimalWorld', 35],
  ],
  title: 'Исследовать В Мире Животных 35-го уровня',
  text: '<p>У нас серьёзный случай горячечного бреда, Консул, – один из служащих Политического Центра внезапно решил, что все, кто использует в своей продукции зелёный цвет, тайно пропагандирует рептилоидную заразу.</p><p>В общем, преисполнившись этой мыслью, он решил спасти отечество и запретить зелёный цвет на всей территории планеты. Думаю, мы просто посадим его в изолятор ближайшей психлечебницы… с войлочными, нежно салатовыми стенами, полом и потолком.</p>',
  options: {
    accept: {
      text: 'Так он у вас ещё больше ебанётся… А, это и есть твой коварный план!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 75,
    crystals: 75,
  },
};