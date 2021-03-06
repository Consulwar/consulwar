export default {
  id: 'Quest/Regular/ThirdEngineering/Laboratory/Laboratory35',
  condition: [
    ['Building/Military/Laboratory', 35],
  ],
  title: 'Построить Лабораторию 35-го уровня',
  text: '<p>А вы знали, Командир, что среди кандидатов в белые халаты производится довольно жёсткий отбор? А потом им ещё и моют мозги высокотехнологичным раствором, чтобы повысить качество этих самых мозгов.</p><p>Не все выживают после такой процедуры, поэтому поступило предложение параллельно с обычным набором запустить ещё и программу клонирования самых одарённых умов нашей планеты. Во-первых, разовьем технологию, а во-вторых, всегда будет копия на случай локального факапа с жертвами.</p>',
  options: {
    accept: {
      text: 'Могу тоже сдать материал, как выдающийся ум.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 450,
    crystals: 450,
  },
};
