export default {
  id: 'Unit/Space/Reptile/Dragon',
  title: 'Дракон',
  description: 'Я Драко-о-он! Простите, Консул, вырвалось… Дракон – довольно мощная машина уничтожения средних кораблей флота. Не могу сказать, что Дракон как-то разительно отличается от иных, подобных ему кораблей, однако это действительно сильный корабль: его урон высок, его броня крепка, а щиты работают бесперебойно, и снять их очень сложно. Сам по себе дракон не очень опасен, небольшая армада Ос вполне может с ним справиться. Проблемы начинаются тогда, когда на вас движется флот Рептилий, где тысячи Драконов. Вот тогда уже становится далеко не до смеха.',
  basePrice: {
    humans: 1500,
    metals: 30000,
    crystals: 10000,
    time: 600,
  },
  characteristics: {
    damage: {
      min: 3200,
      max: 4000,
    },
    life: 11000,
  },
  targets: [
    'Unit/Space/Human/Battleship',
    'Unit/Space/Human/Cruiser',
    'Unit/Space/Human/Frigate',
  ],
};