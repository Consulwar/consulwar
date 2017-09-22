export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher1',
  condition: [
    ['Building/Residential/PulseCatcher', 1],
  ],
  title: 'Построить Импульсный Уловитель 1-го уровня',
  text: '<p>У вас теперь так много работы, правитель, что мне даже как-то неловко вас отвлекать. Но повод стоящий – наши инженеры разработали прибор, который сможет собирать какую-то совершенно особую импульсную энергию из космоса.</p><p>По словам учёных, сама эта энергия настолько необычная, что в генераторах её использовать совершенно бесполезно. Но зато Совет очень положительно оценил этот прорыв в нашей науке и готов выделять вам небольшой ежедневный бонус, чтобы скомпенсировать постройку этого сооружения.</p>',
  options: {
    accept: {
      text: 'То есть я строю бесполезную хрень, а они мне ещё и приплачивают за это? Супер!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5,
    crystals: 5,
  },
};
