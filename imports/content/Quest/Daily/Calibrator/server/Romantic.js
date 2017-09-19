export default {
  id: 'Quest/Daily/Calibrator/Romantic',
  title: 'Выбор',
  text: 'Консул? Не ожидал увидеть вас так поздно. Не спится? Ночью поток информации гораздо меньше, и у меня есть время немного расслабиться и отдохнуть. Знаете, в темноте экран отдалённо напоминает ночное небо. Иногда я думаю, доволен ли я своим выбором. А вы, Консул?',
  answers: {
    hellYeah: {
      text: 'Власть — это охуительно!',
      win: 'Вы что-то сказали? Я отвлёкся, Консул. Даже ночью нельзя полностью расслабиться — периодически возникают необработанные исключения.',
      fail: 'Наверное, в этом заложен какой-то смысл, но я не понимаю, Консул. Мне намного проще понять машины, чем людей.',
    },
    cryALittle: {
      text: 'Давай обнимемся и поплачем. Где твой розовый платочек?',
      win: 'Да, Консул, я понял. Каждый из нас занят важным и ответственным делом, и нельзя проявлять излишние эмоции.',
    },
    imTheHero: {
      text: 'Кто-то же должен вытащить ваши задницы из всего этого дерьма.',
      win: 'Я Вам даже завидую, Консул. Вы кажетесь уверенным и мудрым человеком. Надеюсь, мы добьёмся значительных успехов под вашим руководством.',
      fail: 'Да, Консул, я понял. Каждый выполняет свои функции и задачи, как эти маленькие куски кода. Но иногда сомнения проскальзывают даже у таких, как я.',
    },
  },
};
