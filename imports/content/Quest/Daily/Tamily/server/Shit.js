export default {
  id: 'Quest/Daily/Tamily/Shit',
  title: 'Это пиздец!',
  text: 'Консул!!! Сотни тысяч кораблей Рептилий на радаре! Это конец! Их слишком много… Что же это… Что нам делать, Великий Консул? Прошу вас, скорее!',
  answers: {
    iDoMyOwn: {
      text: 'Приготовить мой флот, я вылетаю лично!',
      win: 'Ох, какое облегчение! Это был распавшийся на осколки ледяной астероид. Вы не медлили ни секунды, Консул, вы были готовы идти в бой без промедления, спасая наши жизни. О, какой же вы ахуенный!',
      fail: 'Мы отправили группу разведки. Оказалось, что это не флот Рептилий, это странная космическая энергия. Она разнесла в щепки наших енотов и ушла туда, откуда пришла. Консул, вам нельзя так рисковать собой, вы слишком важны для нас и для меня тоже…',
    },
    checkAgain: {
      text: 'Проверить ещё раз всё оборудование и енотов.',
      win: 'Всё ясно, Михалыч не проверил настройки пульта слежения, и поэтому получились такие результаты. Ложная тревога, правитель. Я извиняюсь. Тем не менее вы молодец.',
      fail: 'Пока мы проверяли оборудование, сигналы пропали. И почему-то половина наших енотов также куда-то исчезла. Что-то странное творится, Консул. И боюсь, теперь мы не узнаем, что…',
    },
    calmDown: {
      text: 'Успокойся, Тамили. Я уверен, что это ошибка.',
      win: 'А ведь вы были правы, Консул. Один из датчиков закоротило, и он выдал такие странные результаты. А я уже панику тут развела, мне так стыдно… Но вы ни капли не боялись, я поражена. Воистину Великий Консул.',
      fail: 'Никаких ошибок, Консул. Это был королевский флот Рептилий. Наверняка Император Рептилий был на борту. Наверное, у них был некий сбой гиперпрыжка – их флот развернулся и ушёл в другом направлении. Как жаль. Мы упустили такой шанс…',
    },
  },
};
