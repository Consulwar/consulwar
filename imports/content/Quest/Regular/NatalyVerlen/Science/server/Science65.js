export default {
  id: 'Quest/Regular/NatalyVerlen/Science/Science65',
  condition: [
    ['Research/Evolution/Science', 65],
  ],
  title: 'Исследовать Научный Отдел 65-го уровня',
  text: '<p>Генная пушка работает прекрасно, Консул, мы уже добавили полезные свойства огромному количеству растений. Но иногда бывают ситуации, когда пушку применить нельзя, – например, не будем же мы стрелять в животное, которому нужно подправить некоторые геномные последовательности.</p><p>И наша лаборатория нашла ответ: мы уже занимаемся работой над вирусами, из генома которых удалено всё лишнее, и вставлена только та информация, которая нужна для изменения участка ДНК. Очень многообещающий метод.</p>',
  options: {
    accept: {
      text: 'Натали, ты ж прямо из лаборатории? Масочку надень.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 7500,
    crystals: 7500,
  },
};
