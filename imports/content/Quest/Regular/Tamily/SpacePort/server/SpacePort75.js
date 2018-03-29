export default {
  id: 'Quest/Regular/Tamily/SpacePort/SpacePort75',
  condition: [
    ['Building/Residential/SpacePort', 75],
  ],
  title: 'Построить Космопорт 75-го уровня',
  text: '<p>Прибыл рапорт от Службы Космопорта о спутнике, дрейфующем вблизи нашей планеты, правитель. Судя по состоянию аппарата, он долго был в глубоком космосе. Несмотря на это, электроника подаёт признаки жизни, удалось даже расшифровать записи разговоров какого-то Саймона.</p><p>Зачем эти записи были помещены на спутник,и что означает надпись Pathos II, так и осталось загадкой. Но Служба сработала хорошо, и я предлагаю увеличить им персонал и расходные средства.</p>',
  options: {
    accept: {
      text: 'Сообщите «записям» Саймона, что человечество не погибло. Только аккуратно, он та ещё истеричка.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4000,
    crystals: 4000,
  },
};
