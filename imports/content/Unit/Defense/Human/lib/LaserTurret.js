export default {
  id: 'Unit/Defense/Human/LaserTurret',
  title: 'Лазерная Турель',
  description: 'Лазерные Турели — это следующая модификация обычных Турелей, принцип действия тот же. Находясь в отдалённой точке космоса, эти орудия способны крайне быстро и эффективно уничтожать небольшие корабли противника, ухитрившиеся подобраться слишком близко к вашей планете. Очень полезная штука, Консул.',
  basePrice: {
    credits: 5,
    time: 20 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 25, max: 35 },
      signature: 90,
    },
    health: {
      armor: 200,
      signature: 45,
    },
  },
  targets: [
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Lacertian',
    'Unit/Space/Reptile/Wyvern',
  ],
  requirements() {
    return [
      ['Building/Residential/House', 10],
    ];
  },
};
