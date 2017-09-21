export default {
  id: 'Quest/Regular/ThirdEngineering/Factory/Factory10',
  condition: [
    ['Building/Military/Factory', 10],
  ],
  title: 'Построить Военный Завод 10-го уровня',
  text: '<p>Третий Инженерный на связи, Командир! Докладываю, что Военный Завод готов начать выпуск новой партии Бгоневичков. У инженеров только одна просьба к вам: нужно поставить особый конвейер для двигателей.</p><p>Мы постараемся дать Бгоневичкам самую лучшую ходовую часть, какую только сможем сделать, иначе они не смогут ловко маневрировать под огнём противника. Насчёт тестов не беспокойтесь, у нас полно добровольцев из числа Папань, которые играли в гоночки на гражданке.</p>',
  options: {
    accept: {
      text: 'Я тоже играл!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 5,
    crystals: 5,
  },
};
