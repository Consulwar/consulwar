export default {
  id: 'Quest/Regular/NatalyVerlen/Alloy/Alloy90',
  condition: [
    ['Research/Evolution/Alloy', 90],
  ],
  title: 'Исследовать Особые Сплавы 90-го уровня',
  text: '<p>Кажется, наши сетки так понравились горожанам в Центре Развлечений, что они потребовали установить ещё один ринг – на этот раз в Политическом Центре. Люди посчитали, что это будет наиболее гуманным способом выяснять размеры авторитета у претендентов на вакантные должности.</p><p>С точки зрения науки такой способ никуда не годится, но что-то в этой авантюре есть. Если вы готовы прислушаться к гласу народа, Консул, просто отдайте приказ, и мы начнём исследование Особых Сплавов.</p>',
  options: {
    accept: {
      text: 'О, а у этих тотализатор будет? Спрашиваю, как исследователь.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 7000,
    crystals: 7000,
  },
};
