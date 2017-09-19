export default {
  id: 'Quest/Daily/Mechanic/BusinessExpansion',
  title: 'Расширение бизнеса',
  text: 'Привет, Консул. Сразу к делу: я купил старый упаковочный станок и подготовил пакет законопроектов, заставляющий всех остальных паковать продукты только станками такой же марки, как у меня. Переход на устаревшую технологию влетит всем в копеечку, более того – уже упакованные продукты будут под запретом! А тут как раз я подоспею и сниму сливки. Ну и тебя, конечно, не обижу.',
  answers: {
    areYouCrazy: {
      text: 'Да ты рехнулся! Ради твоего кошелька подрывать инфраструктуру всей планеты? Выметайся!',
      win: 'Не сердись, Консул. Вот тебе подарок, и забудем об этом недоразумении.',
    },
    leaveItHere: {
      text: 'Ну… Оставь тут, будет время – посмотрю.',
      fail: 'Нет, Консул, мне надо срочно. Иначе не будет толку.',
    },
    noProblem: {
      text: 'Да без проблем. завтра же примем новый закон.',
      win: 'Отлично, мы неплохо заработали. Вот твоя доля, а закон уже можно отменить.',
      fail: 'Спасибо. Деньги просто текут в карман, а вот к твоей резиденции течёт толпа с факелами и вилами. Я, пожалуй, удалюсь.',
    },
  },
};
