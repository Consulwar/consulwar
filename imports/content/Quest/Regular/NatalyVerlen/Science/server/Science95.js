export default {
  id: 'Quest/Regular/NatalyVerlen/Science/Science95',
  condition: [
    ['Research/Evolution/Science', 95],
  ],
  title: 'Исследовать Научный Отдел 95-го уровня',
  text: '<p>И снова Научный Отдел бросает вызов природе, Консул. На этот раз речь идёт о регенерации. Как вы наверняка знаете, есть некоторые типы животных, которые могут отрастить заново потерянную часть тела вроде хвоста или конечности.</p><p>Наша лаборатория занимается изучением этих процессов и, возможно, в ближайшем будущем у нас появится технология, которая позволит выращивать органы и части тела. Хотя что-то мне подсказывает, что Третий от своей железной руки все равно не откажется.</p>',
  options: {
    accept: {
      text: 'Да, я бы тоже не отказался. Но руку отпиливать мне не надо, Натали.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 105,
    crystals: 105,
  },
};