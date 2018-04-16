export default {
  id: 'Research/Fleet/Mirage',
  title: 'Усиление Миража',
  description: 'Мираж разрабатывался как корабль-невидимка, но, к сожалению, на все 100% этого достичь не удалось, и вряд ли удастся в ближайшее время. Однако, чем больше средств будет направлено на разработку усилений и улучшений данного корабля, тем мощнее будет его вооружение, его броня, а самое главное – его система «стелс». Таким образом, Мираж сможет избегать урона во время атаки, при этом сам будет неукоснительно карать своих врагов.',
  effects: {
    Military: [
      {
        textBefore: 'Урон Миража +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Mirage',
        priority: 2,
        affect: 'damage',
        result({ level }) {
          return level * 0.4;
        },
      },
      {
        textBefore: 'Броня Миража +',
        textAfter: '%',
        condition: 'Unit/Human/Space/Mirage',
        priority: 2,
        affect: 'life',
        result({ level }) {
          return level * 0.4;
        },
      },
    ],
  },
  basePrice() {
    return {
      honor: [20, 'slowExponentialGrow', 0],
    };
  },
  maxLevel: 100,
  requirements() {
    return [
      ['Building/Residential/SpacePort', 45],
      ['Building/Military/Airfield', 45],
      ['Research/Evolution/Nanotechnology', 20],
    ];
  },
};
