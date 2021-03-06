export default {
  id: 'Quest/Regular/Tamily/Entertainment/Entertainment75',
  condition: [
    ['Building/Residential/Entertainment', 75],
  ],
  title: 'Построить Центр Развлечений 75-го уровня',
  text: '<p>Ваш гениальный план сработал, Консул. Тот, который про леса вокруг Центров Развлечений. После постройки водохранилища там такие густые заросли, что архитекторы предложили разбить их на несколько парков дикой природы и ботанический сад. С ума сойти, правитель — парки на индустриальной планете! И всё это благодаря вам. Как только вы отдадите приказ, наши архитекторы и инженеры начнут разграничивать территорию и прокладывать необходимые коммуникации.</p>',
  options: {
    accept: {
      text: 'Да, я покровитель искусств и природы.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4000,
    crystals: 4000,
  },
};
