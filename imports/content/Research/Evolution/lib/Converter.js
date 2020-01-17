export default {
  id: 'Research/Evolution/Converter',
  title: 'Преобразователь плазмоидов',
  description: 'Технология преобразования плазмоидов — это, что называется, технология нового времени. Учёные только начинают разбираться в этой новой области. И пока ещё не совсем понятно, как работают сами плазмоиды, однако же это крайне важные элементы, которые помогают нам в развитии науки, техники и всего остального. Думаю, не стоит скупиться на такие полезные технологии, Консул. А вы как считаете?',
  effects: {
    Price: [
      {
        textBefore: 'Флот стоит на ',
        textAfter: '% дешевле',
        condition: 'Unit/Human/Space',
        priority: 2,
        affect: ['metals', 'crystals'],
        result({ level }) {
          return (level * 0.2);
        },
      },
    ],
  },
  basePrice: {
    group: 'fleet',
    tier: 3,
    humans: 20,
    metals: 120,
    crystals: 30,
    honor: 65,
  },
  plasmoidDuration: 60 * 60 * 24 * 14,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Military/Laboratory', 29],
      ];
    } else if (level < 40) {
      return [
        ['Building/Military/Laboratory', 38],
        ['Building/Military/Gates', 10],
      ];
    } else if (level < 60) {
      return [
        ['Building/Military/Laboratory', 47],
        ['Building/Military/Gates', 20],
      ];
    } else if (level < 80) {
      return [
        ['Building/Military/Laboratory', 57],
        ['Building/Military/Gates', 40],
        ['Research/Evolution/Nanotechnology', 55],
      ];
    }
    return [
      ['Building/Military/Laboratory', 65],
      ['Building/Military/Gates', 49],
      ['Research/Evolution/Nanotechnology', 72],
    ];
  },
};
