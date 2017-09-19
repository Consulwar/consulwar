export default {
  id: 'Quest/Daily/Tamily/BitsAndPieces',
  title: 'Странные обрывки',
  text: 'Консул, из-за увеличения мощности Импульсного Уловителя мы начали случайно перехватывать обрывки переговоров других Консулов. Они говорят о каком-то коде и требуют «её арт с резиновым другом». Мы можем им что-то отправить?',
  answers: {
    suck: {
      text: 'Отправь: «CocHuTe 6yu».',
      win: 'Кажется, мы случайно отправили это сообщение рептилоидам. Это ничего?',
      fail: 'Мы получили ответ, Консул, но там одни рыбы: лосось, тунец… Что бы это значило?',
    },
    code: {
      text: 'Отправь им шифр рептилоидов, пусть наш Калибратор выспится.',
      win: 'Отличная идея! Может быть, «резиновый друг» – это тоже шифр?',
      fail: 'Я бы и так не стала его будить, правитель, – он вчера случайно взломал личную почту Главнокомандующего и, говорят, получил серьёзную психическую травму.',
    },
    shoot: {
      text: 'Отправь один залп из орбитальной пушки.',
      fail: 'Кажется, мы начали получать сообщения из всего сектора, куда была направлена пушка. Даже Совет подключился и обещал урезать нам дотации.',
    },
  },
};
