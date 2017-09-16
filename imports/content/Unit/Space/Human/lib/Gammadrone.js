export default {
  id: 'Unit/Space/Human/Gammadrone',
  title: 'Гаммадрон',
  description: 'Гаммадроны – это шустрые беспилотные убийцы. Их задачи – ловить на себя часть урона и уничтожать небольшие быстрые корабли Рептилоидов. Конечно, имея целый рой таких аппаратов, можно навалять даже самому крупному кораблю. Но, наверное, это всё же не самая лучшая тактика. Хотя кто знает, Консул, всё зависит только от вас. Тем не менее гаммадроны – дешёвые и крайне полезные единицы.',
  basePrice: {
    metals: 600,
    crystals: 250,
    time: 30,
  },
  characteristics: {
    damage: {
      min: 80,
      max: 100,
    },
    life: 200,
  },
  targets: [
    'Unit/Space/Reptile/Sphero',
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Military/Shipyard', 1],
    ];
  },
};
