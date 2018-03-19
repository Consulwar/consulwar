export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial10',
  condition: [
    ['Building/Military/PowerStation', 20],
  ],
  title: 'Построить Электростанцию 20-го уровня',
  text: '<p>Вы отлично справляетесь, правитель! Не будем сбавлять темп: нужно улучшить Электростанцию до 20-го уровня. Помните, что до 20-го уровня можно ускорять строительство бесплатно. Пользуйтесь этим.</p>',
  options: {
    accept: {
      text: 'Хорошо, буду помнить. Какая ты все-таки доставучая…',
      mood: 'positive',
    },
  },
  reward: {
    'Resource/Artifact/White/MeteorFragments': 10,
    'Resource/Artifact/White/CrystalFragments': 10,
  },
};
