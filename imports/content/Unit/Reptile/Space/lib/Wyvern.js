export default {
  id: 'Unit/Reptile/Space/Wyvern',
  title: 'Виверна',
  description: 'Виверна достаточно быстроходный крейсер зелёных чешуйчатых пиздюков, этот корабль – олицетворение их наглости и коварства. Тактика Рептилоидных адмиралов обычно строится вокруг способности Виверны на высокой скорости заходить на атаку с незащищённых областей, наносить серьёзный урон и снова скрываться в тени своего флота. Как ужас, летящий на крыльях ночи, Виверна появляется из ниоткуда и уходит в никуда, появляясь и нанося удары в самых неожиданных местах.',
  basePrice: {
    metals: 5500,
    crystals: 1500,
  },
  characteristics: {
    weapon: {
      damage: { min: 1260, max: 1540 },
      signature: 120,
    },
    health: {
      armor: 2000,
      signature: 80,
    },
  },
  targets: [
    'Unit/Human/Space/Frigate',
    'Unit/Human/Space/Cruiser',
    'Unit/Human/Space/Battleship',
  ],
  opponents: [
    'Unit/Human/Space/Gammadrone',
    'Unit/Human/Space/Carrier',
    'Unit/Human/Space/Railgun',
  ],
};
