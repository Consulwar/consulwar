export default {
  id: 'Quest/Regular/NatalyVerlen/Crystallization/Crystallization5',
  condition: [
    ['Research/Evolution/Crystallization', 5],
  ],
  title: 'Исследовать Кристаллизацию 5-го уровня',
  text: '<p>Консул, я представляю вам нашу лабораторию Кристаллизации. Здесь мы изучаем свойства кристалла, а также изготавливаем на его основе различные полимеры. Вы не представляете себе, насколько широко применяется этот ресурс, Командующий.</p><p>Буквально на днях наша лаборатория создала новый изолирующий материал на основе раствора кристалла. Потом, правда, пришлось изъять его из Казарм, потому что папани начали лазать через электрозабор в самоволки. Побочный эффект, так сказать.</p>',
  options: {
    accept: {
      text: 'Не ругайся, Натали, у них же чемпионат по дотке.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 35,
    crystals: 35,
  },
};