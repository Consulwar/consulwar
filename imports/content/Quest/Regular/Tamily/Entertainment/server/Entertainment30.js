export default {
  id: 'Quest/Regular/Tamily/Entertainment/Entertainment30',
  condition: [
    ['Building/Residential/Entertainment', 30],
  ],
  title: 'Построить Центр Развлечений 30-го уровня',
  text: '<p>Мне прислали совершенно безумный проект для Центра Развлечений, правитель. Инженеры хотят построить там новый музей, но какой! Согласно чертежам, это будет прозрачная труба, ведущая по дну ближайшего залива. Люди смогут увидеть настоящий подводный мир своими глазами, а не на экране инфопанели, Консул. Это будет совершенно изумительное ощущение, я уверена. Мне самой не терпится попасть в этот музей, но, разумеется, это станет возможно только если вы одобрите проект подводного тоннеля.</p>',
  options: {
    accept: {
      text: 'Хм, почему бы и нет? Я сам люблю поглазеть на всяких гадов, а связь с Советом что-то забарахлила.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 400,
    crystals: 400,
  },
};
