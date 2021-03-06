export default {
  id: 'Quest/Regular/Tamily/House/House75',
  condition: [
    ['Building/Residential/House', 75],
  ],
  title: 'Построить Жилой Комплекс 75-го уровня',
  text: '<p>О, доброго времени суток, Консул! Не успела посмотреть в окно — только-только выпроводила архитекторов, они опять притащили новый проект улучшения Жилых Комплексов. На этот раз хотят объединить два смежных помещения прямо друг над другом, чтобы получилась двухэтажная студия. Говорят, это поспособствует «оздоровлению климата» и еще несли что-то про высокие потолки, воздух, пространство и свет. Они, конечно, помешаны на своем «видении проекта», но вдруг это сработает, и Комплексы начнут приносить больше человеческих ресурсов? Или — более человеческие ресурсы? Прикажите начать работы в Жилых Комплексах, и архитекторы будут вас боготворить.</p>',
  options: {
    accept: {
      text: 'Пусть только попробуют не боготворить, я на их проект ресурсы трачу!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4000,
    crystals: 4000,
  },
};
