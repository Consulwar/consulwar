export default {
  id: 'Quest/Regular/NatalyVerlen/AnimalWorld/AnimalWorld25',
  condition: [
    ['Research/Evolution/AnimalWorld', 25],
  ],
  title: 'Исследовать В Мире Животных 25-го уровня',
  text: '<p>Чиновник, о котором пойдёт речь, предложил ввести регламент на показ плохих новостей – не более 10% от общего времени передачи. Редакторы инфопанельных программ в недоумении – ведь они ежедневно получают сводку с фронта на Земле, а также дайджест вылетов флота на цели.</p><p>Получается, что если несколько армейских операций завершились неудачно, то рассказать об этом населению нельзя. Но люди всё равно узнают, Командующий, они же не идиоты. Ну, не совсем идиоты…</p>',
  options: {
    accept: {
      text: 'Как насчёт ввести регламент на дурацкие законы? Скажем, 10%?',
      mood: 'positive',
    },
  },
  reward: {
    metals: 65,
    crystals: 65,
  },
};