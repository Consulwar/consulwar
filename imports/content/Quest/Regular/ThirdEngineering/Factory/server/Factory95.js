export default {
  id: 'Quest/Regular/ThirdEngineering/Factory/Factory95',
  condition: [
    ['Building/Military/Factory', 95],
  ],
  title: 'Построить Военный Завод 95-го уровня',
  text: '<p>Теперь, когда вся техника работает безукоризненно, пришла пора озаботится боевыми расчётами.</p><p>Эти бравые ребята должны знать, как эффективно вести огонь по наступающему или отступающему противнику, как переключаться на наиболее опасные цели, как обслуживать и заряжать такую махину, наконец. Поэтому им просто необходимы курсы переподготовки, Командир. И чем раньше, тем лучше для техники.</p>',
  options: {
    accept: {
      text: 'Ну да, а то ещё перепутают Вахаебыча со снарядом, будет психическая атака.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 9000,
    crystals: 9000,
  },
};
