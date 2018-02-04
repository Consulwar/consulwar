export default {
  id: 'Building/Residential/Political',
  title: 'Политический центр',
  description: 'Ох, политика, политика… Казалось бы, кому нужны политики, когда есть единый правитель, император, его величество Консул! Однако же в мире столько вопросов, требующих внимания, а у великого правителя так мало времени. Не лучше ли, чтобы этим занимались маленькие никчёмные людишки в костюмах? Сидели там себе в кабинетах и спорили о том, в каком районе города установить новый светофор, пока вы, Консул, будете решать, в каком районе Земли высаживать войска для битвы с Рептилоидами. Тем не менее при всей своей никчёмности политики – довольно хитрые задницы, и могут приносить реальную пользу вашему делу путём добычи небольшого количества Грязных Галактических Кредитов. А вот это уже кое-что. Согласитесь, Консул.',
  effects: {
    Income: [
      {
        textBefore: 'Приносит ',
        textAfter: ' грязных галактических кредитов в час',
        priority: 1,
        affect: 'credits',
        result(level) {
          return (level * 0.5) / 24;
        },
      },
    ],
    ProfitOnce: [
      {
        // Пример заполнения единоразового бонуса
        // Сейчас существуют три варианта поля affect
        // ------------------------------------------
        // resources.название
        // units.группа.название
        // votePower
        // ------------------------------------------
        textBefore: 'Единоразовый бонус ',
        textAfter: ' ГГК',
        affect: 'resources.credits',
        result(level) {
          switch (level) {
            case 20:
              return 500;
            case 40:
              return 1000;
            case 60:
              return 1500;
            case 80:
              return 2000;
            case 100:
              return 2500;
            default:
              return 0;
          }
        },
      },
    ],
  },
  basePrice(level = this.getCurrentLevel()) {
    const price = {
      metals: [25, 'slowExponentialGrow', 0],
      crystals: [30, 'slowExponentialGrow', 0],
    };

    if (level > 19) {
      price.honor = [8, 'slowLinearGrow', 20];
    }

    if (level < 20) {
      price.humans = [100, 'slowLinearGrow', 0];
    } else if (level < 40) {
      // no changes
    } else if (level < 60) {
      price.keanureevesium = [4, 'slowLinearGrow', 40];
    } else if (level < 80) {
      price.AncientArtifact = [3, 'slowLinearGrow', 60];
    } else {
      price.RubyPlasmoid = [8, 'slowLinearGrow', 80];
    }
    return price;
  },
  maxLevel: 100,
  requirements(level = this.getCurrentLevel()) {
    if (level < 20) {
      return [
        ['Research/Evolution/AnimalWorld', 9],
      ];
    } else if (level < 40) {
      return [
        ['Research/Evolution/AnimalWorld', 27],
        ['Building/Residential/Entertainment', 30],
      ];
    } else if (level < 60) {
      return [
        ['Research/Evolution/AnimalWorld', 42],
        ['Building/Residential/Entertainment', 48],
      ];
    } else if (level < 80) {
      return [
        ['Research/Evolution/AnimalWorld', 70],
        ['Building/Residential/Entertainment', 72],
        ['Research/Evolution/Ikea', 80],
      ];
    }
    return [
      ['Research/Evolution/AnimalWorld', 90],
      ['Building/Residential/Entertainment', 90],
      ['Research/Evolution/Ikea', 95],
    ];
  },
};
