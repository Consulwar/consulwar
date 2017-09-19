export default {
  id: 'Quest/Daily/NatalyVerlen/StrangeGuy',
  title: 'Ненормальный',
  text: 'Консул, вы должны срочно что-то сделать. Какой-то ненормальный ворвался в нашу лабораторию и закрылся в одном из блоков. Он кричит, что знает истинного творца, что наука лжёт, что земля плоская и стоит на трёх китах. Как прикажете действовать?',
  answers: {
    inquisition: {
      text: 'Сожгите его на костре.',
      win: 'Странный метод, Консул, но, кажется, он работает. Пока что подобных инцидентов не повторялось.',
      fail: 'Я, конечно, не собираюсь учить вас принимать решения, но, пожалуй, сперва позвоню в отдел психиатрии.',
    },
    gotoTheCentre: {
      text: 'Выставите его в центре колонии.',
      win: 'Прекрасное решение, Консул. Жители Колонии восприняли его, как сумасшедшего, а его речи даже способствовали популяризации науки и притоку населения в обучающих центрах.',
      fail: 'Консул, кажется у нас появляется подпольная секта инакомыслящих. Старик сумел переманить на свою сторону несколько десятков человек.',
    },
    edgeOfTheEarth: {
      text: 'Пусть покажет, где кончается земля.',
      win: 'Я думаю, Консул, мы его больше никогда не увидим. Он схватил свою суму и устремился вдаль, размахивая руками.',
    },
  },
};
