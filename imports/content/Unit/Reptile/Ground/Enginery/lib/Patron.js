export default {
  id: 'Unit/Reptile/Ground/Enginery/Patron',
  title: 'Покровитель',
  description: 'Покровитель — это своего рода осадное орудие Чешуйчатых. Способен вести огонь как по технике и лётным войскам, так и по пехоте. Для огромного боевого робота обладает крайне высокой манёвренностью, показатели по броне не очень высокие, однако же основные орудия наносят мощнейший урон и способны буквально прожигать даже самые крепкие бронелисты. Будьте внимательны на поле боя, Консул, если на точке присутствует данная техника.',
  basePrice: {
    metals: 8000,
    crystals: 3200,
    humans: 4000,
    time: 7200,
  },
  characteristics: {
    weapon: {
      damage: { min: 80000, max: 120000 },
      signature: 60,
    },
    health: {
      armor: 200000,
      signature: 90,
    },
  },
  targets: [
    'Unit/Human/Ground/Enginery/Hbhr',
    'Unit/Human/Ground/Enginery/Grandmother',
    'Unit/Human/Ground/Enginery/EasyTank',
  ],
};
