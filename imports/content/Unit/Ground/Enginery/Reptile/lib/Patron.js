export default {
  id: 'Unit/Ground/Enginery/Reptile/Patron',
  title: 'Покровитель',
  description: 'Покровитель — это своего рода осадное орудие Чешуйчатых. Способен вести огонь как по технике и лётным войскам, так и по пехоте. Для огромного боевого робота обладает крайне высокой манёвренностью, показатели по броне не очень высокие, однако же основные орудия наносят мощнейший урон и способны буквально прожигать даже самые крепкие бронелисты. Будьте внимательны на поле боя, Консул, если на точке присутствует данная техника.',
  basePrice: {
    metals: 8000,
    crystals: 3200,
    humans: 4000,
    time: 7200,
  },
  characteristics: {
    damage: {
      min: 20000,
      max: 25000,
    },
    life: 15000,
  },
  targets: [
    'Unit/Ground/Enginery/Human/Hbhr',
    'Unit/Ground/Enginery/Human/Grandmother',
    'Unit/Ground/Enginery/Human/EasyTank',
  ],
};
