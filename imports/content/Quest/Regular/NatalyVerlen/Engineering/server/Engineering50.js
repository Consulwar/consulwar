export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering50',
  condition: [
    ['Research/Evolution/Engineering', 50],
  ],
  title: 'Исследовать Оборонную Инженерию 50-го уровня',
  text: '<p>Новый проект Рельсовой Пушки впечатляет, Командующий, несмотря на то, что он супердорогой и конструируется из деталей, которые поставляются Советом за ГГК.</p><p>Мы тоже не захотели остаться в стороне и налепили на это чудо техники такое количество брони, что собирать его теперь приходится прямо на орбите – такую махину ни за что не поднять с планеты даже самыми мощными двигателями. Но все усилия окупаются, стоит лишь увидеть, как эта штука ебашит флот противника.</p>',
  options: {
    accept: {
      text: 'Звучит заманчиво… Может, людишки в серых костюмах нафармят нам парочку таких пушек?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 700,
    crystals: 700,
  },
};
