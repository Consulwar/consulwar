export default {
  id: 'Quest/Regular/ThirdEngineering/Laboratory/Laboratory100',
  condition: [
    ['Building/Military/Laboratory', 100],
  ],
  title: 'Построить Лабораторию 100-го уровня',
  text: '<p>Осталось совсем немного до полной комплектации Лаборатории, Командир! И у генетиков есть проект, как говорится, под занавес: они изловчились и к сотому уровню как раз соберут урожай экзотических фруктов, которые мирно созревали у нас под носом в экспериментальной теплице.</p><p>Вы когда-нибудь ели банан со вкусом клубники? Генетики обещают какое-то страшное разнообразие видов, и я лично хочу всё попробовать.</p>',
  options: {
    accept: {
      text: 'Тащите столы ко мне, у меня осталась пара бутылок самогона. Ваш Консул тоже кое-что умеет.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4800,
    crystals: 4800,
  },
};
