export default {
  id: 'Unit/Human/Defense/IonMine',
  title: 'Ионные Мины',
  description: 'О, это очень крутая штука, Консул. Ионная Мина притягивается к кораблям противника с помощью магнита. После детонации возникает несколько волн, которые воздействуют на корабли Рептилоидов: первая волна пробивает щиты, вторая прошивает корпус, а третья повреждает электронику. Отличный повод построить купол из таких мин вокруг своей планеты.',
  basePrice: {
    credits: 1,
    time: 1 * 3,
  },
  characteristics: {
    weapon: {
      damage: { min: 10, max: 10 },
      signature: 1,
    },
    health: {
      armor: 1,
      signature: 1000,
    },
  },
  targets: [
    'Unit/Reptile/Space/Sphero',
    'Unit/Reptile/Space/Blade',
    'Unit/Reptile/Space/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Residential/Political', 5],
      ['Research/Evolution/Nanotechnology', 5],
    ];
  },
};
