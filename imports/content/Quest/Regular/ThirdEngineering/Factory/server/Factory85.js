export default {
  id: 'Quest/Regular/ThirdEngineering/Factory/Factory85',
  condition: [
    ['Building/Military/Factory', 85],
  ],
  title: 'Построить Военный Завод 85-го уровня',
  text: '<p>Авиация, конечно, сильно отличается от танка – хотя бы тем, что Ксинолёты не могут эффективно противостоять зениткам противника. И им нужна маскировка – ведь у Рептилоидов, помимо наземной, есть и воздушная разведка.</p><p>Наши инженеры только что начали наносить маскирующий состав на все выдающиеся части Ксинолётов, и я уже предчувствую, что краски понадобится неприлично много.</p>',
  options: {
    accept: {
      text: 'Ох уж эти твои эвфемизмы!',
      mood: 'positive',
    },
  },
  reward: {
    metals: 80,
    crystals: 80,
  },
};