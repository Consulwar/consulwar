export default {
  id: 'Quest/Regular/ThirdEngineering/DefenseComplex/DefenseComplex1',
  condition: [
    ['Building/Military/DefenseComplex', 1],
  ],
  title: 'Построить Оборонный комплекс 1-го уровня',
  text: '<p>Теперь, когда ваш звёздный флот бороздит космические просторы… ваши инженерные войска всё ещё копаются в земле. Вы не представляете, Командир, как мне надоело выслушивать всякие дурацкие шуточки в свой адрес. И я твёрдо решил, что оборонительные сооружения я буду возводить лично.</p><p>Ну, то есть не совсем лично, но в космосе! И мы будем устраивать реальные испытания ваших планетарных заслонов. В конце концов, никто не может остановить меня, когда я просто хочу хорошо сделать свою работу.</p>',
  options: {
    accept: {
      text: 'Да, собственно, никто и не пытается.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 8,
    crystals: 8,
  },
};