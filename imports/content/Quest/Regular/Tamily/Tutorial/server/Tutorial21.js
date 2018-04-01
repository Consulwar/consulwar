export default {
  id: 'Quest/Regular/Tamily/Tutorial/Tutorial21',
  condition: [
    ['Research/Evolution/Alloy', 25],
  ],
  slides: 2,
  helpers: [

    {
      url: '/game/research/Evolution/Alloy',
      condition: {
        id: 'Building/Residential/Crystal',
        level: 24,
        target: '.cw--BuildResearch .cw--Requirements .cw--Requirements__item[href*="Crystal"] .cw--Requirements__currentLevel_need',
        exists: true,
      },
      target: '.cw--BuildResearch .cw--Requirements .cw--Requirements__item[href*="Crystal"]',
      direction: 'left',
    },

    {
      url: '/game/research/Evolution/Alloy',
      condition: {
        id: 'Building/Residential/Crystal',
        level: 24,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/research/Evolution/Alloy',
      condition: {
        id: 'Research/Evolution/Alloy',
        level: 25,
        target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
        value: 25,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Alloy',
      condition: {
        id: 'Research/Evolution/Alloy',
        level: 25,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
      direction: 'right',
    },


    {
      url: '/game/research/Evolution/Crystallization',
      condition: {
        id: 'Research/Evolution/Crystallization',
        level: 25,
        target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
        value: 25,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/research/Evolution/Crystallization',
      condition: {
        id: 'Research/Evolution/Crystallization',
        level: 25,
      },
      target: '.cw--BuildResearch .cw--BuildResearch__actionAmountCount',
      direction: 'right',
    },


    {
      url: '/game/planet/Residential/Crystal',
      condition: {
        id: 'Research/Evolution/Crystallization',
        level: 25,
        target: '.cw--BuildBuilding .cw--Requirements .cw--Requirements__item[href*="Crystallization"] .cw--Requirements__currentLevel_need',
        exists: true,
      },
      target: '.cw--BuildBuilding .cw--Requirements .cw--Requirements__item[href*="Crystallization"]',
      direction: 'left',
    },

    {
      url: '/game/planet/Residential/Crystal',
      condition: {
        id: 'Research/Evolution/Crystallization',
        level: 25,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },

    {
      url: '/game/planet/Residential/Crystal',
      condition: {
        id: 'Building/Residential/Crystal',
        level: 24,
        target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
        value: 24,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actions .cw--button_type_primary_orange',
      direction: 'left',
    },
    {
      url: '/game/planet/Residential/Crystal',
      condition: {
        id: 'Building/Residential/Crystal',
        level: 24,
      },
      target: '.cw--BuildBuilding .cw--BuildBuilding__actionAmountCount',
      direction: 'right',
    },


    {
      url: '/game/research/Evolution',
      condition: {
        id: 'Research/Evolution/Alloy',
        level: 25,
      },
      target: '.cw--Menu.cw--MenuUnique .cw--Menu__item[href*="Alloy"]',
      direction: 'top',
    },

    {
      url: '/game/research/Fleet',
      target: 'header .menu .second_menu li.Evolution-icon',
      direction: 'bottom',
    },
    {
      url: '',
      target: 'header .main_menu li.research',
      direction: 'bottom',
    },
  ],
  title: 'Исследовать Особые Сплавы 25-го уровня',
  text: '<p>Как вы уже знаете, после 20-го уровня моментально ускорить строительство бесплатно уже не получится. Поэтому, чтобы сократить время строительства, нужно развить такое исследование, как Особые Сплавы. Как минимум до 25-го уровня. Для этого потребуется Шахта Кристалла 24-го уровня, а для неё – Кристаллизация 25-го уровня. Подсказок больше не будет! Такой серьёзный правитель, как вы, справится и без них. </p>',
  options: {
    accept: {
      text: 'Конечно, справится! А где эта Кристаллизация?',
      mood: 'positive',
    },
  },
  reward: {
    humans: 5000,
    metals: 5000,
    crystals: 5000,
  },
};
