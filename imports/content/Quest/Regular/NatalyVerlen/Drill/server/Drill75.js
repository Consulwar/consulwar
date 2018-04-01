export default {
  id: 'Quest/Regular/NatalyVerlen/Drill/Drill75',
  condition: [
    ['Research/Evolution/Drill', 75],
  ],
  title: 'Исследовать Бурильный Бур 75-го уровня',
  text: '<p>Ваши инженеры разработали автоматизированную систему управления, Консул. Теперь все опасные работы на шахте выполняют роботы, дистанционно контролируемые людьми.</p><p>Я вынуждена признать, что это была блестящая идея, которая позволила нам отслеживать движение техники, оптимизировать транспортные потоки и даже мониторить состояние оборудования в режиме реального времени. Заодно выяснилось, куда всё время пропадают цистерны с горючим.</p>',
  options: {
    accept: {
      text: 'Они не пропадают! Они расходуются на мой секретный проект.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4000,
    crystals: 4000,
  },
};
