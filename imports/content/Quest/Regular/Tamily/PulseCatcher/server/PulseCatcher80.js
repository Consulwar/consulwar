export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher80',
  condition: [
    ['Building/Residential/PulseCatcher', 80],
  ],
  title: 'Построить Импульсный Уловитель 80-го уровня',
  text: '<p>Где-то в глубинах нашей галактики учёным удалось отыскать маленькую звезду, правитель, которая, предположительно, является кварковой. Однако исследовать её будет достаточно сложно, ведь мы не можем просто направить в звезду гаммадрон и посмотреть, что получится.</p><p>Неясно вообще, как взаимодействовать со странным веществом, поэтому в качестве первых шагов звезду окружили плотным кольцом из датчиков, данные с которых постоянно передаются в лаборатории Уловителя.</p>',
  options: {
    accept: {
      text: 'А я вот сейчас не понял, почему мы не можем просто послать в звезду гаммадрон. А?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5000,
    crystals: 5000,
  },
};
