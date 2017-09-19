export default {
  id: 'Quest/Daily/ThirdEngineering/Meeting',
  title: 'Митинг',
  text: 'Рад вас видеть, Консул! Модернизация магистралей идёт полным ходом. Мы закончили уже почти половину всех работ, но на днях столкнулись с проблемой: защитники окружающей природы вышли на митинг. Они выступают против расширения магистралей и готовы чуть ли не бросаться под технику. Вы не могли бы их как-то успокоить, правитель?',
  answers: {
    neverMind: {
      text: 'Не обращайте внимания.',
      win: 'Сначала было довольно трудно, Консул, но затем ажиотаж поутих, активисты поняли, что им не светит ничего, и в итоге разошлись.',
      fail: 'Консул, мы старались продолжать работу, но активисты просто парализовали наши передвижения. Нужны какие-то иные меры.',
    },
    police: {
      text: 'Пусть отдел колониальной безопасности разберётся.',
      win: 'Консул, всё прошло не совсем гладко, но силовики разогнали митингующих. Особо активных пришлось отправить под стражу, но, кажется, теперь всё в порядке.',
      fail: 'Увы, Консул, всё стало ещё хуже: столкновения с сотрудниками ОКБ были раздуты в СМИ до невероятных размеров, и теперь каждая собака в колонии в курсе событий вокруг магистрали. Боюсь, жители не на нашей стороне.',
    },
    politics: {
      text: 'Пусть местные политиканы чего-нибудь наобещают.',
      win: 'Похоже, что это сработало, Консул. Правда, нам придётся высадить несколько гектаров парков на западе колонии, но это даже неплохо.',
    },
  },
};
