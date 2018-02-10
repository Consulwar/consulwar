export default {
  id: 'Unit/Human/Defense/LaserTurret',
  title: 'Лазерная Турель',
  description: 'Лазерные Турели — это следующая модификация обычных Турелей, принцип действия тот же. Находясь в отдалённой точке космоса, эти орудия способны крайне быстро и эффективно уничтожать небольшие корабли противника, ухитрившиеся подобраться слишком близко к вашей планете. Очень полезная штука, Консул.',
  basePrice: {
    credits: 5,
  },
  decayTime: 60 * 60,
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
    'Unit/Reptile/Space/Blade',
    'Unit/Reptile/Space/Lacertian',
    'Unit/Reptile/Space/Wyvern',
  ],
  requirements() {
    return [
      ['Building/Residential/House', 10],
    ];
  },
};
