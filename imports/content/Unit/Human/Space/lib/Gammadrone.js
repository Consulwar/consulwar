export default {
  id: 'Unit/Human/Space/Gammadrone',
  title: 'Гаммадрон',
  description: 'Гаммадроны – это шустрые беспилотные убийцы. Их задачи – ловить на себя часть урона и уничтожать небольшие быстрые корабли Рептилоидов. Конечно, имея целый рой таких аппаратов, можно навалять даже самому крупному кораблю. Но, наверное, это всё же не самая лучшая тактика. Хотя кто знает, Консул, всё зависит только от вас. Тем не менее гаммадроны – дешёвые и крайне полезные единицы.',
  basePrice: {
    metals: 62,
    crystals: 16,
    time: 5 * 60 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 1, max: 1 },
      signature: 8,
    },
    health: {
      armor: 24,
      signature: 8,
    },
  },
  targets: [
    'Unit/Reptile/Space/Wyvern',
    'Unit/Reptile/Space/Dragon',
    'Unit/Reptile/Space/Hydra',
  ],
  requirements() {
    return [
      ['Building/Residential/SpacePort', 35],
      ['Building/Military/DefenseComplex', 44],
      ['Research/Evolution/Nanotechnology', 10],
    ];
  },
};
