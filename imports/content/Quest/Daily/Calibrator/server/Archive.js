export default {
  id: 'Quest/Daily/Calibrator/Archive',
  title: 'Архив',
  author: 'aptaje',
  text: 'Приветствую, Консул. Недавно мне попалась очень старая поврежденная запись, в которой хранилась информация о неком бое 26 января …13 года. Дело происходило явно не в нашей вселенной, но мне удалось выяснить, что это была битва двух крупных альянсов с невообразимо большими потерями… Я долго думал, но никак не мог понять логику действий руководства альянса, который начал битву в открытом космосе… ни за что… Что это за тактика?',
  answers: {
    miscalculate: {
      text: 'Может командующий одного из альянсов ошибся сектором?',
      win: 'Вероятно. Это объясняет, почему сначала прилетел флагман, а затем основной флот.',
      fail: 'Ошибки быть не может, Командующий. Скорее всего мы что-то упускаем… что-то, что не упомянуто в записях.',
    },
    aGoodTimes: {
      text: 'Хорошие были времена… кхм, то есть что было, то было. Будем учиться на ошибках прошлого.',
      win: 'И то верно. Надеюсь, вы не будете попросту тратить имеющийся у вас флот. Архивы сильно повреждены, но мне удалось восстановить часть названия одной из конфликтующих сторон… Go… wrm… Federation, вы что-то знаете об этом?',
      fail: 'Не думаю, что это была ошибка, Консул. Скорее всего, та операция была тщательно спланирована. Но что в ней пошло не так, мы с вами уже никогда не узнаем.',
    },
    checkTheData: {
      text: 'Проверь данные ещё раз – может, там была какая-нибудь дорогущая станция или корован…',
      fail: 'Консул, вы сомневаетесь в моей компетентности? Я восстановил всё, что только смог. И записи гласят, что там были только военные корабли.',
    },
  },
};
