export default {
  id: 'Quest/Daily/NatalyVerlen/ReproductiveSystem',
  title: 'Половая система',
  text: 'Консул, нам удалось воссоздать точную копию половой системы рептилоида на одном из биологических 3D принтеров. Это позволит установить, каким именно образом происходит размножение этих тварей, и, возможно, даст ключ к решению задачи по построению оружия массового поражения и подавления рождаемости. Вы хотите взглянуть?',
  answers: {
    inMyOffice: {
      text: 'Да, доставь в мой кабинет.',
      win: 'Я, конечно, приятно удивлена таким интересом с вашей стороны, Консул, но, к сожалению, я не могу этого сделать. Однако я предоставлю вам 3D тур по лаборатории через систему удаленного взаимодействия.',
      fail: 'Консул, к сожалению, я не могу этого сделать. В лаборатории созданы абсолютно уникальные условия, нарушение которых может привести к полному уничтожению объекта.',
    },
    soundsBad: {
      text: 'Ты предлагаешь мне изучать письки рептилоидов?',
      win: 'Грубо говоря — да. Но это же так увлекательно, Консул: узнавать самые сокровенные тайны своего врага. Хотя я вижу, что вы не в восторге от этого.',
      fail: 'Нет, Консул, я просто предлагаю вам взглянуть на труды десятка лучших умов этой Колонии. Но, видимо, вам абсолютно всё равно на научные достижения.',
    },
    nope: {
      text: 'Нет, давайте сами там как-нибудь.',
      win: 'Как скажете, Консул. В принципе, меня устраивает такой подход: вы не мешаете нам делать свою работу, а мы взамен гарантируем качество.',
      fail: 'Ну что же, Консул, конечно, немного обидно, что вы не интересуетесь нашими достижениями, но ничего не поделать. Всего хорошего.',
    },
  },
};
