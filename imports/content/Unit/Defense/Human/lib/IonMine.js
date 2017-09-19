export default {
  id: 'Unit/Defense/Human/IonMine',
  title: 'Ионные Мины',
  description: 'О, это очень крутая штука, Консул. Ионная Мина притягивается к кораблям противника с помощью магнита. После детонации возникает несколько волн, которые воздействуют на корабли Рептилоидов: первая волна пробивает щиты, вторая прошивает корпус, а третья повреждает электронику. Отличный повод построить купол из таких мин вокруг своей планеты.',
  basePrice: {
    credits: 5,
    time: 5,
  },
  characteristics: {
    damage: {
      min: 400,
      max: 500,
    },
    life: 10,
  },
  targets: [
    'Unit/Space/Reptile/Sphero',
    'Unit/Space/Reptile/Blade',
    'Unit/Space/Reptile/Lacertian',
  ],
  requirements() {
    return [
      ['Building/Military/DefenseComplex', 10],
    ];
  },
};
