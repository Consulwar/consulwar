export default {
  id: 'Quest/Daily/Mechanic/GraveForShips',
  title: 'Захоронение кораблей',
  text: 'Привет, Консул. Ожидая своей очереди для утилизации, старые корабли болтаются в космосе. Один из моих покупателей достал для меня координаты такого захоронения. Конечно, нас кто-то мог опередить, но есть шанс собрать старый хлам и пустить его на переработку. Ты в деле?',
  answers: {
    lazy: {
      text: 'Мне лень. Могу дать тебе пару кораблей.',
      win: 'Как скажешь, Консул. Без тебя я управлюсь гораздо быстрей. Думаю, этой суммы хватит в качестве арендной платы.',
      fail: 'Один я туда не полезу, Консул. Но это не проблема, я найду себе другого спутника.',
    },
    trash: {
      text: 'Всегда мечтал ковыряться в мусоре.',
      win: 'Если бы весь мусор приносил такую прибыль, Консул, то я бы занимался уборкой улиц. По-моему, наш полёт удался.',
      fail: 'Люблю сарказм, Консул, но только если он уместен. До встречи.',
    },
    letsGo: {
      text: 'Полетели, делать нечего всё равно.',
      win: 'Хорошо, что ты взял несколько кораблей, Консул. Иначе пришлось бы оставить половину этого добра там. Держи твою часть.',
      fail: 'Как я и говорил, нас кто-то успел опередить. Ну что ж, бывает, Консул.',
    },
  },
};
