export default {
  id: 'Quest/Regular/ThirdEngineering/Barracks/Barracks75',
  condition: [
    ['Building/Military/Barracks', 75],
  ],
  title: 'Построить Казармы 75-го уровня',
  text: '<p>Доброго дня вам, Командир. Как вы знаете, Псионики очень важны для остальной части армии, даже если армия это отрицает. Но возить их в одном корабле с остальной пехотой нежелательно, потому что обычные пехотинцы их… Ну, побаиваются.</p><p>Так что мы выпросили у Аэродрома старенькую Бабулю – будем выбрасывать Псиоников сразу на точку высадки, чтоб никого не нервировать. Готовы к приступить к испытаниям по вашему приказу.</p>',
  options: {
    accept: {
      text: 'Кучно бросайте, кучно!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 56,
    crystals: 56,
  },
};