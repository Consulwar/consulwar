export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial16',
  condition: [
    ['Building/Military/Barracks', 20],
    ['Building/Military/Factory', 20],
    ['Building/Military/Airfield', 20],
  ],
  slides: 3,
  title: 'Построить Казармы 20-го уровня, Военный завод 20-го уровня, Военный аэродром 20-го уровня',
  text: '<p>Больше всего Чести можно заработать в космических боях, но быстрее всего – отправляя войска на Землю. Хм... Казармы, Военный завод и Военный аэродром – 20-го уровня каждый. Это сильно поможет в подготовке новобранцев и техники.</p>',
  options: {
    accept: {
      text: 'Эй, не командуй! Надеюсь, эти ваши «наземные войска» будут полезны…',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Ground/Enginery/Agmogedcar': 5,
  },
};
