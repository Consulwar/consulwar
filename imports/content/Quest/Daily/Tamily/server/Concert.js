export default {
  id: 'Quest/Daily/Tamily/Concert',
  title: 'Концерт',
  text: 'Ах, Консул, я так взволнована! Сегодня вечером в главном колониальном концертном зале состоится выступление Колбаскова. Он — один из моих любимых исполнителей. Консул, может быть, вы составите мне компанию?',
  answers: {
    tinsel: {
      text: 'Так вот почему из магазинов пропали все блестки.',
      win: 'Да, Консул, вы правы. Он отличается эпатажными костюмами, но это часть образа.',
    },
    faggot: {
      text: 'Говорят, он того… заднеприводный.',
      fail: 'Не знаю, правитель. Я не интересуюсь его личной жизнью. Для меня гораздо важнее его творчество.',
    },
    war: {
      text: 'Есть малюсенькая проблемка: я тут воюю с рептилоидами.',
      win: 'Ох, конечно, правитель. Я отвлекаю вас своими предложениями и болтовней. Простите меня, мне так стыдно.',
      fail: 'Да, Консул, я понимаю, но… Так редко выпадает свободная минутка, и я бы хотела… А впрочем, неважно, я пойду.',
    },
  },
};
