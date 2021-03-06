export default {
  id: 'Quest/Daily/Tamily/Cookery',
  title: 'Кулинарные успехи',
  text: 'Консул, у вас есть минутка? Я начала изучать основы кулинарного дела… Я немного стесняюсь своих результатов, но мне нужен кто-то, кто мог бы честно оценить мои старания. Я испекла шарлотку, и подумала, что вы сможете дать объективную оценку.',
  answers: {
    great: {
      text: 'Потрясающе. Это лучшее, что я ел в жизни.',
      win: 'Ах, Консул, вы мне льстите. Вы правда так считаете? Я так воодушевлена. Спасибо вам!',
      fail: 'Спасибо за поддержку, Правитель, но я просила вас быть честным со мною. Но я вас не виню, это лишний раз доказывает, как вы переживаете за своих подчиненных.',
    },
    bad: {
      text: 'А чего она чёрная-то такая?',
      fail: 'Ах, Консул, вы правы. Зачем я только притащила её сюда… Извините меня.',
    },
    imAlive: {
      text: 'Ну, я не отравился, а это уже неплохо.',
      win: 'Ха-ха, Консул, спасибо, что подняли мне настроение! Я и сама понимаю, что это не лучший экземпляр, и я рада, что вы честно оценили мои старания.',
    },
  },
};
