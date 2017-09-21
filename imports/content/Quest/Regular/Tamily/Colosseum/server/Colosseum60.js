export default {
  id: 'Quest/Regular/Tamily/Colosseum/Colosseum60',
  condition: [
    ['Building/Residential/Colosseum', 60],
  ],
  title: 'Построить Колизей 60-го уровня',
  text: '<p>У нас новые… хм… спонсоры боёв в Колизее, правитель. Эти бледные ребята мало разговаривают, но зато хорошо платят. И еще они притащили с собой целую бочку какой-то чёрной биологически активной жижи – собираются заражать одного бойца перед началом турнира, а всех остальных выпускать на арену.</p><p>Заражённый тем временем стремительно мутирует и начинает охоту за свежим мясом. Жуткие монстры получаются, и в какие сжатые сроки! Натали уже попросила утащить ей капельку для исследований.</p>',
  options: {
    accept: {
      text: 'Срочно эвакуируйте меня, я дома этот турнир досмотрю!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 424,
    crystals: 288,
  },
};
