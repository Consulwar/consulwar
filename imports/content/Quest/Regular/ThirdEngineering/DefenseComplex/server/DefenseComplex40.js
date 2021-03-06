export default {
  id: 'Quest/Regular/ThirdEngineering/DefenseComplex/DefenseComplex40',
  condition: [
    ['Building/Military/DefenseComplex', 40],
  ],
  title: 'Построить Оборонный комплекс 40-го уровня',
  text: '<p>Отличные новости, Командир! Турели так хорошо показали себя в боях с небольшими кораблями, что у наших инженеров пропали последние сомнения в необходимости соорудить пушку побольше и помощнее.</p><p>Мы сделаем настоящий рельсотрон, который будет стрелять плазменными зарядами. Всё, что нам нужно – немного списанных кораблей среднего класса и транспортник, чтобы поднять на орбиту первый прототип. Возможно, я должен объяснить вам, как будет работать эта новая пушка?</p>',
  options: {
    accept: {
      text: 'Вы спаяете две рельсы, подведёте к ним ток и будете стрелять заряженной плазмой?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 500,
    crystals: 500,
  },
};
