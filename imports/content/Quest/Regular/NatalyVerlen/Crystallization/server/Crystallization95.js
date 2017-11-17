export default {
  id: 'Quest/Regular/NatalyVerlen/Crystallization/Crystallization95',
  condition: [
    ['Research/Evolution/Crystallization', 95],
  ],
  title: 'Исследовать Кристаллизацию 95-го уровня',
  text: '<p>Почти все учёные в нашей Лаборатории занимаются проблемой жидких кристаллов, Консул, и они уже близки к тому, чтобы совершить прорыв в этой области науки. Не хватает самой малости – воспроизводимых результатов. Допустим, один из учёных заявляет, что совершил открытие, однако этого мало.</p><p>Нужно, чтобы другие учёные повторили его эксперимент и подтвердили, что технология стабильно работает и не зависит ни от места проведения эксперимента, ни от времени, ни от фазы луны. На такие испытания тоже нужны средства.</p>',
  options: {
    accept: {
      text: 'А раздача слонов может зависеть от фазы луны?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 125,
    crystals: 125,
  },
};