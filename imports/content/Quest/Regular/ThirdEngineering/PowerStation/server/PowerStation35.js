export default {
  id: 'Quest/Regular/ThirdEngineering/PowerStation/PowerStation35',
  condition: [
    ['Building/Military/PowerStation', 35],
  ],
  title: 'Построить Электростанцию 35-го уровня',
  text: '<p>Отлично, все потоки энергии были замерены и стандартизированы под один протокол потребления. Осталось только провести дополнительные исследования в ваших шахтах, Командир.</p><p>Во-первых, оборудование там подвергается экстремальным перегрузкам из-за скачков напряжения. А во-вторых, шахты постоянно расширяются и дорабатываются — сами понимаете, порой провода просто висят на какой-нибудь временной вешке. Но наши инженеры готовы как следует поработать под землёй.</p>',
  options: {
    accept: {
      text: 'Вперёд, мои боевые кроты!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4,
    crystals: 4,
  },
};
