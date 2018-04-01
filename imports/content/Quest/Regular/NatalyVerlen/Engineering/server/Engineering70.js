export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering70',
  condition: [
    ['Research/Evolution/Engineering', 70],
  ],
  title: 'Исследовать Оборонную Инженерию 70-го уровня',
  text: '<p>Огромные наземные пушки – новая головная боль отдела оборонных технологий. Мало того, что их надо установить в отдалении от основных военных и гражданских объектов, так ещё и броню инженерам подавай не абы какую, а самую толстую и прочную.</p><p>Я как представлю процесс изготовления и монтажа… В общем, это будет непростая задача, Командующий. Но Лаборатория справится – мы уже согласовали характеристики материала, осталось только его получить.</p>',
  options: {
    accept: {
      text: 'Звучит оптимистично.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 3000,
    crystals: 3000,
  },
};
