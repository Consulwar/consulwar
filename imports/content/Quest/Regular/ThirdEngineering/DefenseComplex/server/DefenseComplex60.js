export default {
  id: 'Quest/Regular/ThirdEngineering/DefenseComplex/DefenseComplex60',
  condition: [
    ['Building/Military/DefenseComplex', 60],
  ],
  title: 'Построить Оборонный комплекс 60-го уровня',
  text: '<p>Профессор, которого мы пригласили, посмотрел на наши наработки, поморщился и объявил, что с этого момента он возглавит наш отдел оборонных технологий. Но с одним условием: мы перестанем изобретать велосипед и позволим ему сконструировать классический рельсотрон с облегчённым снарядом.</p><p>На наш вопрос о плазме он фыркнул и сказал, что снаряд в процессе должен расплавиться и стать плазмой, а для предотвращения воздействия вакуума на конце рельсотрона будет сделана специальная диафрагма. Гений!</p>',
  options: {
    accept: {
      text: 'С тяжёлым характером. Всё, как ты любишь.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 1000,
    crystals: 1000,
  },
};
