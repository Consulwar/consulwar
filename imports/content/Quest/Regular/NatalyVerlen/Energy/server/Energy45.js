export default {
  id: 'Quest/Regular/NatalyVerlen/Energy/Energy45',
  condition: [
    ['Research/Evolution/Energy', 45],
  ],
  title: 'Исследовать Энергетику 45-го уровня',
  text: '<p>Отлично, Консул, система солнечных батарей успешно развёрнута на орбите и уже ловит излучения всего видимого спектра. Как ни парадоксально, проблема состоит в том, что энергии получается даже слишком много для текущего уровня потребления.</p><p>В связи с этим учёные решили спроектировать несколько мощных хранилищ на случай… Ну, не знаю, взрыва сверхновой, прилёта Рептилоидов, крушения нашей системы, наконец.</p>',
  options: {
    accept: {
      text: 'Э-э-э! Постучи! Да не меня!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4000,
    crystals: 4000,
  },
};
