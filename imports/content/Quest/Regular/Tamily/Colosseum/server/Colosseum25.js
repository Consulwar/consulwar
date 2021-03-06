export default {
  id: 'Quest/Regular/Tamily/Colosseum/Colosseum25',
  condition: [
    ['Building/Residential/Colosseum', 25],
  ],
  title: 'Построить Колизей 25-го уровня',
  text: '<p>Новые турниры – это просто бомба, правитель! Они оказались настолько популярными, что к нам на планету прибыл сам Джабба Десилиджик Тиуре, знаменитый гангстер из далекой, далекой галактики.</p><p>Ему ужасно понравилось, как наши боевые черепашки разрывают на части проклятых чешуйчатых – на своей планете он устраивает что-то похожее, но гораздо скромнее. Надеюсь, Джабба станет постоянным посетителем Колизея: да, это ужасный вонючий слизень, но артефакты он привозит великолепные.</p>',
  options: {
    accept: {
      text: 'Надеюсь, вы их моете перед использованием.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 350,
    crystals: 350,
  },
};
