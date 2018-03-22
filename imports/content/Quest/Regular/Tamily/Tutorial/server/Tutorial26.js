export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial26',
  condition: [
    ['Unit/Human/Defense/LaserTurret', 25],
  ],
  slides: 3,
  title: 'Построить 25 оборонных орудий «Лазерная Турель»',
  text: '<p>Как вы уже догадались, в нашей вселенной в ходу специальная валюта – ГГК (Грязные Галактические Кредиты). Их можно купить за валюту вашей вселенной, она очень ценится в нашем мире. Совет Галактики выдал вам еще 150 ГГК. Купите на них 25 Лазерных турелей для обороны планеты. И не забывайте развивать здания и исследования и воевать с рептилиями!</p>',
  options: {
    accept: {
      text: 'Зелёный ресурс – это донат-валюта. Окей.',
      mood: 'positive',
    },
  },
  reward: {
    'Unit/Human/Space/Gammadrone': 10,
    'Unit/Human/Space/Wasp': 25,
    'Unit/Human/Space/Mirage': 10,
    'Unit/Human/Space/Frigate': 1,
  },
};
