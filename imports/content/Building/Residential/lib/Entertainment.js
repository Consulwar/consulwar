export default {
  id: 'Building/Residential/Entertainment',
  title: 'Центр развлечений',
  description: 'Земля захвачена, правительство уничтожено, погибли миллиарды людей, оставшиеся колонии постоянно подвергаются нападениям со стороны Рептилоидов, еноты-разведчики приносят дурные вести о растущих армиях рептилий, новая власть в виде Консулов требует полного подчинения… При таких обстоятельствах немудрено и ебануться. Но ситуацию легко исправят блэкджек и шлюхи! Центры развлечений могут принести много удовольствия не только вашим подданным, но и вам, Консул.',
  effects: {
    Price: [
      {
        textBefore: 'Всё требует на ',
        textAfter: '% меньше людей',
        priority: 2,
        affect: 'humans',
        result({ level }) {
          return level * 0.2;
        },
      },
    ],
  },
  basePrice: {
    group: 'aviation',
    tier: 2,
    humans: 3,
    metals: 3,
    crystals: 10,
    honor: 15,
  },
  plasmoidDuration: 60 * 60 * 24 * 28,
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Building/Residential/House', 15],
      ];
    } else if (level < 40) {
      return [
        ['Building/Residential/House', 30],
        ['Research/Evolution/AnimalWorld', 18],
      ];
    } else if (level < 60) {
      return [
        ['Building/Residential/House', 50],
        ['Research/Evolution/AnimalWorld', 32],
      ];
    } else if (level < 80) {
      return [
        ['Building/Residential/House', 72],
        ['Research/Evolution/AnimalWorld', 46],
        ['Research/Evolution/Crystallization', 60],
      ];
    }
    return [
      ['Building/Residential/House', 92],
      ['Research/Evolution/AnimalWorld', 80],
      ['Research/Evolution/Crystallization', 75],
    ];
  },
};
