export default {
  id: 'Quest/Daily/Vakhaebovich/RatInStorage',
  title: 'Крыса на складе!',
  author: '',
  text: 'Консул! Со складов регулярно пропадает оружие. Сначала исчезло снаряжение для пушечного мяса, потом запчасти, а теперь и до крупной техники дошло! Я бы и пальцем не пошевелил ради Третьего, но какие-то уроды украли мой любимый ОБЧР! Такого я им простить не могу. Дай мне людей, и я лично поджарю их наглые задницы. Заодно и ОБЧР верну, а может, и ещё что-нибудь.',
  answers: {
    rookies: {
      text: 'Возьми новобранцев – им будет полезно увидеть профессионала за работой.',
      fail: 'Твои новобранцы просто тупое мясо! Мало того, что нам не удалось выяснить, кто стоял за всем этим, так еще и мой ОБЧР не нашли!',
    },
    hideAndSearch: {
      text: 'А один ты не справишься?',
      fail: 'Я обыскал все склады, но ничего не нашёл. Даже допрос сотрудников ничего не дал! Зато появились свободные вакансии кладовщиков.',
    },
    Sherlock: {
      text: 'Возьми того… С тростью и трубкой…',
      win: 'Меня сложно удивить, но этот парень хорош! Он не только отыскал пропавшую экипировку – и мой ОБЧР! – но и вывел меня на зеленожопых, промышляющих контрабандой прямо у нас перед носом! Теперь всё в порядке: снаряжение вернулось на склад, ОБЧР – в мой ангар, а ресурсы отдаю, тебе нужнее.',
    },
  },
};
