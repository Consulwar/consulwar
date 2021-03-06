export default {
  id: 'Quest/Regular/NatalyVerlen/Alloy/Alloy40',
  condition: [
    ['Research/Evolution/Alloy', 40],
  ],
  title: 'Исследовать Особые Сплавы 40-го уровня',
  text: '<p>«Новые перекрытия из Особых Сплавов для Шахты Металла» – звучит несколько странно, не правда ли, Консул? И тем не менее наша Лаборатория намерена заняться именно этим. В шахте, конечно же, выплавляют металл и могут сами обновить свои помещения, но наши разработки позволят сделать это значительно быстрее.</p><p>Достаточно исследовать Особые Сплавы, и простои в работе Шахты прекратятся совсем. Мы готовы приступать, вот только дождёмся вашего распоряжения.</p>',
  options: {
    accept: {
      text: 'Приказую! Хм, указываю! В общем, вы поняли, херачьте там.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 500,
    crystals: 500,
  },
};
