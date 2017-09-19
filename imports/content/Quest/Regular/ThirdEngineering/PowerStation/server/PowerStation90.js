export default {
  id: 'Quest/Regular/ThirdEngineering/PowerStation/PowerStation90',
  condition: [
    ['Building/Military/PowerStation', 90],
  ],
  title: 'Построить Электростанцию 90-го уровня',
  text: '<p>Работы в военном районе почти завершены, Командир. Все военные здания объединены в мощную энергосеть, а Врата и Бездна стабильно функционируют в отведённом им диапазоне. При увеличении мощности Электростанции наша сеть покроет собой весь район.</p><p>Больше не будет досадных перебоев с энергией, а исследования в Лаборатории пойдут ещё задорнее, ведь у белых халатов больше не будет проблем с кофемашинами и центрифугами.</p>',
  options: {
    accept: {
      text: 'И мне кофейку налей, а я пока попинаю твоих инженеров.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 2600,
    crystals: 2600,
  },
};
