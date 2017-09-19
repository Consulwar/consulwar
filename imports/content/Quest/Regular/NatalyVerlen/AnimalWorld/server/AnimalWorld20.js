export default {
  id: 'Quest/Regular/NatalyVerlen/AnimalWorld/AnimalWorld20',
  condition: [
    ['Research/Evolution/AnimalWorld', 20],
  ],
  title: 'Исследовать В Мире Животных 20-го уровня',
  text: '<p>У нас наметился очередной кандидат на экзекуцию, Консул, а именно чиновник, который предложил вручить всем свободным жителям по лазерной винтовке и отправить их на отстрел перелётных птиц, потому что он-де где-то вычитал, что птицы переносят очень опасные заболевания для человека.</p><p>Галлюцинации такой силы нужно отметить особо, Командующий! Я предлагаю вручить ему ручной гранатомёт и послать на линию фронта отстреливать низколетящие амфизбены.</p>',
  options: {
    accept: {
      text: 'Ну ты и садистка, Натали! Наш человек!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 6000,
    crystals: 6000,
  },
};
