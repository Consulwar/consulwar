export default {
  id: 'Quest/Regular/ThirdEngineering/PowerStation/PowerStation75',
  condition: [
    ['Building/Military/PowerStation', 75],
  ],
  title: 'Построить Электростанцию 75-го уровня',
  text: '<p>Несмотря на повышение мощности Электростанции, остаётся ещё проблема Бездны. Её ведь нельзя включать и выключать, как лампочку. Поэтому инженеры постоянно работают над тем, чтобы держать наш мир и мир Бездны стабильно соединёнными, а не перемешанными, например.</p><p>Тем более, что именно наш мир будет поглощён без остатка в случае провала энергетического баланса. В наших интересах сделать инфраструктуру этого объекта как можно более стабильной, Командир.</p>',
  options: {
    accept: {
      text: 'Я готов поддержать баланс, если что.',
      mood: 'positive',
    },
  },
  reward: {
    metals: 4000,
    crystals: 4000,
  },
};
