export default {
  id: 'Quest/Regular/Tamily/Crystal/Crystal100',
  condition: [
    ['Building/Residential/Crystal', 100],
  ],
  title: 'Построить Шахту Кристалла 100-го уровня',
  text: '<p>Сегодня ваши шахты — одни из самых развитых добывающих систем на планете, Консул. Да что там на планете — в целой галактике вряд ли найдётся планета, обладающая таким великолепным промышленным потенциалом!</p><p>В вашу честь, мой Император, готовится праздник, который начнётся, как только ваши шахты достигнут последнего, сотого уровня. По вашему приказу все наши инженеры и рабочие бросят все свои дела и начнут в последний раз совершенствовать вашу планету. Ура нашему Консулу!</p>',
  options: {
    accept: {
      text: 'Ура мне! А я уже говорил, что я красавчик?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 46,
    crystals: 48,
  },
};
