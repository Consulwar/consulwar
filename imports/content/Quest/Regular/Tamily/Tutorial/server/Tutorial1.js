export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial1',
  condition: [
    ['Building/Residential/House', 1],
  ],
  title: 'Построить Жилой Комплекс 1-го уровня',
  text: '<p>Перейдём к делу. Рептилоиды терроризируют галактику, беженцы ищут планеты для жизни. Люди – это важный ресурс, Консул. Чтобы им было где жить, постройте на планете Жилой Комплекс. </p>',
  options: {
    accept: {
      text: 'Прекрасно, приступим.',
      mood: 'positive',
    },
  },
  reward: {
    humans: 500,
  },
};
