export default {
  id: 'Quest/Regular/ThirdEngineering/DefenseComplex/DefenseComplex50',
  condition: [
    ['Building/Military/DefenseComplex', 50],
  ],
  title: 'Построить Оборонный комплекс 50-го уровня',
  text: '<p>Командир, вы гений! И это не лесть, а научный факт: мы проконсультировались с Натали, и действительно убедились в том, что существует эффект обратного движения заряженной плазмы.</p><p>И хотя до сих пор нет теорий, объясняющих этот феномен, справиться с его последствиями всё-таки можно: достаточно стрелять из пушки не в вакууме, а в газовой среде. Чтобы этого достичь с минимальными затратами, нам нужно просто создать пузырь, который будет накачиваться газом во время разгона снаряда.</p>',
  options: {
    accept: {
      text: 'В презервативы, значит, оденете пушки. Нормальная такая идея.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 700,
    crystals: 700,
  },
};
