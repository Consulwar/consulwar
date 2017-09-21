export default {
  id: 'Quest/Regular/ThirdEngineering/PowerStation/PowerStation95',
  condition: [
    ['Building/Military/PowerStation', 95],
  ],
  title: 'Построить Электростанцию 95-го уровня',
  text: '<p>Благодаря всё увеличивающейся мощности Электростанции, Командир, Лаборатория развила небывалую активность. Учёные смогли не только оснастить гипердвигателями весь ваш звёздный флот, но и разработать несколько усовершенствований, которые впоследствии помогут значительно ускорить разгон и торможение ваших флотилий.</p><p>Я вижу в этом заслугу и наших инженеров, которые обеспечили энергией все отделы лаборатории и свели энергопотоки в единую сеть, работающую для блага науки.</p>',
  options: {
    accept: {
      text: 'Ну ладно, дай им выходной, раз они такие герои.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 28,
    crystals: 28,
  },
};
