export default {
  id: 'Quest/Daily/SoseuhTilps/Unscheduled',
  title: 'Внеплановая проверка',
  author: 'Mr_Springman',
  text: 'Консул, не хочу отвлекать от дел, но у нас появилась новая проблема. На подлете к планете делегация Совета Галактики с внеплановой проверкой. И буквально только что мы получили наводку от тайного информатора, что группа рептилоидов может напасть на послов Совета, а охрану обеспечить некому – все наши солдаты только что отправились на Землю. Какие будут приказы?',
  answers: {
    cadets: {
      text: 'Пусть Папани-кадеты обеспечат безопасность Совета.',
      win: 'Это было рискованно, но кадеты действовали на удивление слаженно. Рептилоиды уничтожены, Совет впечатлён, так держать, Консул!',
      fail: 'Наши кадеты не были готовы к настоящему бою. Едва заметив противника, они открыли беспорядочный огонь и самолично погубили большую часть послов.',
    },
    bigRobot: {
      text: 'Где там наш списанный ОБЧР?',
      win: 'Ваш план отлично сработал, Консул. Похоже, что завидев эту махину, рептилоиды решили не высовываться.',
      fail: 'К сожалению, ваш хитрый план не сработал. Не пройдя и нескольких шагов, ОБЧР вышел из строя и упал прямо на делегацию.',
    },
    realOfficer: {
      text: 'Это работа для офицера Чанка.',
      win: 'Должен признаться, что я сомневался в вашем выборе, но офицер Чанк проявил себя как настоящий герой. Его уже ждёт повышение.',
      fail: 'Увы, за минуту до нападения офицер Чанк решил, что ему срочно необходимо покорить танцпол в центре развлечений.',
    },
  },
};