export default {
  id: 'Unit/Defense/Human/LaserTurret',
  title: 'Лазерная Турель',
  description: 'Лазерные Турели — это следующая модификация обычных Турелей, принцип действия тот же. Находясь в отдалённой точке космоса, эти орудия способны крайне быстро и эффективно уничтожать небольшие корабли противника, ухитрившиеся подобраться слишком близко к вашей планете. Очень полезная штука, Консул.',
  basePrice: {
    credits: 50,
    time: 60,
  },
  characteristics: {
    damage: {
      min: 1200,
      max: 1500,
    },
    life: 5000,
  },
  targets: [
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Lacertian',
    'Unit/Space/Reptile/Wyvern',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 30],
      ['Research/Evolution/Engineering', 20],
    ];
  },
};
