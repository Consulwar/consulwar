export default {
  id: 'Quest/Regular/Tamily/Crystal/Crystal60',
  condition: [
    ['Building/Residential/Crystal', 60],
  ],
  title: 'Построить Шахту Кристалла 60-го уровня',
  text: '<p>Пришёл отчёт об успехах К-лаборатории в шахте Кристалла, правитель. С новыми центрифугами производительность пошла в гору, но случилась пара досадных несчастных случаев: к сожалению, не все лаборанты были ознакомлены с правилами безопасности, и их в буквальном смысле затянуло в работу с головой.</p><p>Теперь для повышения добычи придётся набирать новый персонал, да ещё и проводить тренинг, иначе мы рискуем набирать новый комплект молодых учёных каждые две недели. С вашего позволения, отдел по работе с персоналом займётся этим.</p>',
  options: {
    accept: {
      text: 'Ладно, позволяю. Но чтоб никаких больше аварий.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 22,
    crystals: 24,
  },
};
