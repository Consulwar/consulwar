export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial20',
  condition: [
    ['Unit/Human/Space/Cruiser', 1],
  ],
  title: 'Построить один космический корабль «Крейсер»',
  text: '<p>Мне кажется, вы уже совершенно освоились и дальше справитесь сами. Не забывайте проверять побочные задания от Помощников в каждом районе, а сейчас, думаю, вам стоит развивать свой флот дальше, и захватывать всё больше и больше планет в Космосе, попутно уничтожая проклятых рептилоидов. Постройте хотя бы один Крейсер – мощный корабль среднего класса.</p>',
  options: {
    accept: {
      text: 'Без проблем. Я уже вижу, какие технологии для него нужны.',
      mood: 'positive',
    },
  },
  reward: {
    credits: 50,
  },
};
