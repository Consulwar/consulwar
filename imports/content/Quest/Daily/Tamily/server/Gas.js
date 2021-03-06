export default {
  id: 'Quest/Daily/Tamily/Gas',
  title: 'Странный газ',
  text: 'В шахте беда, Консул! Непонятный подземный газ заполняет тоннели, мы не знаем, что делать с добычей!',
  answers: {
    blowup: {
      text: 'Взрывай шахту вместе с людьми.',
      win: 'Мы только что получили данные по этому газу: в нём находились очень умные и опасные микроорганизмы. Не уничтожь мы шахту, сейчас уже вся планета была бы заражена.',
      fail: 'Я полностью согласна с вашим решением, Консул. Это была опасная ситуация, и вы решили её кардинально, но другие шахтёры недовольны. Глупцы просто не понимают, как сложно принимать такие решения.',
    },
    pumped: {
      text: 'Попробуйте откачать оттуда газ.',
      win: 'А ведь действительно, это было так очевидно. Спасибо вам за помощь, Консул. Не знаю даже, что бы мы без вас делали.',
      fail: 'Когда роботы откачивали газ, что-то пошло не так и шахта взлетела на воздух. В прямом смысле… Огромные пласты породы вынесло наверх ударной волной. Я такого ещё никогда не видела. Ужас.',
    },
    justWork: {
      text: 'Продолжать работу, выветрится само!',
      win: 'Вы были правы, правитель. Мы зря подняли панику – газ оказался не опасным, вытяжки справились, и работа в шахте продолжилась. Здорово! ',
      fail: 'Оказалось, что данный газ может вступать в реакцию с кристаллом. После чего газ каким-то странным образом сгорает вместе с воздухом, не повреждая ни технику, ни другие неорганические объекты. К сожалению, шахтёры расплавились на месте. Зато их одежда осталась…',
    },
  },
};
