export default {
  id: 'Quest/Regular/ThirdEngineering/PowerStation/PowerStation55',
  condition: [
    ['Building/Military/PowerStation', 55],
  ],
  title: 'Построить Электростанцию 55-го уровня',
  text: '<p>Как оказалось, огромное количество энергии потребляет не только жилой сектор, но и здания, у которых сугубо специальное назначение. Я говорю о Колизее и Уловителе, Командир. Поскольку здания эти стоят обособлено, то к каждому требуется подводить собственные энергетические системы.</p><p>А это значит, что в процессе передачи возможны значительные потери мощности. Чтобы избежать этого, наши инженеры подготовили проект подземной электросети, которая со временем охватит весь жилой район.</p>',
  options: {
    accept: {
      text: 'А где красные фонари? Как я теперь в темноте найду Центр Развлечений?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 12,
    crystals: 12,
  },
};
