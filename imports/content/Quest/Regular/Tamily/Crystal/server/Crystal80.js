export default {
  id: 'Quest/Regular/Tamily/Crystal/Crystal80',
  condition: [
    ['Building/Residential/Crystal', 80],
  ],
  title: 'Построить Шахту Кристалла 80-го уровня',
  text: '<p>У меня только что был представитель К-лаборатории из шахты Кристалла, правитель. Он что-то нёс про такие-то «титры», пробирки, коробки и штрихкоды, но я мало что поняла. Единственное, о чём он смог внятно рассказать: из-за повышения добычи в шахте у них значительно прибавилось работы с растворами, и старая этикеточная система учёта уже не так эффективно справляется с большими объемами Жидкого Кристалла.</p><p>Нужна новая, максимально автоматизированная система, тогда рабочие смогут все силы отдать действительно важной работе. Если вы готовы дать ресурсы на эту цель, Консул, они ждут только вашего приказа, чтобы начать.</p>',
  options: {
    accept: {
      text: 'Они думают, такая система облегчит им жизнь? Ну-ну.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 34,
    crystals: 36,
  },
};
