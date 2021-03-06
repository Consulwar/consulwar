export default {
  id: 'Quest/Regular/Tamily/PulseCatcher/PulseCatcher25',
  condition: [
    ['Building/Residential/PulseCatcher', 25],
  ],
  title: 'Построить Импульсный Уловитель 25-го уровня',
  text: '<p>Представляете, правитель, оборудование для регистрации рептилового излучения показывает, что Вселенная сначала расширялась очень быстро. Из-за этого свету, который шёл до нас от очень далёких галактик, пришлось преодолевать значительно большее расстояние, потому что само пространство расползалось в разные стороны с течением времени.</p><p>Именно поэтому мы видим самые дальние объекты почти такого же размера, как ближние – мы видим их там, где их уже давно нет! Разве это не удивительно, Консул?</p>',
  options: {
    accept: {
      text: 'Чего нет? Кто-то опять что-то спёр?!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 350,
    crystals: 350,
  },
};
