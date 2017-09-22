export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering80',
  condition: [
    ['Research/Evolution/Engineering', 80],
  ],
  title: 'Исследовать Оборонную Инженерию 80-го уровня',
  text: '<p>У проблемы со слишком упругой бронёй всё-таки есть решение, Консул. Наша лаборатория связалась с учёными планеты Совета, и они согласились доработать пластины, которые у нас уже есть.</p><p>Конечно, доставка и всё остальное влетит нам в грязную галактическую копеечку, но зато на сдачу мы получим новые технологии, которые позволят доработать систему наведения и даже настроить электромагнитные щиты для дополнительной защиты этих дорогостоящих пушек.</p>',
  options: {
    accept: {
      text: 'И почему никто не предлагает мне бесплатно что-нибудь доработать или настроить?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 190,
    crystals: 190,
  },
};
