export default {
  id: 'Quest/Regular/ThirdEngineering/Laboratory/Laboratory45',
  condition: [
    ['Building/Military/Laboratory', 45],
  ],
  title: 'Построить Лабораторию 45-го уровня',
  text: '<p>Интересные новости из Лаборатории, Командир! Учёные пристально наблюдали за процессом бурения в Шахте Металла и, по мере погружения Бура в недра планеты, ставили на него всё новые и новые датчики и приборы.</p><p>Теперь эти исследования принесли практическую пользу: с помощью данных, полученных при бурении, учёным удалось установить паттерн распространения сейсмических волн. Мы можем предсказывать землетрясения с точностью до километра! Лаборатория жжёт.</p>',
  options: {
    accept: {
      text: 'Ладно, дайте им там премию углём и шашлыками.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 1500,
    crystals: 1500,
  },
};
