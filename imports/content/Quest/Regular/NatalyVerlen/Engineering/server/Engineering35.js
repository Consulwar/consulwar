export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering35',
  condition: [
    ['Research/Evolution/Engineering', 35],
  ],
  title: 'Исследовать Оборонную Инженерию 35-го уровня',
  text: '<p>Отдел оборонных технологий рапортует: обычные турели улучшены до предела, и мы плавно переходим к изготовлению более сложных и мощных пушек. Есть предложение назвать их Снайпер-ганами, по аналогии со снайперами… и ганами.</p><p>И стрельбой на дальние дистанции, потому что эти пушки посылают комок раскаленной плазмы из одной точки космоса в другую. Главное при этом – не ошибиться в расчётах и не промахнуться мимо рептилоидов, потому как, Консул, в космосе тормозов и трения нет.</p>',
  options: {
    accept: {
      text: 'Как это нет тормозов? А Калибратор?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 450,
    crystals: 450,
  },
};
