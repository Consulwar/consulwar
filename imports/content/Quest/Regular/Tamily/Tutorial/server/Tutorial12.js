export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial12',
  condition: [
    ['Research/Evolution/Drill', 20],
    ['Research/Evolution/Crystallization', 20],
    ['Research/Evolution/Energy', 20],
  ],
  title: 'Исследовать Бурильный Бур 20-го уровня, Кристаллизацию 20-го уровня, Энергетику 20-го уровня',
  text: '<p>Добавим еще одно исследование к тем, что уже есть – Энергетику. И добьем развитие Бурильного Бура и Кристаллизации до 20-уровня. И Энергетику вместе с ними.</p>',
  options: {
    accept: {
      text: 'Я назову эту игру «Докачайся до 20-го уровня, детка».',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Space/Wasp': 10,
  },
};
