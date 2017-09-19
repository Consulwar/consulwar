export default {
  id: 'Quest/Regular/ThirdEngineering/Barracks/Barracks65',
  condition: [
    ['Building/Military/Barracks', 65],
  ],
  title: 'Построить Казармы 65-го уровня',
  text: '<p>Мы долго думали, Командир, как лучше тренировать Псиоников. Нельзя же кипятить мозги другим солдатам, этак у вас вообще никакой армии не останется. Поэтому мы попросили Лабораторию сделать датчики псиотического излучения, совмещённые со взрывным устройством малой мощности, и прикрутили их под каски чучел Рептилоидов.</p><p>Как только излучение достигает пика - бац! - голова у чучела взрывается. Эффектно! Готовы оснастить такими «снарядами» весь полигон.</p>',
  options: {
    accept: {
      text: 'А можно поставить одно в мою палату? Я тоже потренируюсь.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4800,
    crystals: 4800,
  },
};
