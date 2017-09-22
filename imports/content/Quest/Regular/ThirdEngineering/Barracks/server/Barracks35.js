export default {
  id: 'Quest/Regular/ThirdEngineering/Barracks/Barracks35',
  condition: [
    ['Building/Military/Barracks', 35],
  ],
  title: 'Построить Казармы 35-го уровня',
  text: '<p>Инженеры на связи, Командир! В Казарме перебывало уже достаточно Папань и Турникмэнов, чтобы сделать им отдельную программу подготовки на стрельбище. У нас будет самая лучшая полоса препятствий во вселенной: бревна, шины, наклонные заборы, километры колючей проволоки.</p><p>А на сладкое – чучела Рептилоидов в макете Слайдера. Из оружия дадим только лопату, пусть разминаются. Если хотите, можете поприсутствовать лично.</p>',
  options: {
    accept: {
      text: 'Я в новостях посмотрю, спасибо.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 24,
    crystals: 24,
  },
};
