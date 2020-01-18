export default {
  id: 'Unit/Reptile/Space/Krampus',
  title: 'Крамполёт',
  description: 'Крайне странное и опасное устройство Крампусов напоминает собой обычный корабль с шипами средних размеров. Эти шипы генерируют в себе странную энергию, выбрасывая что-то вроде аннигиляторной сетки, которая окутывает мелкие корабли, после чего те полностью исчезают из нашего мира. Ходят слухи, что таким образом Крампусы воруют маленькие и непослушные корабли, хотя это всего лишь сказки. Впрочем, крупным кораблям тоже стоит остерегаться мощных орудий и высокой манёвренности Крамполётов.',
  basePrice: {
    metals: 0,
    crystals: 0,
  },
  characteristics: {
    weapon: {
      damage: { min: 10000000, max: 15000000 },
      signature: 40,
    },
    health: {
      armor: 7000000,
      signature: 2000,
    },
  },
  targets: [
    'Unit/Human/Space/Railgun',
    'Unit/Human/Space/Reaper',
    'Unit/Human/Space/Gammadrone',
  ],
  opponents: [
    'Unit/Human/Space/Reaper',
    'Unit/Human/Space/Dreadnought',
    'Unit/Human/Space/Gammadrone',
  ],
};
