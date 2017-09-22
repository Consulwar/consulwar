export default {
  id: 'Quest/Regular/NatalyVerlen/Engineering/Engineering40',
  condition: [
    ['Research/Evolution/Engineering', 40],
  ],
  title: 'Исследовать Оборонную Инженерию 40-го уровня',
  text: '<p>У Третьего Инженерного возникли некоторые затруднения с зарядами для новых Снайпер-ганов, Командующий, и вы об этом наверняка уже слышали. Пока его инженеры облачают каждую пушку в газовый кокон, чтобы предотвратить обратное движение заряда, мы потихоньку начинаем укреплять броню основания.</p><p>Во-первых, это поможет отражать урон, а во-вторых, у нас осталось довольно много лишних материалов от прошлых модернизаций. Не пропадать же добру.</p>',
  options: {
    accept: {
      text: 'Экономия! Моё любимое слово после слова «кристаллы».',
      mood: 'positive',
    },
  },
  reward: {
    metals: 110,
    crystals: 110,
  },
};
