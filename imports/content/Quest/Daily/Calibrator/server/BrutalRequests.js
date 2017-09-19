export default {
  id: 'Quest/Daily/Calibrator/BrutalRequests',
  title: 'Жестокие запросы',
  text: 'Ох, не заметил вас, правитель. Иногда я настолько погружён в работу, что могу начать общение с людьми на языке команд и алгоритмов. Я получил данные относительно поисковых запросов, и в последнее время процент желающих увидеть насилие, разрушение и информацию подобного содержания резко возрос. Вам стоит подумать, как обеспечить психологическую разрядку жителей, Консул.',
  answers: {
    CS: {
      text: 'Напиши многопользовательскую игру-стрелялку.',
      win: 'Консул, я удивлен, но судя по статистике, это действительно немного снизило агрессию в сети. Правда, запрос «вычислить по IP» с выходом игры стремится в топ.',
      fail: 'Мы попытались внедрить игру, но, кажется, это только усилило агрессию жителей. Были случаи, когда пользователи встречались в реальном мире, чтобы выяснить отношения, поэтому на данный момент проект прикрыт.',
    },
    totalControl: {
      text: 'Ввести тотальный контроль интернетов.',
      fail: 'Правитель, боюсь, этого сделать не выйдет. Во-первых, правозащитные организации не дадут действовать подобным образом, а во-вторых, жители точно не оценят вашу идею.',
    },
    fire: {
      text: 'Пусть смотрят, какая разница?',
      win: 'Консул, через какое-то время частота подобных запросов действительно значительно снизились. Не знаю, чем был вызван всплеск, но он остался позади.',
    },
  },
};
