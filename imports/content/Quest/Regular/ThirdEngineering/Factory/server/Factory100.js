export default {
  id: 'Quest/Regular/ThirdEngineering/Factory/Factory100',
  condition: [
    ['Building/Military/Factory', 100],
  ],
  title: 'Построить Военный Завод 100-го уровня',
  text: '<p>Огромный Боевой Человекоподобный Робот – это ли не венец творения, Командир? Вопрос риторический, конечно. И теперь мы можем поздравить друг друга с тем, что у нас будет полный боекомплект техники.</p><p>В том числе самой крупной техники в этой галактике. Может, устроим парад? Пусть во всех зданиях планеты подпрыгивают тарелки и ложки, пока наши полки стройными рядами маршируют в сторону десантных кораблей!</p>',
  options: {
    accept: {
      text: 'Да! А я вам платочком помашу.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 9000,
    crystals: 9000,
  },
};
