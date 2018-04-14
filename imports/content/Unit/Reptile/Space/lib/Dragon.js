export default {
  id: 'Unit/Reptile/Space/Dragon',
  title: 'Дракон',
  description: 'Я Драко-о-он! Простите, Консул, вырвалось… Дракон – довольно мощная машина уничтожения средних кораблей флота. Не могу сказать, что Дракон как-то разительно отличается от иных, подобных ему кораблей, однако это действительно сильный корабль: его урон высок, его броня крепка, а щиты работают бесперебойно, и снять их очень сложно. Сам по себе дракон не очень опасен, небольшая армада Ос вполне может с ним справиться. Проблемы начинаются тогда, когда на вас движется флот Рептилий, где тысячи Драконов. Вот тогда уже становится далеко не до смеха.',
  basePrice: {
    metals: 17500,
    crystals: 5800,
  },
  characteristics: {
    weapon: {
      damage: { min: 6750, max: 8250 },
      signature: 420,
    },
    health: {
      armor: 16000,
      signature: 600,
    },
  },
  targets: [
    'Unit/Human/Space/Carrier',
    'Unit/Human/Space/Frigate',
    'Unit/Human/Space/Gammadrone',
  ],
  opponents: [
    'Unit/Human/Space/Dreadnought',
    'Unit/Human/Space/Railgun',
    'Unit/Human/Space/Reaper',
  ],
};
