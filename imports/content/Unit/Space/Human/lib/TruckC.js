export default {
  id: 'Unit/Space/Human/TruckC',
  title: 'Трак C',
  description: 'Траки не обладают серьёзным вооружением, и могут сбить разве что парочку дронов. Но надо понимать, что Траки – это небоевые корабли, они нужны для того, чтобы собирать полезный лом после боя. Трюмы у обычных кораблей гораздо больше, однако трак имеет особые системы сканирования и технические устройства, благодаря которым только он может находить среди лома уничтоженных кораблей небольшие, но рабочие и полезные элементы. Так или иначе, имея Траки в своём флоте, вы получите больше ресурсов после победы.',
  basePrice: {
    humans: 150,
    metals: 150,
    crystals: 30,
    time: 1200,
  },
  power: 0,
  characteristics: {
    damage: {
      min: 2500,
      max: 2500,
    },
    life: 2500,
  },
  targets: [
    'Unit/Space/Reptile/Sphero',
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Military/Airfield', 30],
      ['Building/Military/Shipyard', 25],
    ];
  },
};
